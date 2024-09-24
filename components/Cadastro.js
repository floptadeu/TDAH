import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import Database from '../services/Database';

const Cadastro = ({ navigation }) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tipo, setTipo] = useState('pai'); // 'pai' ou 'filho'
  const [emailPai, setEmailPai] = useState(''); // Para o caso de cadastro do Filho

  const handleRegister = () => {
    if (!nome || !email || !senha || (tipo === 'filho' && !emailPai)) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    const db = new Database();
    db.Conectar().then((database) => {
      database.transaction((tx) => {
        // Verifica se o email já existe como usuário
        tx.executeSql(
          'SELECT id FROM Usuario WHERE email = ?',
          [email],
          (tx, results) => {
            if (results.rows.length > 0) {
              Alert.alert('Erro', 'O email já está em uso. Escolha outro email.');
            } else {
              if (tipo === 'pai') {
                // Insere um novo Pai
                tx.executeSql(
                  'INSERT INTO Usuario (nome, email, senha, tipo_usuario) VALUES (?, ?, ?, ?)',
                  [nome, email, senha, 'pai'],
                  (tx, results) => {
                    if (results.rowsAffected > 0) {
                      Alert.alert('Sucesso', 'Cadastro de Pai realizado com sucesso!', [
                        { text: 'OK', onPress: () => navigation.navigate('Login') }
                      ]);
                    }
                  },
                  (error) => {
                    console.log("Erro ao inserir Pai:", error);
                    Alert.alert('Erro', 'Não foi possível realizar o cadastro.');
                  }
                );
              } else {
                // Para cadastrar um Filho, deve ser associado a um Pai existente
                tx.executeSql(
                  'SELECT id FROM Usuario WHERE email = ? AND tipo_usuario = ?',
                  [emailPai, 'pai'],
                  (tx, results) => {
                    if (results.rows.length > 0) {
                      const paiId = results.rows.item(0).id;
                      tx.executeSql(
                        'INSERT INTO Usuario (nome, email, senha, tipo_usuario, pai_id) VALUES (?, ?, ?, ?, ?)',
                        [nome, email, senha, 'filho', paiId],
                        (tx, results) => {
                          if (results.rowsAffected > 0) {
                            Alert.alert('Sucesso', 'Cadastro de Filho realizado com sucesso!', [
                              { text: 'OK', onPress: () => navigation.navigate('Login') }
                            ]);
                          }
                        },
                        (error) => {
                          console.log("Erro ao inserir Filho:", error);
                          Alert.alert('Erro', 'Não foi possível realizar o cadastro de Filho.');
                        }
                      );
                    } else {
                      Alert.alert('Erro', 'Pai não encontrado. Cadastre o Pai primeiro.');
                    }
                  },
                  (error) => {
                    console.log("Erro ao buscar Pai:", error);
                    Alert.alert('Erro', 'Erro ao associar Filho ao Pai.');
                  }
                );
              }
            }
          },
          (error) => {
            console.log("Erro ao verificar existência de email:", error);
            Alert.alert('Erro', 'Erro ao verificar email.');
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
      <Text style={styles.title}>Cadastro de Usuário</Text>
      <TextInput
        placeholder="Nome"
        placeholderTextColor="#888"
        value={nome}
        onChangeText={setNome}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Senha"
        placeholderTextColor="#888"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        style={styles.input}
      />
      {tipo === 'filho' && (
        <TextInput
          placeholder="Email do Pai"
          placeholderTextColor="#888"
          value={emailPai}
          onChangeText={setEmailPai}
          style={styles.input}
        />
      )}
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.typeButton, tipo === 'pai' && styles.activeButton]}
          onPress={() => setTipo('pai')}
        >
          <Text style={styles.buttonText}>Pai</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, tipo === 'filho' && styles.activeButton]}
          onPress={() => setTipo('filho')}
        >
          <Text style={styles.buttonText}>Filho</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Cadastrar</Text>
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
  buttonGroup: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  typeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    borderRadius: 5,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  activeButton: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Cadastro;
