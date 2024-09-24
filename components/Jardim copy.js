import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import LottieView from 'lottie-react-native';
import Database from '../services/Database';
import NavigationBar from '../components/NavigationBar';

const Jardim = ({ navigation, route }) => {
  const { user } = route.params;  // Recebe o objeto 'user' passado pela navegação
  const [trees, setTrees] = useState([]);
  const [availableTrees, setAvailableTrees] = useState(0); // Contador de árvores que podem ser plantadas
  const db = new Database();

  useEffect(() => {
    if (user) {
      carregarArvores();
      verificarArvoresDisponiveis();
    } else {
      console.error('Usuário não está definido.');
    }
  }, [user]);

  // Função para carregar as árvores do banco de dados
  const carregarArvores = () => {
    db.Conectar()
      .then((database) => {
        database.transaction((tx) => {
          tx.executeSql(
            `SELECT * FROM Arvore WHERE usuario_id = ?`,  // Ajuste do nome da tabela e do campo conforme o banco
            [user.id],  // Usando o ID do usuário filho
            (tx, results) => {
              const rows = results.rows;
              let treesData = [];
              for (let i = 0; i < rows.length; i++) {
                treesData.push(rows.item(i));
              }
              console.log('Árvores carregadas:', treesData);
              setTrees(treesData);
            },
            (error) => {
              console.error('Erro ao carregar árvores:', error);
              Alert.alert('Erro', 'Não foi possível carregar as árvores do banco de dados.');
            }
          );
        });
      })
      .catch((error) => {
        console.error('Erro ao conectar ao banco de dados:', error);
        Alert.alert('Erro', 'Não foi possível conectar ao banco de dados.');
      });
  };

  // Função para verificar quantas árvores podem ser plantadas
  const verificarArvoresDisponiveis = () => {
    db.Conectar()
      .then((database) => {
        database.transaction((tx) => {
          tx.executeSql(
            `SELECT SUM(quantidade) as total FROM ItensComprados WHERE usuario_id = ? AND tipo_item = 'recompensa' AND item_id IN (SELECT id FROM Recompensa WHERE nome = 'Plantar Árvore')`,
            [user.id],
            (tx, results) => {
              if (results.rows.length > 0) {
                const { total } = results.rows.item(0);
                setAvailableTrees(total || 0);
              }
            },
            (error) => {
              console.error('Erro ao verificar árvores disponíveis:', error);
              Alert.alert('Erro', 'Não foi possível verificar as árvores disponíveis.');
            }
          );
        });
      })
      .catch((error) => {
        console.error('Erro ao conectar ao banco de dados:', error);
        Alert.alert('Erro', 'Não foi possível conectar ao banco de dados.');
      });
  };

  // Função para plantar uma árvore
  const plantarArvore = () => {
    if (availableTrees > 0) {
      db.Conectar()
        .then((database) => {
          database.transaction((tx) => {
            tx.executeSql(
              `INSERT INTO Arvore (usuario_id, recompensa_id, quantidade) VALUES (?, (SELECT id FROM Recompensa WHERE nome = 'Plantar Árvore'), 1)`,
              [user.id],
              () => {
                // Atualiza a quantidade disponível de árvores
                tx.executeSql(
                  `UPDATE ItensComprados SET quantidade = quantidade - 1 WHERE usuario_id = ? AND tipo_item = 'recompensa' AND item_id IN (SELECT id FROM Recompensa WHERE nome = 'Plantar Árvore') AND quantidade > 0`,
                  [user.id],
                  () => {
                    Alert.alert('Sucesso', 'Árvore plantada com sucesso!');
                    carregarArvores();
                    verificarArvoresDisponiveis(); // Atualiza a contagem de árvores disponíveis
                  },
                  (error) => console.error('Erro ao atualizar a quantidade de árvores:', error)
                );
              },
              (error) => {
                console.error('Erro ao plantar árvore:', error);
                Alert.alert('Erro', 'Não foi possível plantar a árvore.');
              }
            );
          });
        })
        .catch((error) => {
          console.error('Erro ao conectar ao banco de dados:', error);
          Alert.alert('Erro', 'Não foi possível conectar ao banco de dados.');
        });
    } else {
      Alert.alert('Sem Árvores Disponíveis', 'Você não possui recompensas suficientes para plantar árvores.');
    }
  };

  // Funções de navegação
  const goToStore = () => navigation.navigate('Loja', { user });  // Passa o 'user' para a Loja
  const goToGarden = () => navigation.navigate('Garden', { user });  // Passa o 'user' para o Jardim
  const goToProfile = () => navigation.navigate('Perfil', { user });  // Passa o 'user' para o Perfil
  const goToAgenda = () => navigation.navigate('DashboardPai', { user });  // Passa o 'user' para o Dashboard Pai

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
