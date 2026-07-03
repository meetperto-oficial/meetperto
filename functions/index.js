const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { onCall, HttpsError, onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const { getStorage } = require("firebase-admin/storage");
const ngeohash = require("ngeohash");

initializeApp();
const db = getFirestore();
const auth = getAuth();
const storage = getStorage();

// ==================== CONFIG ====================
const CONFIG = {
  LIMITE_DENUNCIAS_BAN: 3,
  MOTIVOS_GRAVES_BAN_IMEDIATO: ['Nudez ou conteúdo sexual', 'Menor de idade', 'Discurso de ódio', 'Assédio ou bullying'],
  GEOHASH_PRECISION: 5, // 2.4km - Cumpre Política de Privacidade
  DIAS_INATIVIDADE_LIMPEZA: 90,
  ADMIN_EMAILS: ['seu-email@gmail.com'], // Coloca seu email de admin aqui
};

// ==================== MODERAÇÃO AUTOMÁTICA ====================

/**
 * Trigger: Dispara quando criam denúncia. Bane automático se necessário.
 */
exports.processarDenuncia = onDocumentCreated("denuncias/{denunciaId}", async (event) => {
  const snap = event.data;
  if (!snap) return;
  const denuncia = snap.data();
  const { denunciadoId, denuncianteId, motivo } = denuncia;
  const denunciaId = event.params.denunciaId;

  console.log(`[MODERAÇÃO] Nova denúncia ${denunciaId} contra ${denunciadoId} | Motivo: ${motivo}`);

  try {
    // 1. Conta total de denúncias contra o usuário
    const denunciasSnap = await db.collection("denuncias")
      .where("denunciadoId", "==", denunciadoId)
      .where("status", "!=", "rejeitada")
      .get();
    const totalDenuncias = denunciasSnap.size;

    // 2. Decide se bane
    const isMotivoGrave = CONFIG.MOTIVOS_GRAVES_BAN_IMEDIATO.includes(motivo);
    const deveBanir = totalDenuncias >= CONFIG.LIMITE_DENUNCIAS_BAN || isMotivoGrave;

    if (deveBanir) {
      await banirUsuario(denunciadoId, denunciaId, motivo, totalDenuncias);
      await atualizarStatusDenuncias(denunciadoId, "resolvida", "BANIMENTO_AUTOMATICO");
    } else {
      await snap.ref.update({ 
        status: "analisada", 
        analisadaEm: FieldValue.serverTimestamp(),
        acaoTomada: `Aguardando mais denúncias. Total: ${totalDenuncias}/${CONFIG.LIMITE_DENUNCIAS_BAN}`
      });
    }

    // 3. Log de auditoria imutável
    await db.collection("logs_moderacao").add({
      tipo: "DENUNCIA_PROCESSADA",
      denunciaId,
      denunciadoId,
      denuncianteId,
      motivo,
      totalDenunciasUsuario: totalDenuncias,
      acaoAutomatica: deveBanir ? "BANIMENTO" : "AGUARDANDO",
      timestamp: FieldValue.serverTimestamp(),
      versao: "v2"
    });

  } catch (error) {
    console.error("[MODERAÇÃO] ERRO CRÍTICO:", error);
    await snap.ref.update({ status: "erro_processamento", erro: error.message });
  }
});

/**
 * Função interna de banimento. Desativa Auth, anonimiza dados, limpa.
 */
async function banirUsuario(uid, denunciaId, motivo, totalDenuncias) {
  console.log(`[BAN] Iniciando banimento de ${uid}`);
  const batch = db.batch();

  // 1. Desativa no Firebase Auth - kick instantâneo
  await auth.updateUser(uid, { disabled: true });

  // 2. Atualiza documento do usuário
  const userRef = db.collection("usuarios").doc(uid);
  batch.update(userRef, {
    banido: true,
    motivoBan: motivo,
    dataBan: FieldValue.serverTimestamp(),
    banidoPorDenunciaId: denunciaId,
    ativo: false,
    // Anonimização LGPD Art. 18
    nome: "Usuário Banido",
    bio: FieldValue.delete(),
    fotoUrl: FieldValue.delete(),
    geohash: FieldValue.delete(),
    email: FieldValue.delete(),
    idade: FieldValue.delete(),
  });

  // 3. Marca todas denúncias como resolvidas
  const denunciasQuery = db.collection("denuncias").where("denunciadoId", "==", uid);
  const denunciasSnap = await denunciasQuery.get();
  denunciasSnap.forEach(doc => {
    batch.update(doc.ref, { 
      status: "resolvida", 
      acaoTomada: "BANIMENTO_AUTOMATICO",
      resolvidaEm: FieldValue.serverTimestamp()
    });
  });

  await batch.commit();
  console.log(`[BAN] Usuário ${uid} banido. Motivo: ${motivo}`);
}

// ==================== LGPD - RIGHT TO BE FORGOTTEN ====================

/**
 * Chamada pelo app. Deleta TODOS os dados do usuário. LGPD Art. 18 VI.
 */
exports.deletarDadosUsuarioCompleto = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Login necessário.");
  const uid = request.auth.uid;
  const ip = request.rawRequest.ip;
  const userAgent = request.rawRequest.headers["user-agent"];
  
  console.log(`[LGPD] Solicitação de deleção: ${uid} | IP: ${ip}`);
  const batch = db.batch();

  try {
    // 1. Apaga documento principal
    const userRef = db.collection("usuarios").doc(uid);
    batch.delete(userRef);

    // 2. Apaga subcollections em lote
    const subcollections = ['matches', 'likes_enviados', 'likes_recebidos', 'mensagens', 'bloqueados'];
    for (const sub of subcollections) {
      const snap = await userRef.collection(sub).get();
      snap.forEach(doc => batch.delete(doc.ref));
    }

    // 3. Apaga arquivos do Storage
    const bucket = storage.bucket();
    await bucket.deleteFiles({ prefix: `fotos_perfil/${uid}` });
    await bucket.deleteFiles({ prefix: `chats/${uid}` });

    // 4. Anonimiza logs e denúncias pra manter auditoria sem dado pessoal
    const denunciasComoDenunciado = await db.collection("denuncias").where("denunciadoId", "==", uid).get();
    denunciasComoDenunciado.forEach(doc => {
      batch.update(doc.ref, { denunciadoId: "DELETADO", dadosDenunciado: FieldValue.delete() });
    });
    const denunciasComoDenunciante = await db.collection("denuncias").where("denuncianteId", "==", uid).get();
    denunciasComoDenunciante.forEach(doc => {
      batch.update(doc.ref, { denuncianteId: "DELETADO" });
    });

    // 5. Log imutável da deleção - Prova pra ANPD
    const logRef = db.collection("logs_delecao_lgpd").doc();
    batch.set(logRef, {
      uidDeletado: uid,
      timestampSolicitacao: FieldValue.serverTimestamp(),
      status: "CONCLUIDO",
      ipOrigem: ip,
      userAgent: userAgent,
      versaoFuncao: "v2"
    });

    await batch.commit();
    console.log(`[LGPD] Deleção de ${uid} concluída.`);
    return { success: true };

  } catch (error) {
    console.error(`[LGPD] FALHA CRÍTICA ao deletar ${uid}:`, error);
    throw new HttpsError("internal", "Erro no servidor ao deletar dados.", error.message);
  }
});

