// screens/FilaLinearScreen.js
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import * as Location from 'expo-location';
import { UserContext, CONFIG } from '../App';

export default function FilaLinearScreen() {
  const { userData, gastarCurtida } = useContext(UserContext);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarUsuariosProximos();
    const interval = setInterval(() => {
      const usuariosProximos = usuarios.filter(u => u.faixaDistancia === 0);
      if (usuariosProximos.length > 0) {
        Alert.alert('MeetPerto', 'Alguém compatível acabou de entrar num raio de 200m de você');
      }
    }, 120000);
    return () => clearInterval(interval);
  }, [usuarios]);

  const carregarUsuariosProximos = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status!== 'granted') {
      Alert.alert('Permissão negada', 'Ative a localização pra ver pessoas perto');
      setLoading(false);
      return;
    }
    
    const USUARIOS_MOCK = [
      { id: 1, nome: 'Ana', idade: 24, estilo: 'morena', faixaDistancia: 0, foto: 'https://i.pravatar.cc/300?img=1' },
      { id: 2, nome: 'Bia', idade: 27, estilo: 'loira', faixaDistancia: 0, foto: 'https://i.pravatar.cc/300?img=2' },
      { id: 3, nome: 'Carol', idade: 22, estilo: 'ruiva', faixaDistancia: 1, foto: 'https://i.pravatar.cc/300?img=3' },
      { id: 4, nome: 'Dani', idade: 29, estilo: 'negra', faixaDistancia: 2, foto: 'https://i.pravatar.cc/300?img=4' },
    ];
    
    setUsuarios(USUARIOS_MOCK.sort((a,b) => a.faixaDistancia - b.faixaDistancia));
    setLoading(false);
  };

  const handleCurtir = async (id, nome) => {
    const conseguiu = await gastarCurtida();
    if (conseguiu) {
      Alert.alert('Curtiu!', `Você curtiu ${nome}. Se for recíproco, o chat é gratuito`);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.foto }} style={styles.foto} />
      <View style={styles.info}>
        <Text style={styles.nome}>{item.nome}, {item.idade}</Text>
        <Text style={styles.distancia}>{CONFIG.FAIXAS_DISTANCIA[item.faixaDistancia]}</Text>
        <Text style={styles.estilo}>{item.estilo}</Text>
        <TouchableOpacity style={styles.botaoCurtir} onPress={() => handleCurtir(item.id, item.nome)}>
          <Text style={styles.botaoTexto}>Curtir ❤️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{CONFIG.SLOGAN}</Text>
      <Text style={styles.curtidas}>Curtidas restantes: {userData?.curtidasRestantes || 0}</Text>
      <FlatList
        data={usuarios}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={
          <Text style={styles.vazio}>Fim da fila. Novos MeetPertanos chegaram na sua área em breve!</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#FFF5F8' },
  titulo: { fontSize: 16, fontWeight: 'bold', color: CONFIG.COR_PRINCIPAL, marginBottom: 8, textAlign: 'center' },
  curtidas: { fontSize: 14, color: '#666', marginBottom: 10, textAlign: 'center', fontWeight: '600' },
  card: { backgroundColor: '#fff', padding: 12, marginBottom: 12, borderRadius: 16, flexDirection: 'row', elevation: 2 },
  foto: { width: 110, height: 110, borderRadius: 12 },
  info: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  nome: { fontSize: 20, fontWeight: 'bold' },
  distancia: { fontSize: 14, color: CONFIG.COR_SECUNDARIA, fontWeight: '600' },
  estilo: { fontSize: 14, color: '#666', textTransform: 'capitalize' },
  botaoCurtir: { backgroundColor: CONFIG.COR_PRINCIPAL, padding: 10, borderRadius: 8, marginTop: 8 },
  botaoTexto: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  vazio: { textAlign: 'center', marginTop: 50, color: '#666', fontSize: 16, paddingHorizontal: 20 }
});
