import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../../../App';

export default function Etapa6Finalizar({ route, navigation }) {
  const {
    metodo,
    valor,
    senha,
    verificado,
    nome,
    dataNascimento,
    idade,
    genero,
    cidade,
    fotos,
    preferencias
  } = route.params;

  const { setUser } = useContext(UserContext);
  const [status, setStatus] = useState('salvando'); // salvando | sucesso | erro

  useEffect(() => {
    criarConta();
  }, []);

  const criarConta = async () => {
    try {
      const dadosCompletos = {
        metodo,
        valor,
        senha,
        verificado,
        nome,
        dataNascimento,
        idade,
        genero,
        cidade,
        fotos,
        preferencias
      };

      console.log('Enviando pro backend:', dadosCompletos);

      // TODO: Substituir pela sua API real
      // const response = await fetch('https://suaapi.com/auth/cadastro', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(dadosCompletos)
      // });
      // 
      // if (!response.ok) throw new Error('Erro no cadastro');
      // const data = await response.json();
      // const token = data.token;

      // SIMULAÇÃO - REMOVER QUANDO TIVER BACKEND
      await new Promise(resolve => setTimeout(resolve, 2000));
      const token = 'token_teste_' + Date.now();

      // SALVA O TOKEN E LOGA O USUÁRIO
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(dadosCompletos));
      
      setStatus('sucesso');

      // Espera 1.5s e navega pro app principal
      setTimeout(() => {
        setUser({ token, ...dadosCompletos });
      }, 1500);

    } catch (error) {
      console.log('Erro ao criar conta:', error);
      setStatus('erro');
    }
  };

  const tentarNovamente = () => {
    setStatus('salvando');
    criarConta();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {status === 'salvando' && (
          <>
            <ActivityIndicator size="large" color="#FF4B8B" />
            <Text style={styles.titulo}>Criando seu perfil...</Text>
            <Text style={styles.subtitulo}>Só um instante 💕</Text>
          </>
        )}

        {status === 'sucesso' && (
          <>
            <Text style={styles.emoji}>🎉</Text>
            <Text style={styles.titulo}>Bem-vindo ao MeetPerto!</Text>
            <Text style={styles.subtitulo}>Seu perfil foi criado com sucesso</Text>
            <Text style={styles.dica}>Preparando tudo pra você...</Text>
          </>
        )}

        {status === 'erro' && (
          <>
            <Text style={styles.emoji}>😔</Text>
            <Text style={styles.titulo}>Ops, algo deu errado</Text>
            <Text style={styles.subtitulo}>Não conseguimos criar sua conta</Text>
            
            <TouchableOpacity style={styles.botaoTentar} onPress={tentarNovamente}>
              <Text style={styles.botaoTentarTexto}>Tentar novamente</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.voltarTexto}>Voltar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  dica: {
    fontSize: 14,
    color: '#FF4B8B',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 8,
  },
  botaoTentar: {
    backgroundColor: '#FF4B8B',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 32,
  },
  botaoTentarTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  voltarTexto: {
    color: '#FF4B8B',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
});
