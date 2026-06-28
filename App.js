import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

// AUTH - CADASTRO
import Etapa1Cadastro from './src/screens/auth/Etapa1Cadastro';
import Etapa2Verificacao from './src/screens/auth/Etapa2Verificacao';
import Etapa3Informacoes from './src/screens/auth/Etapa3Informacoes';
import Etapa4Fotos from './src/screens/auth/Etapa4Fotos';
import SelfieLiveness from './src/screens/auth/SelfieLiveness';
import Etapa5Preferencias from './src/screens/auth/Etapa5Preferencias';
import Etapa6Termos from './src/screens/auth/Etapa6Termos';
import Etapa7Finalizar from './src/screens/auth/Etapa7Finalizar';

// MAIN - APP PRINCIPAL
import HomeFeed from './src/screens/main/HomeFeed';
import ChatMatch from './src/screens/main/ChatMatch';
import ModoRadar from './src/screens/main/ModoRadar';
import Perfil from './src/screens/main/Perfil';

const Stack = createStackNavigator();

export const CONFIG = {
  COR_PRINCIPAL: '#FF4458',
  COR_SECUNDARIA: '#9C27B0',
  RAIO_MATCH: 5, // km
};

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (userToken) {
        setInitialRoute('HomeFeed');
      } else {
        setInitialRoute('Etapa1Cadastro');
      }
    } catch (e) {
      setInitialRoute('Etapa1Cadastro');
    }
  };

  if (!initialRoute) {
    return null; // Loading
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator 
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        {/* FLUXO DE CADASTRO */}
        <Stack.Screen name="Etapa1Cadastro" component={Etapa1Cadastro} />
        <Stack.Screen name="Etapa2Verificacao" component={Etapa2Verificacao} />
        <Stack.Screen name="Etapa3Informacoes" component={Etapa3Informacoes} />
        <Stack.Screen name="Etapa4Fotos" component={Etapa4Fotos} />
        <Stack.Screen name="SelfieLiveness" component={SelfieLiveness} />
        <Stack.Screen name="Etapa5Preferencias" component={Etapa5Preferencias} />
        <Stack.Screen name="Etapa6Termos" component={Etapa6Termos} />
        <Stack.Screen name="Etapa7Finalizar" component={Etapa7Finalizar} />

        {/* APP PRINCIPAL */}
        <Stack.Screen name="HomeFeed" component={HomeFeed} />
        <Stack.Screen name="ChatMatch" component={ChatMatch} />
        <Stack.Screen name="ModoRadar" component={ModoRadar} />
        <Stack.Screen name="Perfil" component={Perfil} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
