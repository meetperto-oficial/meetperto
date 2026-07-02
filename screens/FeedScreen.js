import React, { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native'
import { Colors } from './theme/colors'
import { db, auth } from '../firebaseConfig'
import { collection, doc, setDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore'

export default function FeedScreen({ route }) {
  const [profiles, setProfiles] = useState([])
  const [likedIds, setLikedIds] = useState(new Set())
  const [likesToday, setLikesToday] = useState(0)
  const user = auth.currentUser

  useEffect(() => {
    loadProfiles()
    checkLikesToday()
  }, [])

  const checkLikesToday = async () => {
    const today = new Date().toDateString()
    const q = query(
      collection(db, 'likes'), 
      where('fromUserId', '==', user.uid),
      where('date', '==', today)
    )
    const snap = await getDocs(q)
    setLikesToday(snap.size)
    
    const ids = new Set()
    snap.forEach(doc => ids.add(doc.data().toUserId))
    setLikedIds(ids)
  }

  const loadProfiles = async () => {
    // Sua lógica pra carregar perfis + filtros
    // const filters = route.params?.filters
  }

  const handleLike = async (profileId) => {
    const alreadyLiked = likedIds.has(profileId)
    
    // DESFAZER CURTIDA
    if (alreadyLiked) {
      const likeId = `${user.uid}_${profileId}`
      await deleteDoc(doc(db, 'likes', likeId))
      setLikedIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(profileId)
        return newSet
      })
      setLikesToday(prev => prev - 1)
      return
    }

    // LIMITE 10 LIKES/DIA
    if (likesToday >= 10) {
      Alert.alert('Limite atingido', 'Você só pode curtir 10 perfis por dia. Vire Premium para curtidas ilimitadas.')
      return
    }

    // DAR LIKE
    const likeId = `${user.uid}_${profileId}`
    await setDoc(doc(db, 'likes', likeId), {
      fromUserId: user.uid,
      toUserId: profileId,
      date: new Date().toDateString(),
      timestamp: Date.now()
    })
    
    setLikedIds(prev => new Set(prev).add(profileId))
    setLikesToday(prev => prev + 1)
  }

  return (
    <FlatList
      data={profiles}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => handleLike(item.id)}>
          <Text style={{color: likedIds.has(item.id) ? Colors.primary : Colors.text}}>
            {likedIds.has(item.id) ? 'Curtido' : 'Curtir'}
          </Text>
        </TouchableOpacity>
      )}
    />
  )
}
