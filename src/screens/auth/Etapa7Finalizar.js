import React, { useEffect, useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ActivityIndicator, 
  TouchableOpacity 
} from 'react-native';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { UserContext } from '../../contexts/UserContext';

const Etapa7Finalizar = ({ route, navigation }) => {
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
  const [status, setStatus] = useState('salvando');

  useEffect(() => {
    criarConta();
  }, []);

  const criarConta = async () => {
    try {
      const agora = Timestamp.now();
      const expiraEm24h = Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000); // 24h
      
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
        preferencias,
        // LÓGICA DO TRIAL 24H + 50 CURTIDAS
        plano: 'gratis',
        trialExpiraEm: expiraEm24h,
        curtidasRestantes: 50,
        convitesEnviados: 0,
        convitesConvertidos: 0,
        bonusTempo: 0,
        bonusCurtidas: 0,
        criadoEm: agora
      };

      console.log('Enviando pro backend:', dadosCompletos);

      // SALVA NO FIRESTORE
      const user = auth.currentUser;
      await setDoc(doc(db, "users", user.uid), dadosCompletos);
      
      const token = await user.getIdToken();

      setStatus('sucesso');

      // NAVEGA PRO APP PRINCIPAL
      setTimeout(() => {
        setUser({ uid: user.uid, token, ...dadosCompletos });
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
            <Text style={styles.emoji}>😕</Text>
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
};

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
    color: '#999',
    textAlign: 'center',
  },
  botaoTentar: {
    backgroundColor: '#FF4B8B',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 32,
  },
  botaoTentarTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  voltarTexto: {
    color: '#666',
    fontSize: 14,
    marginTop: 16,
  },
});

export default Etapa7Finalizar;
