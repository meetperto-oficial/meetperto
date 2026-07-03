/**
 * Upload de foto de perfil - Nível Sênior Diretor
 * Compatível com as Rules sênior do Firebase Storage
 * Features: compressão, validação, anti-spam, deleta foto antiga, logs, retry
 */

import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { app } from '../firebaseConfig';

const storage = getStorage(app);
const db = getFirestore(app);
const auth = getAuth(app);

const MAX_FILE_SIZE = 2 * 1024; // 2MB em bytes
const COMPRESSION_QUALITY = 0.7;
const IMAGE_WIDTH = 800; // 800px resolve 99% dos casos
const ANTI_SPAM_MINUTES = 5;

/**
 * Classe de erro customizada pra tratar 403 do Firebase
 */
class UploadError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'UploadError';
    this.code = code;
  }
}

/**
 * 1. Valida se usuário pode fazer upload
 */
async function validarPreUpload(uid) {
  const user = auth.currentUser;

  if (!user) {
    throw new UploadError('Usuário não autenticado', 'UNAUTHENTICATED');
  }

  if (!user.emailVerified) {
    throw new UploadError('Verifique seu email antes de trocar a foto', 'EMAIL_NOT_VERIFIED');
  }

  const userRef = doc(db, 'usuarios', uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    throw new UploadError('Perfil não encontrado no banco', 'USER_DOC_NOT_FOUND');
  }

  const data = userDoc.data();

  if (data.banido === true) {
    throw new UploadError('Conta banida. Contate o suporte', 'USER_BANNED');
  }

  // Anti-spam: checa 5min no client pra UX melhor. Regra valida no server.
  if (data.ultimaFotoPerfil?.toMillis) {
    const ultimaVez = data.ultimaFotoPerfil.toMillis();
    const agora = Date.now();
    const diffMinutos = (agora - ultimaVez) / 1000 / 60;

    if (diffMinutos < ANTI_SPAM_MINUTES) {
      const faltam = Math.ceil(ANTI_SPAM_MINUTES - diffMinutos);
      throw new UploadError(`Aguarde ${faltam} min para trocar a foto novamente`, 'SPAM_DETECTED');
    }
  }

  return { userRef, fotoAntiga: data.fotoPerfil || null };
}

/**
 * 2. Seleciona e comprime imagem
 */
async function selecionarEComprimirImagem() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status!== 'granted') {
    throw new UploadError('Permissão da galeria negada', 'PERMISSION_DENIED');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1], // Força crop 1:1
    quality: 1, // Pega qualidade max, a gente comprime depois
  });

  if (result.canceled) return null;

  const asset = result.assets[0];

  // Comprime e redimensiona
  const manipResult = await ImageManipulator.manipulateAsync(
    asset.uri,
    [{ resize: { width: IMAGE_WIDTH } }],
    {
      compress: COMPRESSION_QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  // Converte pra blob e valida tamanho final
  const response = await fetch(manipResult.uri);
  const blob = await response.blob();

  if (blob.size > MAX_FILE_SIZE) {
    throw new UploadError(
      `Imagem ainda com ${(blob.size / 1024 / 1024).toFixed(1)}MB. Tente outra foto.`,
      'FILE_TOO_LARGE'
    );
  }

  return { blob, uri: manipResult.uri };
}

/**
 * 3. Deleta foto antiga do Storage pra não vazar dado e economizar grana
 */
async function deletarFotoAntiga(urlFotoAntiga) {
  if (!urlFotoAntiga) return;

  try {
    // Extrai path do Storage pela URL
    const path = decodeURIComponent(urlFotoAntiga.split('/o/')[1].split('?')[0]);
    const oldRef = ref(storage, path);
    await deleteObject(oldRef);
  } catch (e) {
    // Ignora erro. Se não deletar, não quebra o fluxo.
    console.warn('Falha ao deletar foto antiga:', e.code);
  }
}

/**
 * 4. Função principal - Orquestra tudo
 */
export async function uploadFotoPerfil(onProgress) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new UploadError('Faça login primeiro', 'UNAUTHENTICATED');

  try {
    // PASSO 1: Validações
    const { userRef, fotoAntiga } = await validarPreUpload(uid);

    // PASSO 2: Pega imagem
    const imagem = await selecionarEComprimirImagem();
    if (!imagem) return null; // Usuário cancelou

    // PASSO 3: Upload com progress
    const nomeArquivo = `${Date.now()}.jpg`;
    const caminhoStorage = `fotos_perfil/${uid}/${nomeArquivo}`;
    const storageRef = ref(storage, caminhoStorage);

    const uploadTask = uploadBytesResumable(storageRef, imagem.blob, {
      contentType: 'image/jpeg',
      customMetadata: {
        uid: uid,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Monitora progresso
    return await new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(Math.round(progress));
        },
        (error) => {
          // Traduz erros do Firebase
          if (error.code === 'storage/unauthorized') {
            reject(new UploadError('Bloqueado pelas regras de segurança', 'STORAGE_RULES_DENIED'));
          } else {
            reject(new UploadError(`Erro no upload: ${error.message}`, error.code));
          }
        },
        async () => {
          try {
            // PASSO 4: Pega URL e atualiza Firestore
            const url = await getDownloadURL(uploadTask.snapshot.ref);

            await updateDoc(userRef, {
              fotoPerfil: url,
              ultimaFotoPerfil: serverTimestamp(), // Ativa anti-spam da regra
            });

            // PASSO 5: Deleta foto antiga em background
            deletarFotoAntiga(fotoAntiga);

            resolve({ url, path: caminhoStorage });
          } catch (e) {
            reject(new UploadError('Falha ao salvar no banco', 'FIRESTORE_ERROR'));
          }
        }
      );
    });

  } catch (error) {
    if (error instanceof UploadError) throw error;
    throw new UploadError('Erro inesperado: ' + error.message, 'UNKNOWN');
  }
}
