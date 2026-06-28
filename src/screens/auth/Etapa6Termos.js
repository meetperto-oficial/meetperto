import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Etapa6Termos({ route, navigation }) {
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [aceitouPrivacidade, setAceitouPrivacidade] = useState(false);
  const [maior18, setMaior18] = useState(false);
  const [aceitouLocalizacao, setAceitouLocalizacao] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const abrirTermosCompletos = () => {
    Linking.openURL('https://meetperto.com.br/termos');
  };

  const abrirPoliticaPrivacidade = () => {
    Linking.openURL('https://meetperto.com.br/privacidade');
  };

  const handleFinalizar = () => {
    if (!maior18) {
      Alert.alert(
        'Idade mínima',
        'Você precisa confirmar que tem 18 anos ou mais para usar o MeetPerto.'
      );
      return;
    }

    if (!aceitouTermos) {
      Alert.alert(
        'Termos de Uso',
        'Você precisa aceitar os Termos de Uso para criar sua conta.'
      );
      return;
    }

    if (!aceitouPrivacidade) {
      Alert.alert(
        'Política de Privacidade',
        'Você precisa aceitar a Política de Privacidade para criar sua conta.'
      );
      return;
    }

    if (!aceitouLocalizacao) {
      Alert.alert(
        'Localização',
        'O MeetPerto precisa da sua localização para mostrar pessoas próximas. Ative a permissão para continuar.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Entendi', 
            onPress: () => setAceitouLocalizacao(true) 
          }
        ]
      );
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('Etapa7Finalizar', {
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
        termosAceitos: {
          termos: true,
          privacidade: true,
          maior18: true,
          localizacao: true,
          dataAceite: new Date().toISOString()
        }
      });
    }, 800);
  };

  const todosAceitos = maior18 && aceitouTermos && aceitouPrivacidade && aceitouLocalizacao;

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.voltar}>
        <Text style={styles.voltarTexto}>← Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.logo}>MeetPerto</Text>
      <Text style={styles.titulo}>Último passo</Text>
      <Text style={styles.subtitulo}>Leia e aceite os termos para criar sua conta</Text>

      <ScrollView style={styles.termosBox} showsVerticalScrollIndicator={false}>
        <Text style={styles.termosTitulo}>📋 Termos de Uso</Text>
        <Text style={styles.termosTexto}>
          1. Você deve ter 18 anos ou mais para usar o app.{'\n\n'}
          2. Proibido nudez, assédio, discurso de ódio ou conteúdo ilegal.{'\n\n'}
          3. Suas fotos devem ser reais, atuais e mostrar seu rosto claramente.{'\n\n'}
          4. Perfis falsos, bots ou spam resultam em ban permanente.{'\n\n'}
          5. Você pode deletar sua conta e dados a qualquer momento.{'\n\n'}
          6. Denúncias falsas ou abuso do sistema de report serão punidos.
        </Text>

        <TouchableOpacity onPress={abrirTermosCompletos}>
          <Text style={styles.linkTexto}>Ver Termos Completos →</Text>
        </TouchableOpacity>

        <Text style={styles.termosTitulo}>🔒 Política de Privacidade</Text>
        <Text style={styles.termosTexto}>
          1. Não vendemos seus dados para terceiros.{'\n\n'}
          2. GPS é coletado apenas com o app aberto para mostrar distância.{'\n\n'}
          3. Mostramos "A menos de 500m", nunca seu endereço exato.{'\n\n'}
          4. Senhas criptografadas com Argon2 + salt único.{'\n\n'}
          5. Chat entre matches é criptografado ponta-a-ponta.{'\n\n'}
          6. Você controla quem vê seu perfil nas configurações.
        </Text>

        <TouchableOpacity onPress={abrirPoliticaPrivacidade}>
          <Text style={styles.linkTexto}>Ver Política Completa →</Text>
        </TouchableOpacity>

        <Text style={styles.termosTitulo}>📍 Uso de Localização</Text>
        <Text style={styles.termosTexto}>
          O MeetPerto usa sua localização para:{'\n\n'}
          • Mostrar pessoas próximas de você{'\n'}
          • Ativar o Modo Radar em eventos{'\n'}
          • Detectar Caminhos Cruzados{'\n\n'}
          Sua localização exata nunca é compartilhada com outros usuários.
        </Text>
      </ScrollView>

      <View style={styles.checkboxContainer}>
        <Switch
          value={maior18}
          onValueChange={setMaior18}
          trackColor={{ false: '#E0E0E0', true: '#FF4B8B' }}
          thumbColor={maior18 ? '#fff' : '#f4f3f4'}
        />
        <Text style={styles.checkboxTexto}>
          Confirmo que tenho 18 anos ou mais
        </Text>
      </View>

      <View style={styles.checkboxContainer}>
        <Switch
          value={aceitouTermos}
          onValueChange={setAceitouTermos}
          trackColor={{ false: '#E0E0E0', true: '#FF4B8B' }}
          thumbColor={aceitouTermos ? '#fff' : '#f4f3f4'}
        />
        <Text style={styles.checkboxTexto}>
          Li e aceito os Termos de Uso
        </Text>
      </View>

      <View style={styles.checkboxContainer}>
        <Switch
          value={aceitouPrivacidade}
          onValueChange={setAceitouPrivacidade}
          trackColor={{ false: '#E0E0E0', true: '#FF4B8B' }}
          thumbColor={aceitouPrivacidade ? '#fff' : '#f4f3f4'}
        />
        <Text style={styles.checkboxTexto}>
          Li e aceito a Política de Privacidade
        </Text>
      </View>

      <View style={styles.checkboxContainer}>
        <Switch
          value={aceitouLocalizacao}
          onValueChange={setAceitouLocalizacao}
          trackColor={{ false: '#E0E0E0', true: '#FF4B8B' }}
          thumbColor={aceitouLocalizacao ? '#fff' : '#f4f3f4'}
        />
        <Text style={styles.checkboxTexto}>
          Permito uso de localização para matches
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.botao,
          !todosAceitos && styles.botaoDesabilitado
        ]}
        onPress={handleFinalizar}
        disabled={!todosAceitos || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.botaoTexto}>
            {todosAceitos ? 'Criar minha conta' : 'Aceite todos os termos'}
          </Text>
        )}
      </TouchableOpacity>

      <Text style={styles.rodapé}>
        Ao criar sua conta, você concorda com todos os termos acima
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  voltar: {
    marginBottom: 20,
  },
  voltarTexto: {
    fontSize: 16,
    color: '#FF4B8B',
    fontWeight: '600',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FF4B8B',
    marginBottom: 8,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  termosBox: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    maxHeight: 280,
  },
  termosTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  termosTexto: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  linkTexto: {
    fontSize: 14,
    color: '#FF4B8B',
    fontWeight: '600',
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  checkboxTexto: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
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
  rodapé: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 20,
  },
});
