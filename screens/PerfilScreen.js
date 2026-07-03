import { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, ActivityIndicator, ActionSheetIOS, Platform, Share } from 'react-native';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp, addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

export default function PerfilScreen({ route, navigation }) {
  const { userId } = route.params; // ID do perfil que estamos vendo
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBloqueado, setIsBloqueado] = useState(false);
  const [jaDenunciei, setJaDenunciei] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const meuUid = auth.currentUser?.uid;
  const isMeuPerfil = meuUid === userId;

  // Carrega dados do perfil e status de bloqueio/denúncia
  const carregarPerfil = async () => {
    try {
      setLoading(true);

      // 1. Busca dados do perfil
      const userDoc = await getDoc(doc(db, 'usuarios', userId));
      if (!userDoc.exists()) {
        Alert.alert('Erro', 'Usuário não encontrado.');
        navigation.goBack();
        return;
      }
      setPerfil({ id: userDoc.id,...userDoc.data() });

      // 2. Checa se EU bloqueei essa pessoa
      const meuDoc = await getDoc(doc(db, 'usuarios', meuUid));
      const bloqueados = meuDoc.data()?.bloqueados || [];
      setIsBloqueado(bloqueados.includes(userId));

      // 3. Checa se eu já denunciei essa pessoa nas últimas 24h pra evitar spam
      const q = query(
        collection(db, 'denuncias'),
        where('denuncianteId', '==', meuUid),
        where('denunciadoId', '==', userId),
        where('timestamp', '>', new Date(Date.now() - 24 * 60 * 60 * 1000))
      );
      const denunciasRecentes = await getDocs(q);
      setJaDenunciei(!denunciasRecentes.empty);

    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      Alert.alert('Erro', 'Não foi possível carregar o perfil.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarPerfil();
    }, [userId])
  );

  // Função de Bloquear/Desbloquear
  const handleBloquear = async () => {
    const acao = isBloqueado? 'desbloquear' : 'bloquear';
    Alert.alert(
      `${acao.charAt(0).toUpperCase() + acao.slice(1)} usuário`,
      `Tem certeza que deseja ${acao} ${perfil.nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: acao.charAt(0).toUpperCase() + acao.slice(1),
          style: isBloqueado? 'default' : 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              const meuRef = doc(db, 'usuarios', meuUid);
              await updateDoc(meuRef, {
                bloqueados: isBloqueado? arrayRemove(userId) : arrayUnion(userId),
                bloqueadosTimestamp: serverTimestamp()
              });
              setIsBloqueado(!isBloqueado);
              Alert.alert('Sucesso', `Usuário ${acao}do.`);
              if (!isBloqueado) navigation.goBack(); // Sai do perfil se bloqueou
            } catch (error) {
              console.error('Erro ao bloquear:', error);
              Alert.alert('Erro', `Não foi possível ${acao} o usuário.`);
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  // Função de Denunciar
  const abrirMenuDenuncia = () => {
    if (jaDenunciei) {
      Alert.alert('Aviso', 'Você já denunciou este usuário nas últimas 24 horas.');
      return;
    }

    const motivos = [
      'Perfil falso',
      'Nudez ou conteúdo sexual',
      'Assédio ou bullying',
      'Discurso de ódio',
      'Spam ou golpe',
      'Menor de idade',
      'Outro',
      'Cancelar'
    ];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: motivos,
          cancelButtonIndex: motivos.length - 1,
          destructiveButtonIndex: [1, 2, 3, 5], // Deixa vermelho
          title: 'Por que você está denunciando?',
          message: 'Sua denúncia é anônima e nos ajuda a manter a comunidade segura.'
        },
        (buttonIndex) => {
          if (buttonIndex!== motivos.length - 1) {
            enviarDenuncia(motivos[buttonIndex]);
          }
        }
      );
    } else {
      // Android: usa Alert
      Alert.alert(
        'Denunciar usuário',
        'Selecione o motivo:',
        motivos.slice(0, -1).map(motivo => ({
          text: motivo,
          onPress: () => enviarDenuncia(motivo),
          style: ['Nudez ou conteúdo sexual', 'Assédio ou bullying', 'Discurso de ódio', 'Menor de idade'].includes(motivo)? 'destructive' : 'default'
        })).concat([{ text: 'Cancelar', style: 'cancel' }])
      );
    }
  };

  const enviarDenuncia = async (motivo) => {
    setActionLoading(true);
    try {
      // Salva a denúncia com prova jurídica
      await addDoc(collection(db, 'denuncias'), {
        denunciadoId: userId,
        denuncianteId: meuUid,
        motivo: motivo,
        timestamp: serverTimestamp(),
        status: 'pendente', // pendente, analisada, resolvida
        dadosDenunciado: { // Snapshot pra se o cara deletar a conta
          nome: perfil.nome,
          fotoUrl: perfil.fotoUrl,
          idade: perfil.idade
        }
      });

      // Bloqueia automaticamente após denunciar, conforme seus Termos
      const meuRef = doc(db, 'usuarios', meuUid);
      await updateDoc(meuRef, {
        bloqueados: arrayUnion(userId),
        bloqueadosTimestamp: serverTimestamp()
      });

      setJaDenunciei(true);
      setIsBloqueado(true);
      Alert.alert('Denúncia enviada', 'Obrigado. Analisaremos em até 48h. O usuário foi bloqueado.');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao denunciar:', error);
      Alert.alert('Erro', 'Não foi possível enviar a denúncia.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#4630EB" style={{ flex: 1 }} />;
  }

  if (isBloqueado &&!isMeuPerfil) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="ban" size={60} color="#ccc" />
        <Text style={{ fontSize: 18, marginTop: 10 }}>Usuário bloqueado</Text>
        <TouchableOpacity onPress={handleBloquear} style={{ marginTop: 20 }}>
          <Text style={{ color: '#4630EB' }}>Desbloquear</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Image source={{ uri: perfil?.fotoUrl }} style={{ width: '100%', height: 400 }} />

      <View style={{ padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ fontSize: 28, fontWeight: 'bold' }}>{perfil?.nome}, {perfil?.idade}</Text>
          <Text style={{ fontSize: 16, color: '#666', marginTop: 5 }}>{perfil?.bio}</Text>
        </View>

        {!isMeuPerfil && (
          <TouchableOpacity
            onPress={abrirMenuDenuncia}
            disabled={actionLoading}
            style={{ padding: 10 }}
            accessibilityLabel="Abrir menu de opções do perfil"
          >
            <Ionicons name="ellipsis-vertical" size={24} color="#000" />
          </TouchableOpacity>
        )}
      </View>

      {!isMeuPerfil && (
        <View style={{ paddingHorizontal: 20 }}>
          <TouchableOpacity
            onPress={handleBloquear}
            disabled={actionLoading}
            style={{
              borderWidth: 1,
              borderColor: isBloqueado? '#34C759' : '#FF3B30',
              padding: 15,
              borderRadius: 10,
              alignItems: 'center'
            }}
          >
            {actionLoading? (
              <ActivityIndicator color={isBloqueado? '#34C759' : '#FF3B30'} />
            ) : (
              <Text style={{ color: isBloqueado? '#34C759' : '#FF3B30', fontWeight: 'bold' }}>
                {isBloqueado? 'Desbloquear Usuário' : 'Bloquear Usuário'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
