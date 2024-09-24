import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import LottieView from 'lottie-react-native';
import NavigationBar from '../components/NavigationBar';

const Jardim = ({ navigation, route }) => {
  const { user } = route.params; // Recebe o objeto 'user' passado pela navegação
  const [trees, setTrees] = useState([]);
  const [availableTrees, setAvailableTrees] = useState(3); // Mock para contador de árvores que podem ser plantadas

  useEffect(() => {
    if (user) {
      carregarArvores(); // Mock para carregar árvores
      verificarArvoresDisponiveis(); // Mock para verificar árvores disponíveis
    } else {
      console.error('Usuário não está definido.');
    }
  }, [user]);

  // Mock para carregar árvores
  const carregarArvores = () => {
    // Simulando o carregamento de árvores
    const treesData = [
      { id: 1, name: 'Árvore 1' },
      { id: 2, name: 'Árvore 2' },
    ];
    setTrees(treesData);
  };

  // Mock para verificar quantas árvores podem ser plantadas
  const verificarArvoresDisponiveis = () => {
    // Simulando a verificação de árvores disponíveis
    setAvailableTrees(3);
  };

  // Mock para plantar uma árvore
  const plantarArvore = () => {
    if (availableTrees > 0) {
      // Simulando o plantio de uma árvore
      setTrees([...trees, { id: trees.length + 1, name: `Árvore ${trees.length + 1}` }]);
      setAvailableTrees(availableTrees - 1);
      Alert.alert('Sucesso', 'Árvore plantada com sucesso!');
    } else {
      Alert.alert('Sem Árvores Disponíveis', 'Você não possui recompensas suficientes para plantar árvores.');
    }
  };

  // Funções de navegação
  const goToStore = () => navigation.navigate('Loja', { user }); // Passa o 'user' para a Loja
  const goToGarden = () => navigation.navigate('Garden', { user }); // Passa o 'user' para o Jardim
  const goToProfile = () => navigation.navigate('Perfil', { user }); // Passa o 'user' para o Perfil
  const goToAgenda = () => navigation.navigate('DashboardPai', { user }); // Passa o 'user' para o Dashboard Pai

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meu Jardim</Text>
      <Text style={styles.subtitle}>Árvores disponíveis para plantar: {availableTrees}</Text>
      <View style={styles.grid}>
        {trees.map((tree) => (
          <View key={tree.id} style={styles.gridItem}>
            <LottieView
              source={require('../assets/animations/growing-tree.json')}
              autoPlay
              loop={false}
              style={styles.treeAnimation}
            />
          </View>
        ))}
        {trees.length < 9 && (
          <TouchableOpacity style={styles.gridItem} onPress={plantarArvore}>
            <Text style={styles.plantText}>Plantar</Text>
          </TouchableOpacity>
        )}
      </View>
      <NavigationBar
        goToStore={goToStore}
        goToGarden={goToGarden}
        goToProfile={goToProfile}
        openAddTaskModal={goToAgenda}
      />
    </View>
  );
};

export default Jardim;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#555',
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '30%',
    height: 100,
    backgroundColor: '#e0f7fa',
    margin: 5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#00acc1',
  },
  plantText: {
    fontSize: 16,
    color: '#00897b',
  },
  treeAnimation: {
    width: 80,
    height: 80,
  },
});
