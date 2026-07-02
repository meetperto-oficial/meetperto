const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()

exports.onNewMessage = functions.firestore
  .document('chats/{chatId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data()
    const chatId = context.params.chatId
    
    // Pega a última msg do outro usuário
    const messagesRef = admin.firestore()
      .collection(`chats/${chatId}/messages`)
      .orderBy('timestamp', 'desc')
      .limit(2)
    
    const msgs = await messagesRef.get()
    if (msgs.size < 2) return null
    
    const lastMsg = msgs.docs[1].data() // penúltima msg
    
    // Só conta se for de outro usuário
    if (lastMsg.senderId === message.senderId) return null
    
    const timeDiff = message.timestamp - lastMsg.timestamp
    const fiveMinutes = 5 * 60 * 1000
    
    if (timeDiff <= fiveMinutes) {
      const userRef = admin.firestore().doc(`users/${message.senderId}`)
      await userRef.update({
        fastResponses: admin.firestore.FieldValue.increment(1)
      })
      
      // Adiciona selo se tiver 10+ respostas rápidas
      const userDoc = await userRef.get()
      if (userDoc.data().fastResponses >= 10) {
        await userRef.update({ badges: admin.firestore.FieldValue.arrayUnion('responde_rapido') })
      }
    }
    
    return null
  })