// ==================== PAINEL ADMIN ====================

/**
 * Função só pra admin. Desbane usuário.
 */
exports.desbanirUsuario = onCall(async (request) => {
  if (!request.auth || request.auth.token.admin !== true) {
    throw new HttpsError("permission-denied", "Apenas admins.");
  }
  const { uid } = request.data;
  await auth.updateUser(uid, { disabled: false });
  await db.collection("usuarios").doc(uid).update({
    banido: false, motivoBan: FieldValue.delete(), dataBan: FieldValue.delete(), ativo: true
  });
  return { success: true, message: `Usuário ${uid} desbanido.` };
});

/**
 * Função só pra admin. Promove usuário a admin.
 */
exports.setAdmin = onCall(async (request) => {
  // Só o primeiro admin pode criar outros
  if (!request.auth || !CONFIG.ADMIN_EMAILS.includes(request.auth.token.email)) {
    throw new HttpsError("permission-denied", "Apenas super-admin.");
  }
  const { email } = request.data;
  const user = await auth.getUserByEmail(email);
  await auth.setCustomUserClaims(user.uid, { admin: true });
  return { success: true, message: `${email} agora é admin.` };
});

// ==================== TAREFAS AGENDADAS - CRON ====================

/**
 * Roda todo dia às 3AM. Limpa usuários inativos 90+ dias. Cumpre Política de Privacidade.
 */
exports.limpezaUsuariosInativos = onSchedule("every day 03:00", async (event) => {
  const dataLimite = new Date(Date.now() - CONFIG.DIAS_INATIVIDADE_LIMPEZA * 24 * 60 * 60 * 1000);
  const inativosQuery = db.collection("usuarios")
    .where("ultimaLocalizacao", "<", dataLimite)
    .where("ativo", "==", true);
  
  const inativosSnap = await inativosQuery.get();
  const batch = db.batch();
  
  inativosSnap.forEach(doc => {
    batch.update(doc.ref, { ativo: false, geohash: FieldValue.delete() });
  });
  
  await batch.commit();
  console.log(`[CRON] Limpeza: ${inativosSnap.size} usuários marcados como inativos.`);
});

// ==================== GEOHASH HELPER ====================

/**
 * Trigger: Quando usuário atualiza localização, gera geohash automático.
 */
exports.gerarGeohashAoAtualizarLocal = onDocumentUpdated("usuarios/{userId}", async (event) => {
  const antes = event.data.before.data();
  const depois = event.data.after.data();
  
  // Só roda se lat/lng mudaram e se existirem
  if (!depois.latitude || !depois.longitude) return;
  if (antes.latitude === depois.latitude && antes.longitude === depois.longitude) return;

  const geohash = ngeohash.encode(depois.latitude, depois.longitude, CONFIG.GEOHASH_PRECISION);
  
  return event.data.after.ref.update({
    geohash: geohash,
    // Apaga lat/lng pra nunca salvar GPS exato no banco
    latitude: FieldValue.delete(),
    longitude: FieldValue.delete(),
    ultimaLocalizacao: FieldValue.serverTimestamp()
  });
});
