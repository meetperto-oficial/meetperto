import { useState } from 'react';
import { View, Text, Linking, Alert, Button, TextInput } from 'react-native'; // ADICIONEI Button e TextInput
import Checkbox from 'expo-checkbox';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth'; // IMPORT NOVO
import { db, auth } from '../firebaseConfig';
import * as Network from 'expo-network';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [aceitouTermos, setAceitouTermos] = useState(false);
  
  const handleCadastro = async () => {
    if (!aceitouTermos) {
      Alert.alert('Erro', 'Você precisa aceitar os Termos de Uso e Política de Privacidade.');
      return;
    }
    if (!email || !senha) {
      Alert.alert('Erro', 'Preencha e-mail e senha.');
      return;
    }

    try {
      // 1. CRIA O USUÁRIO PRIMEIRO
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      // 2. SÓ DEPOIS SALVA O ACEITE
      const ip = await Network.getIpAddressAsync();
      
      await setDoc(doc(db, 'aceites_legal', user.uid), {
        uid: user.uid,
        aceitouTermos: true,
        versaoTermos: '1.0',
        versaoPrivacidade: '1.0',
        ip: ip,
        dataAceite: serverTimestamp(),
        userAgent: 'App Mobile'
      });

      Alert.alert('Sucesso', 'Conta criada!');
      // Aqui você navega pra Home ou Login...
      
    } catch (error) {
      console.error(error);
      Alert.alert('Erro ao criar conta', error.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        autoCapitalize="none"
      />
      <TextInput 
        placeholder="Senha" 
        value={senha} 
        onChangeText={setSenha} 
        secureTextEntry
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      
      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
        <Checkbox
          value={aceitouTermos}
          onValueChange={setAceitouTermos}
          color={aceitouTermos ? '#4630EB' : undefined}
        />
        <Text style={{ marginLeft: 8, flex: 1 }}>
          Li e concordo com os{' '}
          <Text style={{ color: '#4630EB' }} onPress={() => Linking.openURL('https://github.com/eliasroberto26-arch/encontro-app/blob/main/TERMOS.md')}>
            Termos de Uso
          </Text>
          {' '}e a{' '}
          <Text style={{ color: '#4630EB' }} onPress={() => Linking.openURL('https://github.com/eliasroberto26-arch/encontro-app/blob/main/PRIVACIDADE.md')}>
            Política de Privacidade
          </Text>
        </Text>
      </View>
      
      <Button title="Criar Conta" onPress={handleCadastro} disabled={!aceitouTermos} />
    </View>
  );
}
