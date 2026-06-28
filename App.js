// App.js - MeetPerto v2.0
// ONDE MUDAR: PLANOS, FAIXAS DE DISTÂNCIA, CORES, IDADE

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import FilaLinearScreen from './screens/FilaLinearScreen';
import FiltrosScreen from './screens/FiltrosScreen';
import RadarScreen from './screens/RadarScreen';
import PlanosScreen from './screens/PlanosScreen';
import PerfilScreen from './screens/PerfilScreen';

// ===== ONDE MUDAR: CONFIGURAÇÕES GLOBAIS =====
export const CONFIG = {
  SLOGAN: "MeetPerto: O amor não mora longe.",
  COR_PRINCIPAL: '#E91E63',
  COR_SECUNDARIA: '#9C27B0',
  
  // ONDE MUDAR: PLANOS E VALORES
  PLANOS: {
    gratis: { nome: 'Grátis 48h', curtidas: 50, bonus: 0, valor: 0 },
    mensal: { nome: 'Mensal', curtidas: 200, bonus: 0, valor: 49.90 },
    trimestral: { nome: 'Trimestral', curtidas: 800, bonus: 300, valor: 119.90 },
    semestral: { nome: 'Semestral', curtidas: 2000, bonus: 600, valor: 199.90 }
  },
  
  // ONDE MUDAR: FAIXAS DE DISTÂNCIA - NUNCA USE METROS EXATOS
  FAIXAS_DISTANCIA: [
    "A menos de 500m",
    "Aprox. 1km", 
    "Aprox. 3km",
    "Aprox. 5km+"
  ],
  
  // ONDE MUDAR: IDADE MIN E MAX
  IDADE_MIN: 18,
  IDADE_MAX: 70
};
// ===== FIM DAS CONFIGURAÇÕES =====

const Tab = createBottomTabNavigator();

export default function App() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    carregarDadosUsuario();
  }, []);

  // ONDE MUDAR: LÓGICA DE 48H GRÁTIS + BÔNUS
  const carregarDadosUsuario = async () => {
    try {
      const dados = await AsyncStorage.getItem('meetperto_user');
      if (dados) {
        const user = JSON.parse(dados);
        const horasDesdeCadastro = (Date.now() - user.cadastro) / 1000 / 60 / 60;
        const horasTotais = 48 + (user.horasBonus || 0);
        
        // Verifica se período grátis acabou E sem curtidas
        if (user.plano === 'gratis' && horasDesdeCadastro > horasTotais && user.curtidasRestantes <= 0) {
          Alert.alert('Período Grátis Encerrado', 'Escolha um plano para continuar curtindo');
        }
        setUserData(user);
      } else {
        // Primeiro acesso - cria usuário com 48h grátis
        const novoUser = {
          cadastro: Date.now(),
          plano: 'gratis',
          curtidasRestantes: CONFIG.PLANOS.gratis.curtidas,
          horasBonus: 0,
          convites: 0,
          filtros: { 
            busca: 'mulher', 
            idadeMin: CONFIG.IDADE_MIN, 
            idadeMax: CONFIG.IDADE_MAX, 
            estilo: 'gosto de todas' 
          }
        };
        await AsyncStorage.setItem('meetperto_user', JSON.stringify(novoUser));
        setUserData(novoUser);
      }
    } catch (e) {
      console.error('Erro ao carregar usuário:', e);
    }
  };

  if (!userData) return null; // Loading

  return (
    <NavigationContainer>
      <StatusBar backgroundColor={CONFIG.COR_PRINCIPAL} barStyle="light-content" />
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: CONFIG.COR_PRINCIPAL,
          tabBarInactiveTintColor: '#999',
          headerShown: false,
          tabBarStyle: { paddingBottom: 5, height: 60 }
        }}>
        <Tab.Screen 
          name="Fila" 
          component={FilaLinearScreen}
          options={{ 
            tabBarLabel: 'Início',
            tabBarIcon: ({color}) => <Icon name="heart" size={26} color={color} /> 
          }}
        />
        <Tab.Screen 
          name="Radar" 
          component={RadarScreen}
          options={{ 
            tabBarLabel: 'Radar',
            tabBarIcon: ({color}) => <Icon name="radar" size={26} color={color} /> 
          }}
        />
        <Tab.Screen 
          name="Filtros" 
          component={FiltrosScreen}
          options={{ 
            tabBarLabel: 'Filtros',
            tabBarIcon: ({color}) => <Icon name="filter-variant" size={26} color={color} /> 
          }}
        />
        <Tab.Screen 
          name="Planos" 
          component={PlanosScreen}
          options={{ 
            tabBarLabel: 'Planos',
            tabBarIcon: ({color}) => <Icon name="crown" size={26} color={color} /> 
          }}
        />
        <Tab.Screen 
          name="Perfil" 
          component={PerfilScreen}
          options={{ 
            tabBarLabel: 'Perfil',
            tabBarIcon: ({color}) => <Icon name="account" size={26} color={color} /> 
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
