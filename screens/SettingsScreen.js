import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Linking } from 'react-native';
import { signOut, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';

export default function SettingsScreen({ navigation }) {
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const user = auth.currentUser;

  // 1. LOGOUT SIMPLES
  const handleLogout = async () => {
    setLoadingLogout(true);
    try {
      await signOut(auth);
      // O App.js com onAuthStateChanged vai jogar pra tela de Login automático
    } catch (error) {
      console.error('Erro logout:', error);
      Alert.alert('Erro', 'Não foi possível sair da conta.');
    } finally {
      setLoadingLogout(false);
    }
  };

  // 2. DELETAR CONTA - FLUXO COMPLETO LGPD
  const confirmarDeleteConta = () => {
    Alert.alert(
      'Deletar conta permanentemente?',
      'Esta ação é irreversível. Todos os seus dados, fotos, matches e conversas serão apagados para sempre, conforme a LGPD Art. 18.\n\nVocê tem certeza?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: () => solicitarSenhaParaDeletar()
        }
      ]
    );
  };

  // 2.1 Pede senha de novo por segurança. Firebase exige reauth
  const solicitarSenhaParaDeletar = () => {
    Alert.prompt(
      'Confirme sua senha',
      'Por segurança, digite sua senha atual para deletar a conta.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: (senha) => deletarContaCompleta(senha)
        }
      ],
      'secure-text' // Esconde a senha
    );
  };

  const deletarContaCompleta = async (senha) => {
    if (!user || !senha) return;
    setLoadingDelete(true);

    try {
      // PASSO 1: Reautenticar. Firebase exige isso pra deletar
      const credential = EmailAuthProvider.credential(user.email, senha);
      await reauthenticateWithCredential(user, credential);

      // PASSO 2: Chama Cloud Function que apaga TUDO no backend
      // Isso garante que apague subcollections, storage, etc. Cliente não consegue
      const deleteFunction = httpsCallable(getFunctions(), 'deletarDadosUsuarioCompleto');
      const result = await deleteFunction();
      
      if (result.data.success) {
        // PASSO 3: Deleta do Firebase Auth. Isso desloga automático
        await deleteUser(user);
        
        Alert.alert(
          'Conta deletada',
          'Todos os seus dados foram apagados permanentemente dos nossos servidores, conforme a LGPD.'
        );
        // App.js vai redirecionar pra AuthScreen sozinho
      } else {
        throw new Error(result.data.error || 'Erro na Cloud Function');
      }

    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      let msg = 'Não foi possível deletar sua conta.';
      if (error.code === 'auth/wrong-password') {
        msg = 'Senha incorreta. Tente novamente.';
      } else if (error.code === 'auth/too-many-requests') {
        msg = 'Muitas tentativas. Tente novamente mais tarde.';
      }
      Alert.alert('Erro', msg);
    } finally {
      setLoadingDelete(false);
    }
  };

  const abrirTermos = async (url) => {
    await WebBrowser.openBrowserAsync(url);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 30 }}>Ajustes</Text>

        {/* SEÇÃO CONTA */}
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#666', marginBottom: 10 }}>Conta</Text>
        
        <TouchableOpacity 
          onPress={() => navigation.navigate('EditarPerfil')}
          style={styles.item}
        >
          <Ionicons name="person-outline" size={22} color="#000" />
          <Text style={styles.itemText}>Editar Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.navigate('Notificacoes')}
          style={styles.item}
        >
          <Ionicons name="notifications-outline" size={22} color="#000" />
          <Text style={styles.itemText}>Notificações</Text>
        </TouchableOpacity>

        {/* SEÇÃO LEGAL */}
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#666', marginTop: 30, marginBottom: 10 }}>Legal</Text>

        <TouchableOpacity 
          onPress={() => abrirTermos('https://github.com/eliasroberto26-arch/encontro-app/blob/main/TERMOS.md')}
          style={styles.item}
        >
          <Ionicons name="document-text-outline" size={22} color="#000" />
          <Text style={styles.itemText}>Termos de Uso</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => abrirTermos('https://github.com/eliasroberto26-arch/encontro-app/blob/main/PRIVACIDADE.md')}
          style={styles.item}
        >
          <Ionicons name="shield-checkmark-outline" size={22} color="#000" />
          <Text style={styles.itemText}>Política de Privacidade</Text>
        </TouchableOpacity>

        {/* SEÇÃO PERIGO */}
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#666', marginTop: 30, marginBottom: 10 }}>Ações</Text>

        <TouchableOpacity 
          onPress={handleLogout}
          disabled={loadingLogout}
          style={styles.item}
        >
          {loadingLogout ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={22} color="#000" />
              <Text style={styles.itemText}>Sair da conta</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={confirmarDeleteConta}
          disabled={loadingDelete}
          style={[styles.item, { marginTop: 20 }]}
        >
          {loadingDelete ? (
            <ActivityIndicator color="#FF3B30" />
          ) : (
            <>
              <Ionicons name="trash-outline" size={22} color="#FF3B30" />
              <Text style={[styles.itemText, { color: '#FF3B30' }]}>Deletar conta</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={{ fontSize: 12, color: '#999', textAlign: 'center', marginTop: 10 }}>
          Conforme LGPD Art. 18, inciso VI. A exclusão é permanente e irreversível.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = {
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  itemText: {
    fontSize: 16,
    marginLeft: 15
  }
};
