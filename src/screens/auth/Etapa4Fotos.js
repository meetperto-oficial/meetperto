import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  ScrollView, Alert, SafeAreaView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CONFIG } from '../../../App';

export default function Etapa4Fotos({ navigation }) {
  const [photos, setPhotos] = useState([null, null, null, null]);

  const pickImage = async (index) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status!== 'granted') {
      Alert.alert('Erro', 'Preciso de permissão pra acessar suas fotos');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      const newPhotos = [...photos];
      newPhotos[index] = result.assets[0].uri;
      setPhotos(newPhotos);
    }
  };

  const removePhoto = (index) => {
    const newPhotos = [...photos];
    newPhotos[index] = null;
    setPhotos(newPhotos);
  };

  const handleContinue = () => {
    const photosCount = photos.filter(p => p!== null).length;
    if (photosCount < 2) {
      Alert.alert('Ops!', 'Adiciona pelo menos 2 fotos pra continuar');
      return;
    }
    // AGORA VAI PRO SELFIE LIVENESS ANTES DOS TERMOS
    navigation.navigate('SelfieLiveness');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Fotos</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Adicione suas melhores fotos 📸</Text>
          <Text style={styles.subtitle}>Mínimo 2 fotos. A primeira será sua foto principal.</Text>

          <View style={styles.grid}>
            {photos.map((photo, index) => (
              <TouchableOpacity
                key={index}
                style={styles.photoBox}
                onPress={() => photo? removePhoto(index) : pickImage(index)}
              >
                {photo? (
                  <>
                    <Image source={{ uri: photo }} style={styles.photo} />
                    <View style={styles.removeButton}>
                      <Icon name="close" size={20} color="#FFF" />
                    </View>
                    {index === 0 && (
                      <View style={styles.mainBadge}>
                        <Text style={styles.mainText}>Principal</Text>
                      </View>
                    )}
                  </>
                ) : (
                  <View style={styles.addBox}>
                    <Icon name="plus" size={40} color="#CCC" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.tips}>
            <Text style={styles.tipsTitle}>💡 Dicas pra bombar:</Text>
            <Text style={styles.tipText}>• Sorria nas fotos</Text>
            <Text style={styles.tipText}>• Mostre seu rosto claramente</Text>
            <Text style={styles.tipText}>• Evite fotos de grupo</Text>
            <Text style={styles.tipText}>• Varie os ângulos</Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, photos.filter(p => p!== null).length < 2 && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={photos.filter(p => p!== null).length < 2}
          >
            <Text style={styles.buttonText}>Continuar</Text>
            <Icon name="arrow-right" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 15, borderBottomWidth: 1, borderBottomColor: '#EEE'
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 25 },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 15
  },
  photoBox: {
    width: '48%', aspectRatio: 3/4, borderRadius: 12, overflow: 'hidden',
    backgroundColor: '#F5F5F5', marginBottom: 15
  },
  photo: { width: '100%', height: '100%' },
  addBox: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#DDD', borderStyle: 'dashed', borderRadius: 12
  },
  removeButton: {
    position: 'absolute', top: 8, right: 8, backgroundColor: '#F44336',
    width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center'
  },
  mainBadge: {
    position: 'absolute', bottom: 8, left: 8, backgroundColor: CONFIG.COR_PRINCIPAL,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12
  },
  mainText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  tips: {
    backgroundColor: '#F8F8F8', padding: 15, borderRadius: 12, marginTop: 20
  },
  tipsTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  tipText: { fontSize: 14, color: '#666', marginBottom: 5 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#EEE' },
  button: {
    backgroundColor: CONFIG.COR_PRINCIPAL, flexDirection: 'row',
    padding: 16, borderRadius: 25, alignItems: 'center', justifyContent: 'center'
  },
  buttonDisabled: { backgroundColor: '#CCC' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginRight: 8 },
});
