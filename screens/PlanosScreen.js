// screens/PlanosScreen.js
import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { UserContext, CONFIG } from '../App';

export default function PlanosScreen() {
  const { userData } = useContext(UserContext);

  const comprarPlano = (plano) => {
    // ONDE MUDAR: Integrar com gateway de pagamento
    Alert.alert(
      'Assinar Plano',
      `Confirmar assinatura do ${plano.nome} por R$${plano.preco}?`,
      [
        { text: 'Cancelar' },
        { text: 'Assinar', onPress: () => Alert.alert('Sucesso', 'Plano ativado!') }
      ]
    );
  };

  const indicarAmigo = () => {
    // ONDE MUDAR: Gerar link de indicação real
    Alert.alert('Indique e Ganhe', 'Compartilhe: meetperto.com/r/12345\nVocê ganha 7 dias Premium por amigo que assinar');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Escolha seu Plano MeetPerto</Text>
      <Text style={styles.subtitulo}>Plano atual: {userData?.plano || 'Free'}</Text>

      {CONFIG.PLANOS.map((plano, index) => (
        <View key={index} style={[styles.card, plano.destaque && styles.cardDestaque]}>
          {plano.destaque && <Text style={styles.selo}>MAIS POPULAR</Text>}
          <Text style={styles.nomePlano}>{plano.nome}</Text>
          <Text style={styles.preco}>R${plano.preco.toFixed(2)}<Text style={styles.mes}>/mês</Text></Text>
          
          {plano.curtidasExtras > 0 && (
            <Text style={styles.beneficio}>+ {plano.curtidasExtras} curtidas/mês</Text>
          )}
          
          {plano.beneficios.map((beneficio, i) => (
            <Text key={i} style={styles.item}>✓ {beneficio}</Text>
          ))}

          <TouchableOpacity 
            style={[styles.botao, plano.destaque && styles.botaoDestaque]} 
            onPress={() => comprarPlano(plano)}>
            <Text style={styles.botaoTexto}>Assinar Agora</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.botaoIndicar} onPress={indicarAmigo}>
        <Text style={styles.botaoIndicarTexto}>🎁 Indique um amigo e ganhe 7 dias Premium</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#FFF5F8' },
  titulo: { fontSize: 24, fontWeight: 'bold', color: CONFIG.COR_PRINCIPAL, textAlign: 'center', marginBottom: 8 },
  subtitulo: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 20, marginBottom: 16, borderRadius: 16, elevation: 3 },
  cardDestaque: { borderWidth: 2, borderColor: CONFIG.COR_PRINCIPAL },
  selo: { backgroundColor: CONFIG.COR_SECUNDARIA, color: '#fff', alignSelf: 'center', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, fontWeight: 'bold', marginBottom: 8, fontSize: 12 },
  nomePlano: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  preco: { fontSize: 32, fontWeight: 'bold', color: CONFIG.COR_PRINCIPAL, textAlign: 'center' },
  mes: { fontSize: 16, color: '#666' },
  beneficio: { fontSize: 16, color: CONFIG.COR_SECUNDARIA, textAlign: 'center', marginVertical: 8, fontWeight: '600' },
  item: { fontSize: 15, marginTop: 8, color: '#444' },
  botao: { backgroundColor: '#444', padding: 14, borderRadius: 8, marginTop: 16 },
  botaoDestaque: { backgroundColor: CONFIG.COR_PRINCIPAL },
  botaoTexto: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  botaoIndicar: { backgroundColor: CONFIG.COR_SECUNDARIA, padding: 16, borderRadius: 12, marginTop: 10, marginBottom: 30 },
  botaoIndicarTexto: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 15 }
});
