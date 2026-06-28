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
import ChatMatch from './src/screens/main/ChatMatch';

// Telas de Cadastro
import Etapa1Cadastro from './src/screens/auth/Etapa1Cadastro';
import Etapa2Verificacao from './src/screens/auth/Etapa2Verificacao';
import Etapa3Informacoes from './src/screens/auth/Etapa3Informacoes';
import Etapa4Fotos from './src/screens/auth/Etapa4Fotos';
import Etapa5Preferencias from './src/screens/auth/Etapa5Preferencias';
import Etapa6Termos from './src/screens/auth/Etapa6Termos';
import Etapa7Finalizar from './src/screens/auth/Etapa7Finalizar';

// Telas do App Principal
import HomeFeed from './src/screens/main/HomeFeed';
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
  COR_SECUNDARIA: '#7B61FF',
  API_URL: 'https://api.meetperto.com.br',
};

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ===== STACK DE CADASTRO =====
function CadastroStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Etapa1Cadastro" component={Etapa1Cadastro} />
      <Stack.Screen name="Etapa2Verificacao" component={Etapa2Verificacao} />
      <Stack.Screen name="Etapa3Informacoes" component={Etapa3Informacoes} />
      <Stack.Screen name="Etapa4Fotos" component={Etapa4Fotos} />
      <Stack.Screen name="Etapa5Preferencias" component={Etapa5Preferencias} />
      <Stack.Screen name="Etapa6Termos" component={Etapa6Termos} />
      <Stack.Screen name="Etapa7Finalizar" component={Etapa7Finalizar} />
    </Stack.Navigator>
  );
}

// ===== STACK PRINCIPAL DO APP =====
function AppPrincipalStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeFeed" component={HomeFeed} />
      <Stack.Screen name="FilaLinearScreen" component={FilaLinearScreen} />
      <Stack.Screen name="FiltrosScreen" component={FiltrosScreen} />
      <Stack.Screen name="RadarScreen" component={RadarScreen} />
      <Stack.Screen name="PlanosScreen" component={PlanosScreen} />
      <Stack.Screen name="PerfilScreen" component={PerfilScreen} />
    </Stack.Navigator>
  );
}

// ===== APP PRINCIPAL =====
export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Verifica se usuário já está logado
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const data = await AsyncStorage.getItem('userData');
        
        if (token && data) {
          setUserToken(token);
          setUserData(JSON.parse(data));
        }
      } catch (e) {
        console.log('Erro ao carregar dados:', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: CONFIG.COR_PRINCIPAL }}>
        <ActivityIndicator size="large" color="#FFF" />
        <StatusBar barStyle="light-content" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserContext.Provider value={{ userToken, setUserToken, userData, setUserData }}>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
          {userToken == null ? <CadastroStack /> : <AppPrincipalStack />}
        </NavigationContainer>
      </UserContext.Provider>
    </GestureHandlerRootView>
  );
}
