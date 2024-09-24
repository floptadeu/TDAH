/**
 * @format
 */
import 'react-native-gesture-handler'; // Deve estar na primeira linha para inicializar gestos
import { AppRegistry } from 'react-native';
import { enableScreens } from 'react-native-screens'; // Para melhorar o desempenho de telas
enableScreens(); // Ativa o uso de telas nativas

import MainNavigator from './MainNavigator'; // Importa o navegador principal que gerencia todas as telas
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => MainNavigator);
