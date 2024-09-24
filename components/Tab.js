import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardPai from './DashboardPai';
import Loja from './Loja';
import Jardim from './Jardim';
import { Ionicons } from '@expo/vector-icons'; // Para ícones nas tabs

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'DashboardPai') {
            iconName = 'home';
          } else if (route.name === 'Loja') {
            iconName = 'cart';
          } else if (route.name === 'Jardim') {
            iconName = 'leaf';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007BFF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: '#f7f7f7' },
        headerShown: false,
      })}
    >
      <Tab.Screen name="DashboardPai" component={DashboardPai} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Loja" component={Loja} options={{ title: 'Loja de Recompensas' }} />
      <Tab.Screen name="Jardim" component={Jardim} options={{ title: 'Meu Jardim' }} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
