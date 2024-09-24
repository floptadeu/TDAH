// components/EditTaskModal.js

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Database from '../services/Database';

const EditTaskModal = ({ visible, onClose, task, user }) => {
  const [nome, setNome] = useState(task.nome);
  const [descricao, setDescricao] = useState(task.descricao);
  const [dataTarefa, setDataTarefa] = useState(new Date(task.data_tarefa));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const db = new Database();

  const updateTask = () => {
    db.Conectar()
      .then((database) => {
        database.transaction((tx) => {
          tx.executeSql(
            'UPDATE Tarefa SET nome = ?, descricao = ?, data_tarefa = ? WHERE id = ?',
            [nome, descricao, dataTarefa.toISOString().split('T')[0], task.id],
            (_, results) => {
              if (results.rowsAffected > 0) {
                Alert.alert('Sucesso', 'Tarefa atualizada com sucesso!');
                onClose();
              } else {
                Alert.alert('Erro', 'Não foi possível atualizar a tarefa.');
              }
            },
            (error) => {
              console.log('Erro ao atualizar tarefa:', error);
              Alert.alert('Erro', 'Não foi possível atualizar a tarefa.');
            }
          );
        });
      })
      .catch((error) => {
        console.log('Erro ao conectar ao banco de dados:', error);
        Alert.alert('Erro', 'Não foi possível conectar ao banco de dados.');
      });
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || dataTarefa;
    setShowDatePicker(false);
    setDataTarefa(currentDate);
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <Text style={styles.title}>Editar Tarefa</Text>
        <TextInput
          placeholder="Nome da Tarefa"
          value={nome}
          onChangeText={setNome}
          style={styles.input}
        />
        <TextInput
          placeholder="Descrição"
          value={descricao}
          onChangeText={setDescricao}
          style={styles.input}
        />
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={styles.dateButton}
        >
          <Text style={styles.dateButtonText}>
            Data da Tarefa: {dataTarefa.toISOString().split('T')[0]}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={dataTarefa}
            mode="date"
            display="default"
            onChange={onChangeDate}
          />
        )}
        <Button title="Atualizar Tarefa" onPress={updateTask} />
        <Button title="Cancelar" onPress={onClose} color="#888" />
      </View>
    </Modal>
  );
};

export default EditTaskModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f7f7f7',
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
  },
  dateButton: {
    padding: 15,
    backgroundColor: '#007BFF',
    borderRadius: 8,
    marginBottom: 20,
  },
  dateButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});
