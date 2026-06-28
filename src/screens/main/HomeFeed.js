import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import Swiper from 'react-native-deck-swiper';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// MOCK - Depois você puxa da API real
const MOCK_PERFIS = [
  {
    id: 1,
    nome: 'Juliana',
    idade: 26,
    distancia: 0.3,
    fotos: ['https://i.pravatar.cc/400?img=1'],
    bio: 'Amo praia e açaí',
    cidade: 'Diadema',
    online: true
  },
  {
    id: 2,
    nome: 'Camila',
    idade: 24,
    distancia: 0.8,
    fotos: ['https://i.pravatar.cc/400?img=5'],
    bio: 'Skatista nas horas vagas',
    cidade: 'São Bernardo',
    online: false
  },
  {
    id: 3,
    nome: 'Larissa',
    idade: 29,
    distancia: 1.2,
    fotos: ['https://i.pravatar.cc/400?img=9'],
    bio: 'Cerveja e rock',
    cidade: 'Santo André',
    online: true
  }
];

export default function HomeFeed({ navigation }) {
  const [location, setLocation] = useState(null);
  const [perfis, setPerfis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const swiperRef = useRef(null);

  useEffect(() => {
    pedirPermissaoGPS();
  }, []);

  const pedirPermissaoGPS = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status!== 'granted') {
        Alert.alert(
          'Localização necessária',
          'O MeetPerto precisa do seu GPS para mostrar pessoas próximas.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);

      // SIMULA BUSCA NA API - ordena por distância
      setTimeout(() => {
        const perfisOrdenados = MOCK_PERFIS.sort((a, b) => a.distancia - b.distancia);
        setPerfis(perfisOrdenados);
        setLoading(false);
      }, 1500);

    } catch (error) {
      Alert.alert('Erro', 'Não foi possível obter sua localização');
      setLoading(false);
    }
  };

  const handleSwipeLeft = (cardIndex) => {
    console.log('DISLIKE:', perfis[cardIndex].nome);
  };

  const handleSwipeRight = (cardIndex) => {
    console.log('LIKE:', perfis[cardIndex].nome);
    // Aqui vai a lógica de match depois
  };

  const handleSwipeTop = (cardIndex) => {
    console.log('SUPER LIKE:', perfis[cardIndex].nome);
  };

  const formatarDistancia = (km) => {
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
          renderCard={(card) => {
            if (!card) return null;
            return (
              <View style={styles.card}>
                <Image source={{ uri: card.fotos[0] }} style={styles.cardImage} />
                <View style={styles.cardFooter}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardNome}>
                      {card.nome}, {card.idade}
                      {card.online && <Text style={styles.online}> 🟢</Text>}
                    </Text>
                    <Text style={styles.cardDistancia}>
                      📍 {formatarDistancia(card.distancia)}
                    </Text>
                    <Text style={styles.cardBio}>{card.bio}</Text>
                  </View>
                </View>
              </View>
            );
          }}
          onSwipedLeft={handleSwipeLeft}
          onSwipedRight={handleSwipeRight}
          onSwipedTop={handleSwipeTop}
          onSwipedAll={() => {
            Alert.alert('Acabou!', 'Você viu todo mundo próximo');
          }}
          cardIndex={index}
          backgroundColor="transparent"
          stackSize={3}
          stackSeparation={15}
          animateOverlayLabelsOpacity
          animateCardOpacity
          overlayLabels={{
            left: {
              title: 'NÃO',
              style: {
                label: {
                  backgroundColor: '#FF3B30',
                  color: 'white',
                  fontSize: 24
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                  marginTop: 30,
                  marginLeft: -30
                }
              }
            },
            right: {
              title: 'CURTI',
              style: {
                label: {
                  backgroundColor: '#4CD964',
                  color: 'white',
                  fontSize: 24
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  marginTop: 30,
                  marginLeft: 30
                }
              }
            },
            top: {
              title: 'SUPER LIKE',
              style: {
                label: {
                  backgroundColor: '#007AFF',
                  color: 'white',
                  fontSize: 24
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }
              }
            }
          }}
        />
      </View>

      <View style={styles.botoes}>
        <TouchableOpacity
          style={[styles.botaoAcao, styles.botaoDislike]}
          onPress={() => swiperRef.current?.swipeLeft()}
        >
          <Ionicons name="close" size={32} color="#FF3B30" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botaoAcao, styles.botaoSuperLike]}
          onPress={() => swiperRef.current?.swipeTop()}
        >
          <Ionicons name="star" size={28} color="#007AFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botaoAcao, styles.botaoLike]}
          onPress={() => swiperRef.current?.swipeRight()}
        >
          <Ionicons name="heart" size={32} color="#4CD964" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingTexto: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  botao: {
    backgroundColor: '#FF4B8B',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF4B8B',
  },
  swiperContainer: {
    flex: 1,
  },
  card: {
    flex: 0.75,
    borderRadius: 20,
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardImage: {
    width: '100%',
    height: '75%',
    backgroundColor: '#E0E0E0',
  },
  cardFooter: {
    padding: 20,
    height: '25%',
  },
  cardInfo: {
    flex: 1,
  },
  cardNome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  online: {
    fontSize: 12,
  },
  cardDistancia: {
    fontSize: 16,
    color: '#FF4B8B',
    fontWeight: '600',
    marginBottom: 8,
  },
  cardBio: {
    fontSize: 14,
    color: '#666',
  },
  botoes: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 20,
  },
  botaoAcao: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  botaoDislike: {
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  botaoLike: {
    borderWidth: 2,
    borderColor: '#4CD964',
  },
  botaoSuperLike: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
});
