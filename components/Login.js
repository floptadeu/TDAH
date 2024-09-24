import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';
import Database from '../services/Database'; // Importa a classe de conexão com o banco de dados

const Login = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const db = new Database();

  const handleLogin = () => {
    if (!username || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    db.Conectar().then((database) => {
      database.transaction((tx) => {
        // Consulta para verificar se o usuário é um pai ou um filho
        tx.executeSql(
          `SELECT * FROM Usuario WHERE email = ? AND senha = ?`,
          [username, password],
          (tx, results) => {
            if (results.rows.length > 0) {
              const user = results.rows.item(0);
              // Verifica o tipo de usuário para navegar para o dashboard correto
              if (user.tipo_usuario === 'pai') {
                navigation.navigate('DashboardPai', { user });
              } else if (user.tipo_usuario === 'filho') {
                navigation.navigate('DashboardFilho', { user });
              } else {
                Alert.alert('Erro', 'Tipo de usuário inválido.');
              }
            } else {
              Alert.alert('Erro', 'Usuário ou senha incorretos.');
            }
          },
          (error) => {
            console.log("Erro ao executar consulta:", error);
            Alert.alert('Erro', 'Ocorreu um erro ao tentar fazer login.');
          }
        );
      });
    }).catch((error) => {
      console.log("Erro ao conectar ao banco de dados:", error);
      Alert.alert('Erro', 'Não foi possível conectar ao banco de dados.');
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <LottieView
        source={require('../assets/animations/bus.json')}
        autoPlay
        loop
        style={styles.animation}
      />
      <TextInput
        placeholder="Email"
        placeholderTextColor="#888"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        placeholder="Senha"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Cadastro')} style={styles.link}>
        <Text style={styles.linkText}>Cadastre-se</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  animation: {
    width: 150,
    height: 150,
    marginBottom: 20,
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
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 20,
  },
  linkText: {
    color: '#007BFF',
    textDecorationLine: 'underline',
  },
});

export default Login;
