import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

export default function Etapa4Fotos({ route, navigation }) {
  const {
    metodo,
    valor,
    senha,
    verificado,
    nome,
    dataNascimento,
    idade,
    genero,
    cidade
  } = route.params;

  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(false);

  const solicitarPermissao = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status!== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de acesso à sua galeria para você adicionar fotos.'
      );
      return false;
    }
    return true;
  };

  const solicitarPermissaoCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status!== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de acesso à sua câmera para você tirar fotos.'
      );
      return false;
    }
    return true;
  };

  const escolherFoto = () => {
    if (fotos.length >= 6) {
      Alert.alert('Limite atingido', 'Você pode adicionar no máximo 6 fotos.');
      return;
    }

    Alert.alert(
      'Adicionar foto',
      'Como você quer adicionar sua foto?',
      [
        {
          text: 'Câmera',
          onPress: abrirCamera
        },
        {
          text: 'Galeria',
          onPress: abrirGaleria
        },
        {
          text: 'Cancelar',
          style: 'cancel'
        }
      ]
    );
  };

  const abrirCamera = async () => {
    const permissao = await solicitarPermissaoCamera();
    if (!permissao) return;

    const resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });

    if (!resultado.canceled) {
      setFotos([...fotos, resultado.assets[0].uri]);
    }
  };

  const abrirGaleria = async () => {
    const permissao = await solicitarPermissao();
    if (!permissao) return;

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 6 - fotos.length,
    });

    if (!resultado.canceled) {
      const novasFotos = resultado.assets.map(asset => asset.uri);
      setFotos([...fotos,...novasFotos]);
    }
  };

  const removerFoto = (index) => {
    Alert.alert(
      'Remover foto',
      'Deseja remover esta foto?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            const novasFotos = fotos.filter((_, i) => i!== index);
            setFotos(novasFotos);
          }
        }
      ]
    );
  };

  const handleContinuar = () => {
    if (fotos.length < 2) {
      Alert.alert(
        'Fotos insuficientes',
        'Adicione pelo menos 2 fotos para continuar. Isso aumenta suas chances de dar match!'
      );
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('Etapa5Preferencias', {
        metodo,
        valor,
        senha,
        verificado,
        nome,
        dataNascimento,
        idade,
        genero,
        cidade,
        fotos
      });
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.voltar}>
          <Text style={styles.voltarTexto}>← Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.logo}>MeetPerto</Text>
        <Text style={styles.titulo}>Adicione suas fotos</Text>
        <Text style={styles.subtitulo}>
          Perfis com 2+ fotos recebem 3x mais matches
        </Text>

        <View style={styles.grid}>
          {fotos.map((foto, index) => (
            <View key={index} style={styles.fotoContainer}>
              <Image source={{ uri: foto }} style={styles.foto} />
              <TouchableOpacity
                style={styles
