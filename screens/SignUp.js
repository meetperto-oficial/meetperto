import { useState } from 'react';
import { View, Text, Linking, Alert, Button, TextInput, ActivityIndicator, Platform } from 'react-native';
import Checkbox from 'expo-checkbox';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../firebaseConfig';
import * as Network from 'expo-network';
import * as Device from 'expo-device';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [loading, setLoading] = useState(false);

  const traduzErroFirebase = (code) => {
    switch (code) {
      case 'auth/email-already-in-use': return 'Este e-mail já está cadastrado.';
      case 'auth/invalid-email': return 'E-mail inválido.';
      case 'auth/weak-password': return 'Senha fraca. Use pelo menos 6 caracteres.';
      default: return 'Erro ao criar conta. Tente novamente.';
    }
  };
  
  const handleCadastro = async () => {
    if (!aceitouTermos) {
      Alert.alert('Atenção', 'Você precisa aceitar os Termos de Uso e Política de Privacidade.');
      return;
    }
    if (!email || !senha) {
      Alert.alert('Atenção', 'Preencha e-mail e senha.');
      return;
    }
    if (senha.length < 6) {
      Alert.alert('Atenção', 'A senha precisa ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      // IP pode falhar, então isolamos
      let ip = 'unknown';
      try {
        ip = await Network.getIpAddressAsync();
      } catch (e) {
        console.warn('Não foi possível obter IP:', e);
      }
      
      await setDoc(doc(db, 'aceites_legal', user.uid), {
        uid: user.uid,
        aceitouTermos: true,
        versaoTermos: '1.0',
        versaoPrivacidade: '1.0',
        ip: ip,
        dataAceite: serverTimestamp(),
        userAgent: `${Platform.OS} - ${Device.modelName || 'unknown'}`,
      });

      Alert.alert('Sucesso', 'Conta criada!');
      // navigation.navigate('Home');
      
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', traduzErroFirebase(error.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20, flex: 1, justifyContent: 'center' }}>
      <TextInput 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 8 }}
        autoCapitalize="none"
        keyboardType="email-address"
        accessibilityLabel="Campo de e-mail"
      />
      <TextInput 
        placeholder="Senha" 
        value={senha} 
        onChangeText={setSenha} 
        secureTextEntry
        style={{ borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 8 }}
        accessibilityLabel="Campo de senha"
      />
      
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginVertical: 20 }}>
        <Checkbox
          value={aceitouTermos}
          onValueChange={setAceitouTermos}
          color={aceitouTermos ? '#4630EB' : undefined}
          accessibilityLabel="Aceitar termos de uso"
        />
        <Text style={{ marginLeft: 8, flex: 1 }}>
          Li e concordo com os{' '}
          <Text style={{ color: '#4630EB', fontWeight: 'bold' }} onPress={() => Linking.openURL('https://github.com/eliasroberto26-arch/encontro-app/blob/main/TERMOS.md')}>
            Termos de Uso
          </Text>
          {' '}e a{' '}
          <Text style={{ color: '#4630EB', fontWeight: 'bold' }} onPress={() => Linking.openURL('https://github.com/eliasroberto26-arch/encontro-app/blob/main/PRIVACIDADE.md')}>
            Política de Privacidade
          </Text>
        </Text>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#4630EB" />
      ) : (
        <Button title="Criar Conta" onPress={handleCadastro} disabled={!aceitouTermos || loading} />
      )}
    </View>
  );
}
