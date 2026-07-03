import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { signOut } from "firebase/auth";
import { auth } from '../firebaseConfig';

export default function HomeScreen() {
  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Bem-vindo ao MeetPerto!</Text>
      <Text style={styles.email}>Logado como: {auth.currentUser?.email}</Text>
      
      <TouchableOpacity style={styles.botao} onPress={handleLogout}>
        <Text style={styles.textoBotao}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  email: { fontSize: 16, color: '#666', marginBottom: 40 },
  botao: { backgroundColor: '#FF6B6B', padding: 15, borderRadius: 8, width: '80%' },
  textoBotao: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }
});
