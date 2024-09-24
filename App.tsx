// App.tsx
import React from 'react';
import { SafeAreaView, Button, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Tipos de navegação
type RootStackParamList = {
  Home: undefined;
  ScheduleTask: undefined;
};

type AppNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

function App(): React.JSX.Element {
  const navigation = useNavigation<AppNavigationProp>();
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaView style={{ backgroundColor: isDarkMode ? '#333' : '#FFF', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Agendar Tarefa" onPress={() => navigation.navigate('ScheduleTask')} />
    </SafeAreaView>
  );
}

export default App;
