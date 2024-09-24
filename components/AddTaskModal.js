import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Modal, Button, StyleSheet, Alert, Switch, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Picker } from '@react-native-picker/picker';
import Database from '../services/Database'; // Certifique-se de que seu serviço de banco de dados esteja configurado corretamente

const AddTaskModal = ({ visible, onClose, onAddTask, user }) => {
  const [task, setTask] = useState('');
  const [dificuldade, setDificuldade] = useState('Média');
  const [status, setStatus] = useState('não feita');
  const [recorrente, setRecorrente] = useState(false);
  const [frequenciaRecorrencia, setFrequenciaRecorrencia] = useState('Diária');
  const [dateTime, setDateTime] = useState(new Date());
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [taskDate, setTaskDate] = useState(new Date());
  const [showTaskDatePicker, setShowTaskDatePicker] = useState(false);
  const [descricao, setDescricao] = useState(''); // Campo para descrição
  const db = new Database(); // Instância do banco de dados

  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible]);

  const resetForm = () => {
    setTask('');
    setDificuldade('Média');
    setStatus('não feita');
    setRecorrente(false);
    setFrequenciaRecorrencia('Diária');
    setDateTime(new Date());
    setTaskDate(new Date());
    setDescricao('');
  };

  const handleAddTask = () => {
    if (!task.trim()) {
      Alert.alert('Erro', 'Por favor, insira uma tarefa.');
      return;
    }

    const taskTime = format(dateTime, 'yyyy-MM-dd HH:mm:ss');
    const taskDateFormatted = format(taskDate, 'yyyy-MM-dd');
    
    // O ID do usuário é o user.id e a descrição é a "Adicionar detalhes"
    const usuario_id = user.id;
    
    // Conexão com o banco de dados e inserção da tarefa
    db.Conectar().then((database) => {
      database.transaction((tx) => {
        tx.executeSql(
          `INSERT INTO Tarefa 
          (nome, dificuldade, status, tipo, usuario_id, data_criacao, data_tarefa, recorrente, frequencia_recorrencia, descricao) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            task,                    // nome
            dificuldade,             // dificuldade
            status,                  // status
            'atividade',             // tipo (hardcoded)
            usuario_id,              // usuario_id
            taskTime,                // data_criacao (a data e hora atual)
            taskDateFormatted,       // data_tarefa (data escolhida)
            recorrente ? 1 : 0,      // recorrente
            recorrente ? frequenciaRecorrencia : null,  // frequencia_recorrencia (se recorrente)
            descricao,               // descrição
          ],
          (_, result) => {
            if (result.rowsAffected > 0) {
              Alert.alert('Sucesso', 'Tarefa adicionada com sucesso!');
              onAddTask(task, taskDateFormatted, taskTime);
              resetForm();
              onClose();
            } else {
              Alert.alert('Erro', 'Não foi possível adicionar a tarefa.');
            }
          },
          (error) => {
            console.error('Erro ao adicionar tarefa', error);
            Alert.alert('Erro', 'Não foi possível adicionar a tarefa no banco de dados.');
          }
        );
      });
    }).catch((error) => {
      console.error('Erro ao conectar ao banco de dados', error);
      Alert.alert('Erro', 'Não foi possível conectar ao banco de dados.');
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          
          {/* Header with cancel and save buttons */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Adicionar Tarefa</Text>
            <TouchableOpacity onPress={handleAddTask} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>

          {/* Task Name Input */}
          <TextInput
            placeholder="Nome da Tarefa"
            value={task}
            onChangeText={setTask}
            style={styles.input}
            placeholderTextColor={'#aaa'}
          />

          {/* Task Date Picker */}
          <TouchableOpacity onPress={() => setShowTaskDatePicker(true)} style={styles.dateTimeButton}>
            <Text style={styles.dateTimeText}>Escolher Data: {format(taskDate, 'dd/MM/yyyy')}</Text>
          </TouchableOpacity>
          {showTaskDatePicker && (
            <DateTimePicker
              value={taskDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                const currentDate = selectedDate || taskDate;
                setShowTaskDatePicker(false);
                setTaskDate(currentDate);
              }}
            />
          )}

          {/* Task Time Picker */}
          <TouchableOpacity onPress={() => setShowDateTimePicker(true)} style={styles.dateTimeButton}>
            <Text style={styles.dateTimeText}>Escolher Horário: {format(dateTime, 'HH:mm')}</Text>
          </TouchableOpacity>
          {showDateTimePicker && (
            <DateTimePicker
              value={dateTime}
              mode="time"
              display="default"
              onChange={(event, selectedDate) => {
                const currentDate = selectedDate || dateTime;
                setShowDateTimePicker(false);
                setDateTime(currentDate);
              }}
            />
          )}

          {/* Recorrente Toggle */}
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Recorrente:</Text>
            <Switch
              value={recorrente}
              onValueChange={setRecorrente}
              thumbColor={recorrente ? '#81b0ff' : '#f4f3f4'}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
            />
          </View>

          {/* If Recorrente is True, show Recurrence Frequency */}
          {recorrente && (
            <>
              <Text style={styles.label}>Frequência:</Text>
              <Picker
                selectedValue={frequenciaRecorrencia}
                onValueChange={(itemValue) => setFrequenciaRecorrencia(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Diária" value="Diária" />
                <Picker.Item label="Semanal" value="Semanal" />
                <Picker.Item label="Mensal" value="Mensal" />
              </Picker>
            </>
          )}

          {/* Add Details Section */}
          <TextInput
            placeholder="Adicionar detalhes"
            value={descricao}
            onChangeText={setDescricao}
            multiline={true}
            numberOfLines={3}
            style={[styles.input, { height: 80 }]}
            placeholderTextColor={'#aaa'}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    margin: 20,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cancelButton: {
    padding: 10,
  },
  cancelButtonText: {
    color: '#F44336',
    fontSize: 16,
  },
  saveButton: {
    padding: 10,
  },
  saveButtonText: {
    color: '#4CAF50',
    fontSize: 16,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  dateTimeButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginVertical: 10,
  },
  dateTimeText: {
    color: '#333',
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  picker: {
    width: '100%',
    color: '#333',
  },
});

export default AddTaskModal;
