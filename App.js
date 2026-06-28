// App.js - MeetPerto v2.0 - COMPLETO
// Cadastro + App Principal

import React, { useState, useEffect, createContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar, ActivityIndicator, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Telas de Cadastro
import Etapa1Cadastro from './src/screens/auth/Etapa1Cadastro';
import Etapa2Verificacao from './src/screens/auth/Etapa2Verificacao';
import Etapa3Informacoes from './src/screens/auth/Etapa3Informacoes';
import Etapa4Fotos from './src/screens/auth/Etapa4Fotos';
import Etapa5Preferencias from './src/screens/auth/Etapa5Preferencias';
import Etapa6Finalizar from './src/screens/auth/Etapa6Finalizar';

// Telas do App Principal
import FilaLinearScreen from './src/screens/FilaLinearScreen';
import FiltrosScreen from './src/screens/FiltrosScreen';
import RadarScreen from './src/screens/RadarScreen';
import PlanosScreen from './src/screens/PlanosScreen';
import PerfilScreen from './src/screens/PerfilScreen';

// ===== CONTEXTO GLOBAL =====
export const UserContext = createContext();

// ===== CONFIGURAÇÕES GLOBAIS =====
export const CONFIG = {
  SLOGAN: "MeetPerto: O amor não mora longe.",
  COR_PRINCIPAL: '#FF4B8B',
  COR_SECUNDARIA: '#9C27B0',
  
  PLANOS: {
    gratis: {
      nome: 'Grátis 48h',
      preco: 0,
      duracao: 48,
    },
    premium: {
      nome: 'Premium',
      preco: 29.90,
      duracao: 30,
    },
    vip: {
      nome: 'VIP',
      preco: 49.90,
      duracao: 30,
    }
  }
};

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ===== STACK DE AUTENTICAÇÃO =====
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Etapa1Cadastro" component={Etapa1Cadastro} />
      <Stack.Screen name="Etapa2Verificacao" component={Etapa2Verificacao} />
      <Stack.Screen name="Etapa3Informacoes" component={Etapa3Informacoes} />
      <Stack.Screen name="Etapa4Fotos" component={Etapa4Fotos} />
      <Stack.Screen name="Etapa5Preferencias" component={Etapa5Preferencias} />
      <Stack.Screen name="Etapa6Finalizar" component={Etapa6Finalizar} />
    </Stack.Navigator>
  );
}

// ===== TABS DO APP PRINCIPAL =====
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: CONFIG.COR_PRINCIPAL,
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        }
      }}
    >
      <Tab.Screen
        name="Fila"
        component={FilaLinearScreen}
        options={{
          tabBarLabel: 'Fila',
          tabBarIcon: ({color, size}) => <Icon name="cards" size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="Radar"
        component={RadarScreen}
        options={{
          tabBarLabel: 'Radar',
          tabBarIcon: ({color, size}) => <Icon name="radar" size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="Filtros"
        component={FiltrosScreen}
        options={{
          tabBarLabel: 'Filtros',
          tabBarIcon: ({color, size}) => <Icon name="filter-variant" size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="Planos"
        component={PlanosScreen}
        options={{
          tabBarLabel: 'Planos',
          tabBarIcon: ({color, size}) => <Icon name="star" size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({color, size}) => <Icon name="account" size={size} color={color} />
        }}
      />
    </Tab.Navigator>
  );
}

// ===== APP PRINCIPAL =====
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        setUser({ token });
      }
    } catch (error) {
      console.log('Erro ao verificar user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={CONFIG.COR_PRINCIPAL} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserContext.Provider value={{ user, setUser }}>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user ? (
              <Stack.Screen name="Main" component={MainTabs} />
            ) : (
              <Stack.Screen name="Auth" component={AuthStack} />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </UserContext.Provider>
    </GestureHandlerRootView>
  );
}
