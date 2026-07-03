const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

initializeApp();
const db = getFirestore();
const auth = getAuth();

// Limite de denúncias pra banir automático. Ajuste conforme seu app
const LIMITE_DENUNCIAS_PARA_BAN = 3;
const HORAS_PARA_REVISAR_DENUNCIA = 48;

// Trigger: dispara toda vez que criam um doc em /denuncias
exports.processarDenuncia = onDocumentCreated("denuncias/{denunciaId}", async (event) => {
  const snap = event.data;
  if (!snap) {
    console.log("Nenhum dado na denúncia.");
    return;
  }

  const denuncia = snap.data();
  const { denunciadoId, denuncianteId, motivo } = denuncia;
  const denunciaId = event.params.denunciaId;

  console.log(`Processando denúncia ${denunciaId} contra ${denunciadoId} por ${motivo}`);

  try {
    // 1. PUXA TODAS DENÚNCIAS CONTRA O USUÁRIO
    const denunciasQuery = db.collection("denuncias").where("denunciadoId", "==", denunciadoId);
    const denunciasSnapshot = await denunciasQuery.get();
    const totalDenuncias = denunciasSnapshot.size;

    console.log(`Usuário ${denunciadoId} tem ${totalDenuncias} denúncias.`);

    // 2. LÓGICA DE BAN AUTOMÁTICO
    const motivosGraves = ['Nudez ou conteúdo sexual', 'Menor de idade', 'Discurso de ódio'];
    const isMotivoGrave = motivosGraves.includes(motivo);
    
    // Bane se: 3+ denúncias OU 1 denúncia de motivo grave
    if (totalDenuncias >= LIMITE_DENUNCIAS_PARA_BAN || isMotivoGrave) {
      await banirUsuario(denunciadoId, denunciaId, motivo, totalDenuncias);
    } else {
      // Se não for banir, só marca denúncia como "analisada"
      await snap.ref.update({ 
        status: "analisada", 
        analisadaEm: FieldValue.serverTimestamp(),
        acaoTomada: "Nenhuma. Aguardando mais denúncias."
      });
    }

    // 3. LOG DE AUDITORIA IMUTÁVEL PRA LGPD/ANPD
    await db.collection("logs_moderacao").add({
      tipo: "DENUNCIA_RECEBIDA",
      denunciaId: denunciaId,
      denunciadoId: denunciadoId,
      denuncianteId: denuncianteId,
      motivo: motivo,
      totalDenunciasUsuario: totalDenuncias,
      acaoAutomatica: totalDenuncias >= LIMITE_DENUNCIAS_PARA_BAN || isMotivoGrave? "BANIMENTO" : "AGUARDANDO",
      timestamp: FieldValue.serverTimestamp(),
      server: "CloudFunction:v2"
    });

  } catch (error) {
    console.error("Erro crítico ao processar denúncia:", error);
    // Marca a denúncia como erro pra um admin ver depois
    await snap.ref.update({ status: "erro_processamento", erro: error.message });
  }
});

// FUNÇÃO DE BANIMENTO
async function banirUsuario(uid, denunciaId, motivo, totalDenuncias) {
  console.log(`INICIANDO BANIMENTO do usuário ${uid}`);
  
  const batch = db.batch();

  // 1. Desativa no Firebase Authentication. O cara não loga mais
  await auth.updateUser(uid, {
    disabled: true
  });

  // 2. Marca no Firestore como banido
  const userRef = db.collection("usuarios").doc(uid);
  batch.update(userRef, {
    banido: true,
    motivoBan: motivo,
    dataBan: FieldValue.serverTimestamp(),
    banidoPorDenunciaId: denunciaId,
    ativo: false // Remove do Feed
  });

  // 3. Anonimiza dados pessoais pra cumprir LGPD Art. 18
  batch.update(userRef, {
    nome: "Usuário Banido",
    bio: "",
    fotoUrl: "", // Ou coloca uma foto padrão "banido.png"
    geohash: FieldValue.delete(), // Apaga localização
    email: FieldValue.delete(),
  });

  // 4. Atualiza todas as denúncias contra ele pra "resolvida"
  const denunciasQuery = db.collection("denuncias").where("denunciadoId", "==", uid);
  const denunciasSnapshot = await denunciasQuery.get();
  denunciasSnapshot.forEach(doc => {
    batch.update(doc.ref, { 
      status: "resolvida", 
      acaoTomada: "BANIMENTO_AUTOMATICO",
      resolvidaEm: FieldValue.serverTimestamp()
    });
  });

  // 5. Executa tudo de uma vez. Ou tudo funciona, ou nada
  await batch.commit();
  
  console.log(`Usuário ${uid} banido com sucesso. Motivo: ${motivo}. Total denúncias: ${totalDenuncias}`);

  // 6. OPCIONAL: Notificar admin no Slack/Discord/Email
  // await notificarAdmin(uid, motivo, totalDenuncias);
}

// FUNÇÃO PRA DESBANIR - Use via painel admin
exports.desbanirUsuario = onCall(async (request) => {
  // 1. Checa se quem chamou é admin. IMPORTANTE
  if (!request.auth || request.auth.token.admin !== true) {
    throw new HttpsError("permission-denied", "Apenas admins podem desbanir.");
  }

  const { uid } = request.data;
  await auth.updateUser(uid, { disabled: false });
  await db.collection("usuarios").doc(uid).update({
    banido: false,
    motivoBan: FieldValue.delete(),
    dataBan: FieldValue.delete(),
    ativo: true
  });

  return { success: true, message: `Usuário ${uid} desbanido.` };
});
