import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity, Image, Button, TextInput } from 'react-native';
import Database from '../services/Database';
import NavigationBar from '../components/NavigationBar';

const db = new Database(); // Cria uma instância única do banco de dados

const Loja = ({ navigation, route }) => {
  const { user } = route.params; // Recebe o objeto 'user' passado pela navegação
  const [points, setPoints] = useState(user.pontos); // Usa pontos do usuário logado
  const [rewards, setRewards] = useState([]); // Lista de recompensas da tabela Recompensa
  const [newRewardName, setNewRewardName] = useState('');
  const [newRewardCost, setNewRewardCost] = useState('');
  const [addPoints, setAddPoints] = useState('');



    // Funções de navegação

    const goToStore = () => navigation.navigate('Loja', { user });

    const goToGarden = () => navigation.navigate('Garden', { user });
  
    const goToProfile = () => navigation.navigate('Perfil', { user });
  
    const goToAgenda = () => navigation.navigate('DashboardPai', { user });
    
  useEffect(() => {
    // Conecta ao banco de dados e carrega recompensas
    db.Conectar()
      .then(loadRewards)
      .catch(error => {
        console.log("Erro ao conectar ao banco de dados:", error);
        Alert.alert('Erro', 'Não foi possível conectar ao banco de dados.');
      });
  }, []);

  const loadRewards = () => {
    db.Conectar().then((database) => {
      database.transaction((tx) => {
        // Carregar recompensas
        tx.executeSql(
          `SELECT * FROM Recompensa`,
          [],
          (tx, results) => {
            const rows = results.rows;
            let rewardsData = [];
            for (let i = 0; i < rows.length; i++) {
              rewardsData.push(rows.item(i));
            }
            setRewards(rewardsData);
          },
          (error) => {
            console.log('Erro ao carregar recompensas:', error);
            Alert.alert('Erro', 'Não foi possível carregar as recompensas.');
          }
        );
      });
    }).catch((error) => {
      console.log("Erro ao conectar ao banco de dados:", error);
    });
  };

  const comprarItem = (itemId, itemName, itemCost) => {
    if (points >= itemCost) {
      setPoints(points - itemCost);

      db.Conectar().then((database) => {
        database.transaction((tx) => {
          tx.executeSql(
            `INSERT INTO ItensComprados (item_id, tipo_item, usuario_id, quantidade) VALUES (?, ?, ?, ?)`,
            [itemId, 'recompensa', user.id, 1], // Usando o id do usuário logado
            () => {
              if (itemName === 'Plantar Árvore') {
                // Adiciona árvore ao usuário
                tx.executeSql(
                  `INSERT INTO Arvore (usuario_id, recompensa_id, quantidade) VALUES (?, ?, 1)`,
                  [user.id, itemId],
                  () => console.log('Árvore adicionada ao usuário.'),
                  (error) => console.log('Erro ao adicionar árvore:', error)
                );
              }
              Alert.alert('Sucesso', `${itemName} comprado!`);
              // Atualiza pontos no banco de dados
              tx.executeSql(
                `UPDATE Usuario SET pontos = ? WHERE id = ?`,
                [points - itemCost, user.id],
                () => console.log('Pontos atualizados no banco de dados'),
                (error) => console.log('Erro ao atualizar pontos:', error)
              );
            },
            (error) => {
              console.log('Erro ao registrar compra:', error);
              Alert.alert('Erro', 'Não foi possível registrar a compra.');
            }
          );
        });
      }).catch((error) => {
        console.log("Erro ao conectar ao banco de dados:", error);
        Alert.alert('Erro', 'Não foi possível conectar ao banco de dados.');
      });
    } else {
      Alert.alert('Pontos insuficientes', 'Você não tem pontos suficientes para este item.');
    }
  };

  const adicionarPontos = () => {
    const pontosAdicionar = parseInt(addPoints);
    if (!isNaN(pontosAdicionar) && pontosAdicionar > 0) {
      setPoints(points + pontosAdicionar);
      db.Conectar().then((database) => {
        database.transaction((tx) => {
          tx.executeSql(
            `UPDATE Usuario SET pontos = ? WHERE id = ?`,
            [points + pontosAdicionar, user.id],
            () => Alert.alert('Sucesso', 'Pontos adicionados com sucesso!'),
            (error) => console.log('Erro ao adicionar pontos:', error)
          );
        });
      }).catch((error) => {
        console.log("Erro ao conectar ao banco de dados:", error);
        Alert.alert('Erro', 'Não foi possível conectar ao banco de dados.');
      });
    } else {
      Alert.alert('Erro', 'Por favor, insira um número válido de pontos.');
    }
  };

  const adicionarRecompensa = () => {
    if (newRewardName.trim() === '' || isNaN(parseInt(newRewardCost)) || parseInt(newRewardCost) <= 0) {
      Alert.alert('Erro', 'Nome e custo da recompensa são obrigatórios e devem ser válidos.');
      return;
    }

    db.Conectar().then((database) => {
      database.transaction((tx) => {
        tx.executeSql(
          `INSERT INTO Recompensa (nome, descricao, custo, quantidade_disponivel) VALUES (?, 'Descrição padrão', ?, 1)`,
          [newRewardName, parseInt(newRewardCost)],
          () => {
            Alert.alert('Sucesso', 'Recompensa adicionada à loja!');
            setNewRewardName('');
            setNewRewardCost('');
            loadRewards(); // Recarrega as recompensas
          },
          (error) => {
            console.log('Erro ao adicionar recompensa:', error);
            Alert.alert('Erro', 'Não foi possível adicionar a recompensa.');
          }
        );
      });
    }).catch((error) => {
      console.log("Erro ao conectar ao banco de dados:", error);
      Alert.alert('Erro', 'Não foi possível conectar ao banco de dados.');
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemCard} onPress={() => comprarItem(item.id, item.nome, item.custo)}>
      <Image source={require('../assets/icons/forest.png')} style={styles.itemImage} />
      <Text style={styles.itemName}>{item.nome}</Text>
      <Text style={styles.itemCost}>{item.custo} XP</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Loja de Recompensas</Text>
      {/* <Text style={styles.points}>Pontos disponíveis: {points}</Text>

      <View style={styles.addPointsContainer}>
        <TextInput
          placeholder="Adicionar Pontos"
          value={addPoints}
          onChangeText={setAddPoints}
          keyboardType="numeric"
          style={styles.input}
          placeholderTextColor={'#333'}
        />
        <Button title="Adicionar Pontos" onPress={adicionarPontos} />
      </View> */}

      <View style={styles.newRewardContainer}>
        <TextInput
          placeholder="Nome da Recompensa"
          value={newRewardName}
          onChangeText={setNewRewardName}
          style={styles.input}
          placeholderTextColor={'#333'}
        />
        <TextInput
          placeholder="Custo da Recompensa"
          value={newRewardCost}
          onChangeText={setNewRewardCost}
          keyboardType="numeric"
          style={styles.input}
          placeholderTextColor={'#333'}
        />
        <Button title="Adicionar Recompensa" onPress={adicionarRecompensa} />
      </View>

      <FlatList
        data={rewards}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2} // Layout em duas colunas
        columnWrapperStyle={styles.row} // Estilo para a linha das colunas
        ListEmptyComponent={<Text style={styles.emptyMessage}>Nenhuma recompensa disponível.</Text>}
      />

      <NavigationBar
        goToStore={goToStore}
        goToGarden={goToGarden}
        goToProfile={goToProfile}
        openAddTaskModal={goToAgenda}
      />
    </View>
  );
};

export default Loja;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#1a1a1d',
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#fff',
  },
  points: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  row: {
    flex: 1,
    justifyContent: "space-around",
  },
  itemCard: {
    backgroundColor: '#2c2f33',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    margin: 10,
    width: '45%',
  },
  itemImage: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  itemName: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 5,
  },
  itemCost: {
    fontSize: 12,
    color: '#bbb',
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
  addPointsContainer: {
    width: '90%',
    marginBottom: 20,
  },
  newRewardContainer: {
    width: '90%',
    marginBottom: 20,
  },
  input: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
    color: '#333',
  },
});
