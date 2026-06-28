// screens/FiltrosScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { UserContext, CONFIG } from '../App';

export default function FiltrosScreen() {
  const { userData } = useContext(UserContext);
  const [idadeMin, setIdadeMin] = useState(CONFIG.IDADE_MIN);
  const [idadeMax, setIdadeMax] = useState(CONFIG.IDADE_MAX);
  const [estiloSelecionado, setEstiloSelecionado] = useState('gosto de todas');

  const idades = [];
  for (let i = CONFIG.IDADE_MIN; i <= CONFIG.IDADE_MAX; i++) {
    idades.push(i);
  }

  const estilos = userData?.genero === 'masculino' ? CONFIG.ESTILOS_MULHER : CONFIG.ESTILOS_HOMEM;

  const salvarFiltros = () => {
    // ONDE MUDAR: Salvar filtros na sua API/Banco
    alert(`Filtros salvos: ${idadeMin}-${idadeMax} anos, Estilo: ${estiloSelecionado}`);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Filtros MeetPerto</Text>
      
      <Text style={styles.label}>Idade mínima</Text>
      <Picker
        selectedValue={idadeMin}
        onValueChange={(itemValue) => setIdadeMin(itemValue)}
        style={styles.picker}>
        {idades.map(idade => (
          <Picker.Item key={idade} label={`${idade} anos`} value={idade} />
        ))}
      </Picker>

      <Text style={styles.label}>Idade máxima</Text>
      <Picker
        selectedValue={idadeMax}
        onValueChange={(itemValue) => setIdadeMax(itemValue)}
        style={styles.picker}>
        {idades.map(idade => (
          <Picker.Item key={idade} label={`${idade} anos`} value={idade} />
        ))}
      </Picker>

      <Text style={styles.label}>Estilo preferido</Text>
      <Picker
        selectedValue={estiloSelecionado}
        onValueChange={(itemValue) => setEstiloSelecionado(itemValue)}
        style={styles.picker}>
        {estilos.map(estilo => (
          <Picker.Item key={estilo} label={estilo.charAt(0).toUpperCase() + estilo.slice(1)} value={estilo} />
        ))}
      </Picker>

      <TouchableOpacity style={styles.botaoSalvar} onPress={salvarFiltros}>
        <Text style={styles.botaoTexto}>Salvar Filtros</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#FFF5F8' },
  titulo: { fontSize: 22, fontWeight: 'bold', color: CONFIG.COR_PRINCIPAL, marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  picker: { backgroundColor: '#fff', borderRadius: 8 },
  botaoSalvar: { backgroundColor: CONFIG.COR_PRINCIPAL, padding: 15, borderRadius: 8, marginTop: 30 },
  botaoTexto: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 16 }
});
