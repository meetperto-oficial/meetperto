import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import Swiper from 'react-native-deck-swiper';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../firebaseConfig';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

export default function HomeFeed({ navigation }) {
  const [location, setLocation] = useState(null);
  const [perfis, setPerfis] = useState([]);
  const [loading, setLoading] = useState(true);
  const swiperRef = useRef(null);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) {
      Alert.alert('Erro', 'Usuário não logado');
      navigation.replace('Etapa1Cadastro');
      return;
    }
    pedirPermissaoGPS();
  }, []);

  const pedirPermissaoGPS = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status!== 'granted') {
        Alert.alert('Localização necessária', 'O MeetPerto precisa do seu GPS para mostrar pessoas próximas.');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation(location.coords);

      // SALVA MINHA LOCALIZAÇÃO NO FIRESTORE
      await updateDoc(doc(db, 'usuarios', currentUser.uid), {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        online: true,
        ultimoAcesso: serverTimestamp()
      });

      await buscarUsuariosProximos(location.coords);

    } catch (error) {
      console.log('Erro GPS:', error);
      Alert.alert('Erro', 'Não foi possível obter sua localização');
      setLoading(false);
    }
  };

  const buscarUsuariosProximos = async (coords) => {
    try {
      // 1. PEGA TODOS USUÁRIOS EXCETO EU
      const usuariosRef = collection(db, 'usuarios');
      const q = query(usuariosRef, where('uid', '!=', currentUser.uid));
      const querySnapshot = await getDocs(q);

      // 2. PEGA QUEM EU JÁ CURTI PRA NÃO MOSTRAR DE NOVO
      const curtidasRef = collection(db, 'curtidas');
      const curtidasQuery = query(curtidasRef, where('de', '==', currentUser.uid));
      const curtidasSnapshot = await getDocs(curtidasQuery);
      const jaCurti = curtidasSnapshot.docs.map(doc => doc.data().para);

      const usuarios = [];
      querySnapshot.forEach((doc) => {
        // PULA SE JÁ INTERAGI
        if (jaCurti.includes(doc.id)) return;

        const data = doc.data();
        // PULA SE NÃO TEM LAT/LONG
        if (!data.latitude ||!data.longitude) return;

        const distancia = calcularDistancia(coords.latitude, coords.longitude, data.latitude, data.longitude);

        usuarios.push({
          id: doc.id,
        ...data,
          distancia
        });
      });

      // ORDENA POR DISTÂNCIA
      const perfisOrdenados = usuarios.sort((a, b) => a.distancia - b.distancia);
      setPerfis(perfisOrdenados);
      setLoading(false);
    } catch (error) {
      console.log('Erro ao buscar:', error);
      Alert.alert('Erro', 'Falha ao buscar usuários');
      setLoading(false);
    }
  };

  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleSwipeLeft = async (cardIndex) => {
    const perfil = perfis[cardIndex];
    if (!perfil) return;
    await salvarAcao(perfil.id, 'dislike');
  };

  const handleSwipeRight = async (cardIndex) => {
    const perfil = perfis[cardIndex];
    if (!perfil) return;
    await salvarAcao(perfil.id, 'like');

    const deuMatch = await verificarMatch(perfil.id);
    if (deuMatch) {
      Alert.alert('🎉 Deu Match!', `Você e ${perfil.nome} se curtiram!`);
      navigation.navigate('ChatMatch', { match: perfil });
    }
  };

  const handleSwipeTop = async (cardIndex) => {
    const perfil = perfis[cardIndex];
    if (!perfil) return;
    await salvarAcao(perfil.id, 'superlike');

    const deuMatch = await verificarMatch(perfil.id);
    if (deuMatch) {
      Alert.alert('⭐ Super Match!', `${perfil.nome} também te curtiu!`);
      navigation.navigate('ChatMatch', { match: perfil });
    }
  };

  const salvarAcao = async (alvoId, tipo) => {
    try {
      await setDoc(doc(db, 'curtidas', `${currentUser.uid}_${alvoId}`), {
        de: currentUser.uid,
        para: alvoId,
        tipo: tipo,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.log('Erro ao salvar curtida:', error);
    }
  };

  const verificarMatch = async (alvoId) => {
    try {
      const curtidaDoc = await getDoc(doc(db, 'curtidas', `${alvoId}_${currentUser.uid}`));

      if (curtidaDoc.exists() && curtidaDoc.data().tipo!== 'dislike') {
        const matchId = [currentUser.uid, alvoId].sort().join('_');
        await setDoc(doc(db, 'matches', matchId), {
          usuarios: [currentUser.uid, alvoId],
          timestamp: serverTimestamp()
        });
        return true;
      }
      return false;
    } catch (error) {
      console.log('Erro ao verificar match:', error);
      return false;
    }
  };

  const formatarDistancia = (km) => {
    if (km < 0.5) return 'A menos de 500m';
    if (km < 1) return 'A menos de 1km';
    if (km < 5) return `A ${km.toFixed(1)}km`;
    return `A ${Math.round(km)}km`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#FF4B8B" />
          <Text style={styles.loadingTexto}>Buscando pessoas próximas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (perfis.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.emoji}>😢</Text>
          <Text style={styles.titulo}>Ninguém por perto</Text>
          <Text style={styles.subtitulo}>Volte mais tarde ou aumente seu raio</Text>
          <TouchableOpacity style={styles.botao} onPress={pedirPermissaoGPS}>
            <Text style={styles.botaoTexto}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>MeetPerto</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Perfil')}>
          <Ionicons name="person-circle" size={32} color="#FF4B8B" />
        </TouchableOpacity>
      </View>

      <View style={styles.swiperContainer}>
        <Swiper
          ref={swiperRef}
          cards={perfis}
          keyExtractor={(card) => card.id}
          renderCard={(card) => {
            if (!card) return null;
            return (
              <View style={styles.card}>
                <Image
                  source={{ uri: card.fotos?.[0] || 'https://via.placeholder.com/400' }}
                  style={styles.cardImage}
                />
                <View style={styles.cardFooter}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardNome}>
                      {card.nome}, {card.idade}
                      {card.online && <Text style={styles.online}> 🟢</Text>}
                    </Text>
                    <Text style={styles.cardDistancia}>
                      📍 {formatarDistancia(card.distancia)}
                    </Text>
                    <Text style={styles.cardBio} numberOfLines={2}>{card.bio}</Text>
                  </View>
                </View>
              </View>
            );
          }}
          onSwipedLeft={handleSwipeLeft}
          onSwipedRight={handleSwipeRight}
          onSwipedTop={handleSwipeTop}
          onSwipedAll={() => Alert.alert('Acabou!', 'Você viu todo mundo próximo')}
          backgroundColor="transparent"
          stackSize={3}
          stackSeparation={15}
          animateOverlayLabelsOpacity
          animateCardOpacity
          disableBottomSwipe
          overlayLabels={{
            left: {
              title: 'NÃO',
              style: {
                label: { backgroundColor: '#FF3B30', color: 'white', fontSize: 24, borderRadius: 10, padding: 10 },
                wrapper: { alignItems: 'flex-end', marginTop: 30, marginRight: 30 }
              }
            },
            right: {
              title: 'CURTI',
              style: {
                label: { backgroundColor: '#4CD964', color: 'white', fontSize: 24, borderRadius: 10, padding: 10 },
                wrapper: { alignItems: 'flex-start', marginTop: 30, marginLeft: 30 }
              }
            },
            top: {
              title: 'SUPER LIKE',
              style: {
                label: { backgroundColor: '#007AFF', color: 'white', fontSize: 24, borderRadius: 10, padding: 10 },
                wrapper: { alignItems: 'center', marginTop: 60 }
              }
            }
          }}
        />
      </View>

      <View style={styles.botoes}>
        <TouchableOpacity style={[styles.botaoAcao, styles.botaoDislike]} onPress={() => swiperRef.current?.swipeLeft()}>
          <Ionicons name="close" size={32} color="#FF3B30" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.botaoAcao, styles.botaoSuperLike]} onPress={() => swiperRef.current?.swipeTop()}>
          <Ionicons name="star" size={28} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.botaoAcao, styles.botaoLike]} onPress={() => swiperRef.current?.swipeRight()}>
          <Ionicons name="heart" size={32} color="#4CD964" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingTexto: { marginTop: 16, fontSize: 16, color: '#666' },
  emoji: { fontSize: 64, marginBottom: 16 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  subtitulo: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 24 },
  botao: { backgroundColor: '#FF4B8B', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  botaoTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  logo: { fontSize: 28, fontWeight: 'bold', color: '#FF4B8B' },
  swiperContainer: { flex: 1 },
  card: { flex: 0.75, borderRadius: 20, backgroundColor: '#fff', overflow: 'hidden', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
  cardImage: { width: '100%', height: '75%', backgroundColor: '#E0E0E0' },
  cardFooter: { padding: 20, height: '25%' },
  cardInfo: { flex: 1 },
  cardNome: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  online: { fontSize: 12 },
  cardDistancia: { fontSize: 16, color: '#FF4B8B', fontWeight: '600', marginBottom: 8 },
  cardBio: { fontSize: 14, color: '#666' },
  botoes: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 20, gap: 20 },
  botaoAcao: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
  botaoDislike: { borderWidth: 2, borderColor: '#FF3B30' },
  botaoLike: { borderWidth: 2, borderColor: '#4CD964' },
  botaoSuperLike: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#007AFF' },
});
