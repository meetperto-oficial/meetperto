import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, Image } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CONFIG } from '../../../App';

const { width, height } = Dimensions.get('window');

export default function ModoRadar({ navigation }) {
  const [location, setLocation] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [mapRegion, setMapRegion] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Preciso do GPS pra mostrar o radar!');
        return;
      }

      let userLocation = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      };
      
      setLocation(coords);
      setMapRegion({
        ...coords,
        latitudeDelta: 0.005, // Zoom próximo = 200m
        longitudeDelta: 0.005,
      });

      // MOCK: pessoas online próximas - depois troca por API real
      setOnlineUsers([
        { 
          id: 1, 
          name: 'Juliana', 
          photo: 'https://i.pravatar.cc/100?img=5',
          latitude: coords.latitude + 0.0008, 
          longitude: coords.longitude + 0.0005,
          distance: 120 
        },
        { 
          id: 2, 
          name: 'Camila', 
          photo: 'https://i.pravatar.cc/100?img=9',
          latitude: coords.latitude - 0.0006, 
          longitude: coords.longitude - 0.0003,
          distance: 80 
        },
        { 
          id: 3, 
          name: 'Larissa', 
          photo: 'https://i.pravatar.cc/100?img=20',
          latitude: coords.latitude + 0.0003, 
          longitude: coords.longitude - 0.0009,
          distance: 180 
        },
      ]);
    })();
  }, []);

  if (!mapRegion) {
    return (
      <View style={styles.loading}>
        <Icon name="radar" size={50} color={CONFIG.COR_PRINCIPAL} />
        <Text style={styles.loadingText}>Ativando radar...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map} 
        region={mapRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {/* Círculo de 200m */}
        <Circle
          center={location}
          radius={200}
          strokeColor={CONFIG.COR_PRINCIPAL}
          fillColor={`${CONFIG.COR_PRINCIPAL}20`}
          strokeWidth={2}
        />

        {/* Marcadores das pessoas online */}
        {onlineUsers.map((user) => (
          <Marker
            key={user.id}
            coordinate={{ latitude: user.latitude, longitude: user.longitude }}
            onPress={() => navigation.navigate('ChatMatch', { match: user })}
          >
            <View style={styles.markerContainer}>
              <Image source={{ uri: user.photo }} style={styles.markerImage} />
              <View style={styles.onlineDot} />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Modo Radar</Text>
          <Text style={styles.headerSubtitle}>{onlineUsers.length} pessoas online</Text>
        </View>
        <TouchableOpacity>
          <Icon name="filter-variant" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Legenda */}
      <View style={styles.legend}>
        <Icon name="circle" size={12} color={CONFIG.COR_PRINCIPAL} />
        <Text style={styles.legendText}>Raio de 200m</Text>
        <View style={styles.dot} />
        <Text style={styles.legendText}>Online agora</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width, height },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  header: {
    position: 'absolute', top: 50, left: 15, right: 15,
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#FFF', padding: 15, borderRadius: 15,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 5,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 12, color: '#666' },
  markerContainer: { alignItems: 'center' },
  markerImage: { 
    width: 50, height: 50, borderRadius: 25, 
    borderWidth: 3, borderColor: CONFIG.COR_PRINCIPAL 
  },
  onlineDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#4CAF50', borderWidth: 2, borderColor: '#FFF'
  },
  legend: {
    position: 'absolute', bottom: 30, alignSelf: 'center',
    flexDirection: 'row', backgroundColor: '#FFF', 
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20,
    alignItems: 'center', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 5,
  },
  legendText: { fontSize: 12, color: '#333' },
  dot: { 
    width: 12, height: 12, borderRadius: 6, 
    backgroundColor: '#4CAF50', marginLeft: 10 
  },
});
