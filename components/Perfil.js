// Perfil.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import Database from '../services/Database';
import NavigationBar from '../components/NavigationBar';

const Perfil = ({ navigation, route }) => {
  const [user, setUser] = useState(route.params.user); // Usuário logado
  const [nome, setNome] = useState(user.nome);
  const [email, setEmail] = useState(user.email);
  const [senha, setSenha] = useState(user.senha);
  const [children, setChildren] = useState([]); // Lista de filhos
  const db = new Database();

  useEffect(() => {
    fetchUserData();
    if (user.tipo_usuario === 'pai') {
      fetchChildren(); // Busca a lista de filhos se o usuário for pai
    }
  }, []);

  // Função para buscar dados atualizados do usuário
  const fetchUserData = () => {
    db.Conectar()
      .then((database) => {
        database.transaction((tx) => {
          tx.executeSql(
            'SELECT * FROM Usuario WHERE id = ?',
            [user.id],
            (tx, results) => {
              if (results.rows.length > 0) {
                const userData = results.rows.item(0);
                setUser(userData);
                setNome(userData.nome);
                setEmail(userData.email);
                setSenha(userData.senha);
              }
            },
            (error) => {
              console.log('Erro ao buscar dados do usuário:', error);
              Alert.alert('Erro', 'Não foi possível carregar os dados do usuário.');
            }
          );
        });
      })
      .catch((error) => {
        console.log('Erro ao conectar ao banco de dados:', error);
        Alert.alert('Erro', 'Não foi possível conectar ao banco de dados.');
      });
  };

  // Função para buscar a lista de filhos
  const fetchChildren = () => {
    db.Conectar()
      .then((database) => {
        database.transaction((tx) => {
          tx.executeSql(
            'SELECT * FROM Usuario WHERE pai_id = ?',
            [user.id],
            (tx, results) => {
              const rows = results.rows;
              let childrenData = [];
              for (let i = 0; i < rows.length; i++) {
                childrenData.push(rows.item(i));
              }
              setChildren(childrenData);
            },
            (error) => {
              console.log('Erro ao buscar filhos:', error);
              Alert.alert('Erro', 'Não foi possível carregar a lista de filhos.');
            }
          );
        });
      })
      .catch((error) => {
        console.log('Erro ao conectar ao banco de dados:', error);
        Alert.alert('Erro', 'Não foi possível conectar ao banco de dados.');
      });
  };

  // Função para atualizar dados do usuário
  const updateUser = () => {
    db.Conectar()
      .then((database) => {
        database.transaction((tx) => {
          tx.executeSql(
            'UPDATE Usuario SET nome = ?, email = ?, senha = ? WHERE id = ?',
            [nome, email, senha, user.id],
            (tx, results) => {
              if (results.rowsAffected > 0) {
                Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
                fetchUserData(); // Atualiza os dados na tela após a modificação
              }
            },
            (error) => {
              console.log('Erro ao atualizar dados do usuário:', error);
              Alert.alert('Erro', 'Não foi possível atualizar os dados.');
            }
          );
        });
      })
      .catch((error) => {
        console.log('Erro ao conectar ao banco de dados:', error);
        Alert.alert('Erro', 'Não foi possível conectar ao banco de dados.');
      });
  };

  // Função para navegar para o dashboard do filho selecionado
  const goToChildDashboard = (child) => {
    navigation.navigate('DashboardPai', { user, child }); // Passa o filho como parâmetro
  };

  // Funções de navegação
  const goToStore = () => navigation.navigate('Loja', { user });
  const goToGarden = () => navigation.navigate('Garden', { user });
  const goToProfile = () => navigation.navigate('Perfil', { user });

  const goToAgenda = () => {
    if (user.tipo_usuario === 'pai') {
      navigation.navigate('DashboardPai', { user });
    } else if (user.tipo_usuario === 'filho') {
      navigation.navigate('DashboardFilho', { user });
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/icons/netflix.png')} // Imagem do perfil
        style={styles.profileImage}
      />
      <Text style={styles.title}>Perfil do Usuário</Text>
      <TextInput
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Atualizar Dados" onPress={updateUser} />

      {user.tipo_usuario === 'pai' && (
        <>
          <Text style={styles.childrenTitle}>Seus Filhos:</Text>
          <FlatList
            data={children}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.childItem}
                onPress={() => goToChildDashboard(item)}
              >
                <Text style={styles.childName}>{item.nome}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      )}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
      <NavigationBar
        goToStore={goToStore}
        goToGarden={goToGarden}
        goToProfile={goToProfile}
        openAddTaskModal={goToAgenda}
      />
    </View>
  );
};

export default Perfil;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f7f7f7',
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
    width: '100%',
  },
  backButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#007BFF',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  childrenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 10,
  },
  childItem: {
    padding: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 10,
  },
  childName: {
    fontSize: 18,
    color: '#333',
  },
});
