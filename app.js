// App.js
import React, { useState, useEffect, createContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './components/Login';
import DashboardFilho from './components/DashboardFilho';
import DashboardPai from './components/DashboardPai';
import Loja from './components/Loja';
import Jardim from './components/Jardim'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';


const Stack = createStackNavigator();

// Contexto para Autenticação
export const AuthContext = createContext();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        setUserToken(token);
      } catch (error) {
        console.error('Erro ao verificar o status de autenticação:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ userToken, setUserToken }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={userToken ? 'DashboardFilho' : 'Login'}>
          <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
          <Stack.Screen name="DashboardFilho" component={DashboardFilho} />
          <Stack.Screen name="DashboardPai" component={DashboardPai} />
          <Stack.Screen name="Loja" component={Loja} options={{ title: 'Loja de Recompensas' }} />
          <Stack.Screen name="Jardim" component={Jardim} options={{ title: 'Meu Jardim' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
};

export default App;
