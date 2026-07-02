import React, { useState, useEffect, useLayoutEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from './theme/colors'
import { db, auth } from '../firebaseConfig'
import { collection, doc, setDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore'

export default function FeedScreen({ navigation, route }) {
  const [profiles, setProfiles] = useState([])
  const [likedIds, setLikedIds] = useState(new Set())
  const [likesToday, setLikesToday] = useState(0)
  const [loading, setLoading] = useState(true)
  const user = auth.currentUser
  const filters = route.params?.filters

  // BOTÕES DO HEADER: Settings + Filtros
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', marginRight: 8 }}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Filtros')}
            style={{ marginRight: 16 }}
          >
            <Ionicons name="options-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
      ),
    })
  }, [navigation])

  useEffect(() => {
    if (user) {
      loadProfiles()
      checkLikesToday()
    }
  }, [filters, user])

  const checkLikesToday = async () => {
    if (!user) return
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
    if (!user) return
    setLoading(true)
    
    try {
      let q = query(collection(db, 'users'))

      if (filters?.hairColor && filters.hairColor!== 'Ver todos') {
        q = query(q, where('hairColor', '==', filters.hairColor))
      }
      if (filters?.gender && filters.gender!== 'Ver todos') {
        q = query(q, where('gender', '==', filters.gender))
      }

      const snap = await getDocs(q)
      let list = snap.docs.map(doc => ({ id: doc.id,...doc.data() }))
      
      list = list.filter(profile => 
        profile.id!== user.uid && 
        profile.invisibleMode!== true
      )
      
      setProfiles(list)
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar perfis')
      console.log(error)
    }
    setLoading(false)
  }

  const handleLike = async (profileId) => {
    if (!user) return
    const alreadyLiked = likedIds.has(profileId)
    
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

    if (likesToday >= 10) {
      Alert.alert('Limite atingido', 'Você só pode curtir 10 perfis por dia. Vire Premium para curtidas ilimitadas.')
      return
    }

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

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', backgroundColor: Colors.background}}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  return (
    <FlatList
      data={profiles}
      keyExtractor={item => item.id}
      contentContainerStyle={{ padding: 16, backgroundColor: Colors.background }}
      renderItem={({ item }) => (
        <View style={{ marginBottom: 16, padding: 16, backgroundColor: Colors.card, borderRadius: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: Colors.text, marginBottom: 8 }}>
            {item.name || 'Sem nome'}
          </Text>
          <TouchableOpacity 
            onPress={() => handleLike(item.id)}
            style={{ 
              backgroundColor: likedIds.has(item.id)? Colors.primary : Colors.border,
              padding: 12,
              borderRadius: 8,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: likedIds.has(item.id)? Colors.textInverse : Colors.text, fontWeight: '600' }}>
              {likedIds.has(item.id)? 'Curtido' : 'Curtir'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      ListEmptyComponent={
        <Text style={{ textAlign: 'center', marginTop: 40, color: Colors.textLight }}>
          Nenhum perfil encontrado
        </Text>
      }
    />
  )
}
