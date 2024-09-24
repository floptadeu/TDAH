// components/TaskPlanner.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native';
import { getDBConnection } from '../services/Database';

const TaskPlanner = ({ route }) => {
  const [taskText, setTaskText] = useState('');
  const [tasks, setTasks] = useState([]);
  const { handleTaskCompletion } = route.params;

  // Carregar tarefas do banco de dados na montagem do componente
  useEffect(() => {
    const loadTasks = async () => {
      const db = await getDBConnection();
      try {
        const results = await db.executeSql('SELECT * FROM Tasks');
        const loadedTasks = results[0].rows.raw().map((row) => ({
          id: row.id.toString(),
          text: row.description,
          status: row.status,
        }));
        setTasks(loadedTasks);
      } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
        Alert.alert('Erro', 'Não foi possível carregar as tarefas.');
      }
    };

    loadTasks();
  }, []);

  // Adicionar nova tarefa ao banco de dados
  const addTask = async () => {
    if (taskText.trim() === '') {
      Alert.alert('Erro', 'A descrição da tarefa não pode estar vazia.');
      return;
    }

    try {
      const db = await getDBConnection();
      await db.executeSql('INSERT INTO Tasks (description, status, points) VALUES (?, ?, ?)', [
        taskText,
        'incompleta',
        10,
      ]);

      // Recarregar tarefas para garantir que o ID correto seja utilizado
      const results = await db.executeSql('SELECT * FROM Tasks');
      const loadedTasks = results[0].rows.raw().map((row) => ({
        id: row.id.toString(),
        text: row.description,
        status: row.status,
      }));
      setTasks(loadedTasks);
      setTaskText('');
      Alert.alert('Sucesso', 'Tarefa adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error);
      Alert.alert('Erro', 'Não foi possível adicionar a tarefa.');
    }
  };

  // Atualizar o status da tarefa
  const markTask = async (task, status) => {
    try {
      const db = await getDBConnection();
      await db.executeSql('UPDATE Tasks SET status = ? WHERE id = ?', [status, task.id]);

      const updatedTasks = tasks.map((t) => (t.id === task.id ? { ...t, status } : t));
      setTasks(updatedTasks);

      if (status === 'completa') {
        handleTaskCompletion({ points: 10 });
        Alert.alert('Parabéns!', 'Tarefa marcada como completa!');
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o status da tarefa.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tarefas Diárias</Text>
      <TextInput
        placeholder="Adicionar nova tarefa"
        value={taskText}
        onChangeText={setTaskText}
        style={styles.input}
      />
      <Button title="Adicionar Tarefa" onPress={addTask} />
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Text>{item.text}</Text>
            <View style={styles.buttons}>
              <Button title="✔" onPress={() => markTask(item, 'completa')} />
              <Button title="~" onPress={() => markTask(item, 'mais ou menos completa')} />
              <Button title="✖" onPress={() => markTask(item, 'não completa')} />
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

export default TaskPlanner;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  buttons: {
    flexDirection: 'row',
    gap: 5,
  },
});
