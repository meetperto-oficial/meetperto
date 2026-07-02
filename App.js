import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { ActivityIndicator, View, StatusBar } from 'react-native'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebaseConfig'
import { Colors } from './screens/theme/colors'

// Telas
import AuthScreen from './screens/AuthScreen'
import FeedScreen from './screens/FeedScreen'
import SettingsScreen from './screens/SettingsScreen'
import PerfilScreen from './screens/PerfilScreen'
import PlanosScreen from './screens/PlanosScreen'
import FiltrosScreen from './screens/FiltrosScreen'
import RadarScreen from './screens/RadarScreen'
import FilaLinearScreen from './screens/FilaLinearScreen'

const Stack = createStackNavigator()

export default function App() {
  const [initializing, setInitializing] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      if (initializing) setInitializing(false)
    })
    return unsubscribe
  }, [])

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: Colors.background },
            headerTintColor: Colors.text,
            headerTitleStyle: { fontWeight: '700' },
            headerShadowVisible: false,
          }}
        >
          {user ? (
            // Rotas logado
            <>
              <Stack.Screen 
                name="Feed" 
                component={FeedScreen} 
                options={{ title: 'MeetPerto' }} 
              />
              <Stack.Screen 
                name="Settings" 
                component={SettingsScreen} 
                options={{ title: 'Configurações' }} 
              />
              <Stack.Screen 
                name="Perfil" 
                component={PerfilScreen} 
                options={{ title: 'Meu Perfil' }} 
              />
              <Stack.Screen 
                name="Planos" 
                component={PlanosScreen} 
                options={{ title: 'Planos VIP' }} 
              />
              <Stack.Screen 
                name="Filtros" 
                component={FiltrosScreen} 
                options={{ title: 'Filtros' }} 
              />
              <Stack.Screen 
                name="Radar" 
                component={RadarScreen} 
                options={{ title: 'Radar' }} 
              />
              <Stack.Screen 
                name="FilaLinear" 
                component={FilaLinearScreen} 
                options={{ title: 'Fila' }} 
              />
            </>
          ) : (
            // Rotas deslogado
            <Stack.Screen 
              name="Auth" 
              component={AuthScreen} 
              options={{ headerShown: false }} 
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  )
}
