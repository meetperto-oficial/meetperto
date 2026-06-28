// App.js - MeetPerto v2.0 - COMPLETO
// Todas as regras implementadas: 48h grátis, 3 planos, bônus, convite, chat grátis

import React, { useState, useEffect, createContext } from 'react';
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

// ===== CONFIGURAÇÕES GLOBAIS - ONDE MUDAR TUDO =====
export const CONFIG = {
  SLOGAN: "MeetPerto: O amor não mora longe.",
  COR_PRINCIPAL: '#E91E63',
  COR_SECUNDARIA: '#9C27B0',
  
  // PLANOS E VALORES - COMPLETO
  PLANOS: {
    gratis: { 
      nome: 'Grátis 48h', 
      curtidas: 50, 
      bonus: 0, 
      valor: 0,
      duracaoDias: 2 
    },
    mensal: { 
      nome: 'Mensal', 
      curtidas: 200, 
      bonus: 0, 
      valor: 49.90,
      duracaoDias: 30 
    },
    trimestral: { 
      nome: 'Trimestral', 
      curtidas: 800, 
      bonus: 300, 
      valor: 119.90,
      duracaoDias: 90 
    },
    semestral: { 
      nome: 'Semestral', 
      curtidas: 2000, 
      bonus: 600, 
      valor: 199.90,
      duracaoDias: 180 
    }
  },
  
  // FAIXAS DE DISTÂNCIA - NUNCA USE METROS EXATOS
  FAIXAS_DISTANCIA: [
    "A menos de 500m",
    "Aprox. 1km", 
    "Aprox. 3km",
    "Aprox. 5km+"
  ],
  
  // IDADE MIN E MAX - TODOS OS NÚMEROS ENTRE 18-70
  IDADE_MIN: 18,
  IDADE_MAX: 70,

  // ESTILOS POR GÊNERO
  ESTILOS_MULHER: ['loira', 'morena', 'ruiva', 'negra', 'gosto de todas'],
  ESTILOS_HOMEM: ['loiro', 'moreno', 'ruivo', 'negro', 'gosto de todos']
};
// ===== FIM DAS CONFIGURAÇÕES =====

// CONTEXT PRA COMPARTILHAR DADOS DO USUÁRIO ENTRE TELAS
export const UserContext = createContext();

const Tab = createBottomTabNavigator();

export default function App() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDadosUsuario();
  }, []);

  // LÓGICA COMPLETA: 48H GRÁTIS + BÔNUS + EXPIRAÇÃO DE PLANOS
  const carregarDadosUsuario = async () => {
    try {
      const dados = await AsyncStorage.getItem('meetperto_user');
      if (dados) {
        let user = JSON.parse(dados);
        const horasDesdeCadastro = (Date.now() - user.cadastro) / 1000 / 60 / 60;
        const horasTotais = CONFIG.PLANOS.gratis.duracaoDias * 24 + (user.horasBonus || 0);
        
        // Verifica se plano pago expirou
        if (user.plano !== 'gratis' && user.expiraEm && Date.now() > user.expiraEm) {
          Alert.alert('Plano Expirado', 'Seu plano acabou. Renove para continuar');
          user.plano = 'gratis';
          user.curtidasRestantes = 0;
          user.curtidasBonus = 0;
          await AsyncStorage.setItem('meetperto_user', JSON.stringify(user));
        }
        
        // Verifica se período grátis acabou E sem curtidas
        if (user.plano === 'gratis' && horasDesdeCadastro > horasTotais && user.curtidasRestantes <= 0) {
          Alert.alert(
            'Período Grátis Encerrado', 
            'Escolha um plano para continuar ou convide 3 amigos para ganhar +24h grátis'
          );
        }
        setUserData(user);
      } else {
        // Primeiro acesso - cria usuário com 48h grátis e 50 curtidas
        const novoUser = {
          cadastro: Date.now(),
          plano: 'gratis',
          curtidasRestantes: CONFIG.PLANOS.gratis.curtidas,
          curtidasBonus: 0,
          horasBonus: 0,
          convites: 0,
          expiraEm: Date.now() + (CONFIG.PLANOS.gratis.duracaoDias * 24 * 60 * 60 * 1000),
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
    } finally {
      setLoading(false);
    }
  };

  // FUNÇÃO: GASTAR CURTIDA - APLICA BÔNUS AUTOMÁTICO QUANDO ACABA
  const gastarCurtida = async () => {
    const dados = await AsyncStorage.getItem('meetperto_user');
    let user = JSON.parse(dados);
    
    if (user.curtidasRestantes <= 0) {
      // Verifica se tem bônus do plano pra aplicar
      const bonusDisponivel = CONFIG.PLANOS[user.plano].bonus;
      if (user.plano !== 'gratis' && user.curtidasBonus < bonusDisponivel) {
        user.curtidasRestantes += bonusDisponivel;
        user.curtidasBonus += bonusDisponivel;
        await AsyncStorage.setItem('meetperto_user', JSON.stringify(user));
        setUserData(user);
        Alert.alert('Bônus Liberado!', `Você ganhou +${bonusDisponivel} curtidas extras`);
        return true;
      }
      Alert.alert('Sem curtidas', 'Assine um plano ou convide amigos pra ganhar mais');
      return false;
    }
    
    user.curtidasRestantes -= 1;
    await AsyncStorage.setItem('meetperto_user', JSON.stringify(user));
    setUserData(user);
    return true;
  };

  // FUNÇÃO: ADICIONAR BÔNUS DE CONVITE - 3 AMIGOS = +24H OU +20 CURTIDAS
  const adicionarBonusConvite = async (tipo) => {
    const dados = await AsyncStorage.getItem('meetperto_user');
    let user = JSON.parse(dados);
    
    if (tipo === 'horas') {
      user.horasBonus += 24;
      user.expiraEm += 24 * 60 * 60 * 1000;
      Alert.alert('Bônus Ativado!', 'Você ganhou +24h grátis');
    } else {
      user.curtidasBonus += 20;
      user.curtidasRestantes += 20;
      Alert.alert('Bônus Ativado!', 'Você ganhou +20 curtidas extras');
    }
    
    user.convites = 0;
    await AsyncStorage.setItem('meetperto_user', JSON.stringify(user));
    setUserData(user);
  };

  // FUNÇÃO: ATIVAR PLANO - USE APÓS PAGAMENTO
  const ativarPlano = async (planoKey) => {
    const plano = CONFIG.PLANOS[planoKey];
    const novoUser = {
      ...userData,
      plano: planoKey,
      curtidasRestantes: plano.curtidas,
      curtidasBonus: 0,
      expiraEm: Date.now() + (plano.duracaoDias * 24 * 60 * 60 * 1000)
    };
    await AsyncStorage.setItem('meetperto_user', JSON.stringify(novoUser));
    setUserData(novoUser);
    Alert.alert('Plano Ativado!', `${plano.nome} ativado com ${plano.curtidas} curtidas`);
  };

  if (loading) return null;

  return (
    <UserContext.Provider value={{ 
      userData, 
      setUserData, 
      gastarCurtida, 
      adicionarBonusConvite,
      ativarPlano 
    }}>
      <NavigationContainer>
        <StatusBar backgroundColor={CONFIG.COR_PRINCIPAL} barStyle="light-content" />
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: CONFIG.COR_PRINCIPAL,
            tabBarInactiveTintColor: '#999',
            headerShown: false,
            tabBarStyle: { 
              paddingBottom: 5, 
              height: 60,
              borderTopWidth: 0,
              elevation: 8
            }
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
    </UserContext.Provider>
  );
}
