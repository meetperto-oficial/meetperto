import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Etapa1Cadastro({ navigation }) {
  const [metodo, setMetodo] = useState('email');
  const [valor, setValor] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validarTelefone = (tel) => {
    const regex = /^\(?[1-9]{2}\)? ?(?:[2-8]|9[1-9])[0-9]{3}\-?[0-9]{4}$/;
    return regex.test(tel.replace(/\D/g, ''));
  };

  const formatarTelefone = (text) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length >= 2) {
      formatted = `(${cleaned.slice(0, 2)}) `;
      if (cleaned.length >= 3) {
        formatted += `${cleaned.slice(2, 7)}`;
        if (cleaned.length >= 8) {
          formatted += `-${cleaned.slice(7, 11)}`;
        }
      }
    }
    return formatted;
  };

  const handleContinuar = async () => {
    if (!valor) {
      Alert.alert('Erro', 'Preencha seu e-mail ou telefone');
      return;
    }

    if (metodo === 'email' && !validarEmail(valor)) {
      Alert.alert('E-mail inválido', 'Digite um e-mail válido');
      return;
    }

    if (metodo === 'telefone' && !validarTelefone(valor)) {
      Alert.alert('Telefone inválido', 'Digite um telefone válido');
      return;
    }

    // VALIDAÇÃO DE SENHA CORRIGIDA - SEMPRE VALIDA
    if (senha.length < 8) {
      Alert.alert('Senha fraca', 'A senha precisa ter no mínimo 8 caracteres');
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // CORRIGIDO - SEMPRE PASSA A SENHA
      navigation.navigate('Etapa2Verificacao', {
        metodo,
        valor,
        senha,
      });
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          <Text style={styles.logo}>MeetPerto</Text>
          <Text style={styles.titulo}>O amor não mora longe</Text>

          <Text style={styles.subtitulo}>Como você quer se cadastrar?</Text>

          <View style={styles.metodoContainer}>
            <TouchableOpacity
              style={[styles.metodoBtn, metodo === 'email' && styles.metodoAtivo]}
              onPress={() => {
                setMetodo('email');
                setValor('');
              }}
            >
              <Text style={[styles.metodoTexto, metodo === 'email' && styles.metodoTextoAtivo]}>
                E-mail
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.metodoBtn, metodo === 'telefone' && styles.metodoAtivo]}
              onPress={() => {
                setMetodo('telefone');
                setValor('');
              }}
            >
              <Text style={[styles.metodoTexto, metodo === 'telefone' && styles.metodoTextoAtivo]}>
                Telefone
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder={metodo === 'email' ? 'seu@email.com' : '(11) 99999-9999'}
            placeholderTextColor="#999"
            value={valor}
            onChangeText={(text) => {
              if (metodo === 'telefone') {
                setValor(formatarTelefone(text));
              } else {
                setValor(text.toLowerCase());
              }
            }}
            keyboardType={metodo === 'email' ? 'email-address' : 'phone-pad'}
            autoCapitalize="none"
            maxLength={metodo === 'telefone' ? 15 : 50}
          />

          <TextInput
            style={styles.input}
            placeholder="Crie uma senha forte"
            placeholderTextColor="#999"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Confirme sua senha"
            placeholderTextColor="#999"
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.botao, loading && styles.botaoDesabilitado]}
            onPress={handleContinuar}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.botaoTexto}>Continuar</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.termos}>
            Ao continuar, você receberá um código de verificação
          </Text>
        </View>
      </KeyboardAvoidingView>
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
    padding: 24,
    justifyContent: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FF4B8B',
    marginBottom: 8,
  },
  titulo: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  metodoContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  metodoBtn: {
    flex: 1,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    alignItems: 'center',
  },
  metodoAtivo: {
    borderColor: '#FF4B8B',
    backgroundColor: '#FFF0F5',
  },
  metodoTexto: {
    fontSize: 16,
    color: '#666',
  },
  metodoTextoAtivo: {
    color: '#FF4B8B',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
  },
  botao: {
    backgroundColor: '#FF4B8B',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  botaoDesabilitado: {
    opacity: 0.6,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  termos: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginTop: 16,
  },
});
