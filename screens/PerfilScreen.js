// screens/PerfilScreen.js
import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { UserContext, CONFIG } from '../App';

export default function PerfilScreen() {
  const { userData } = useContext(UserContext);
  
  const estrelas = [1,2,3,4,5];
  const media = 4.8; // ONDE MUDAR: Puxar média real da API

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Meu Perfil</Text>
      
      <View style={styles.card}>
        <Text style={styles.nome}>{userData?.nome || 'Usuário'}</Text>
        <Text style={styles.plano}>Plano: {userData?.plano || 'Free'}</Text>
        
        <View style={styles.estrelasContainer}>
          {estrelas.map(i => (
            <Text key={i} style={styles.estrela}>{i <= Math.round(media) ? '⭐' : '☆'}</Text>
          ))}
          <Text style={styles.media}>{media.toFixed(1)}</Text>
        </View>
        
        <Text style={styles.avaliacoes}>Baseado em 127 avaliações</Text>
      </View>

      <TouchableOpacity style={styles.botao}>
        <Text style={styles.botaoTexto}>Editar Perfil</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.botao, styles.botaoSair]}>
        <Text style={styles.botaoTexto}>Sair da Conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#FFF5F8' },
  titulo: { fontSize: 24, fontWeight: 'bold', color: CONFIG.COR_PRINCIPAL, marginBottom: 20, textAlign: 'center' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 16, elevation: 2, marginBottom: 20 },
  nome: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  plano: { fontSize: 16, color: CONFIG.COR_SECUNDARIA, textAlign: 'center', marginTop: 4, fontWeight: '600' },
  estrelasContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  estrela: { fontSize: 24, marginHorizontal: 2 },
  media: { fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
  avaliacoes: { textAlign: 'center', color: '#666', marginTop: 8 },
  botao: { backgroundColor: CONFIG.COR_PRINCIPAL, padding: 15, borderRadius: 8, marginBottom: 12 },
  botaoSair: { backgroundColor: '#999' },
  botaoTexto: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 16 }
});
