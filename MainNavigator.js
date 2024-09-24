import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './components/Login';
import DashboardFilho from './components/DashboardFilho';
import DashboardPai from './components/DashboardPai';
import Loja from './components/Loja';
import Jardim from './components/Jardim';
import Cadastro from './components/Cadastro';
import TabNavigator from './components/Tab';
import Perfil from './components/Perfil';
import DatabaseViewer from './components/DatabaseViewer';
import InsigniasScreen from './components/InsigniasScreen';

const Stack = createStackNavigator();

const MainNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{ headerShown: false }} // Aplica o headerShown: false globalmente
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="DashboardFilho" component={DashboardFilho} />
        <Stack.Screen name="DashboardPai" component={DashboardPai} />
        <Stack.Screen name="Loja" component={Loja} options={{ title: 'Loja de Recompensas' }} />
        <Stack.Screen name="Garden" component={Jardim} options={{ title: 'Meu Jardim' }} />
        <Stack.Screen name="Cadastro" component={Cadastro} options={{ title: 'Cadastro' }} />
        <Stack.Screen name="Tab" component={TabNavigator} options={{ title: 'Tab Navigator' }} />
        <Stack.Screen name="Perfil" component={Perfil} options={{ title: 'Perfil' }} />
        <Stack.Screen name="DatabaseViewer" component={DatabaseViewer} options={{ title: 'DatabaseViewer' }} />
        <Stack.Screen name="Insignias" component={InsigniasScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MainNavigator;
