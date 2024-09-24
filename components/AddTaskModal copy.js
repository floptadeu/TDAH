import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Modal, Button, StyleSheet, Alert, Switch } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import Database from '../services/Database';
import { Picker } from '@react-native-picker/picker';

const AddTaskModal = ({ visible, onClose, onAddTask, user }) => {
  const [task, setTask] = useState('');
  const [dificuldade, setDificuldade] = useState('Média');
  const [status, setStatus] = useState('não feita');
  const [pontosDados, setPontosDados] = useState(10);
  const [experienciaDada, setExperienciaDada] = useState(10);
  const [tipo, setTipo] = useState('atividade');
  const [recorrente, setRecorrente] = useState(false);
  const [frequenciaRecorrencia, setFrequenciaRecorrencia] = useState('Diária');
  const [dateTime, setDateTime] = useState(new Date());
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [dataFimRecorrencia, setDataFimRecorrencia] = useState(new Date());
  const [showDataFimRecorrenciaPicker, setShowDataFimRecorrenciaPicker] = useState(false);
  const [taskDate, setTaskDate] = useState(new Date());
  const [showTaskDatePicker, setShowTaskDatePicker] = useState(false); // Novo estado para o DateTimePicker do taskDate
  const db = new Database();

  useEffect(() => {
    if (!visible) {
      setTask('');
      setDificuldade('Média');
      setStatus('não feita');
      setPontosDados(10);
      setExperienciaDada(10);
      setTipo('atividade');
      setRecorrente(false);
      setFrequenciaRecorrencia('Diária');
      setDateTime(new Date());
      setTaskDate(new Date());
      setDataFimRecorrencia(new Date());
    }
  }, [visible]);

  const handleAddTask = () => {
    if (!task.trim()) {
      Alert.alert('Erro', 'Por favor, insira uma tarefa.');
      return;
    }

    const taskTime = format(dateTime, 'yyyy-MM-dd HH:mm:ss');
    const taskDateFormatada = format(taskDate, 'yyyy-MM-dd'); // Formato para data_tarefa
    const dataFimRecorrenciaFormatada = format(dataFimRecorrencia, 'yyyy-MM-dd');

    db.Conectar().then((database) => {
      database.transaction((tx) => {
        tx.executeSql(
          `INSERT INTO Tarefa 
          (nome, dificuldade, status, pontos_dados, experiencia_dada, tipo, usuario_id, data_criacao, data_tarefa, recorrente, frequencia_recorrencia, data_fim_recorrencia, descricao) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,
          [
            task,
            dificuldade,
            status,
            pontosDados,
            experienciaDada,
            tipo,
            user.id,
            taskTime,
            taskDateFormatada,
            recorrente ? 1 : 0,
            recorrente ? frequenciaRecorrencia : null,
            recorrente ? dataFimRecorrenciaFormatada : null,
          ],
          (_, results) => {
            if (results.rowsAffected > 0) {
              Alert.alert('Sucesso', 'Tarefa adicionada com sucesso!');
              onAddTask(task, dateTime);
              setTask('');
              setDateTime(new Date());
              onClose();
            } else {
              Alert.alert('Erro', 'Não foi possível adicionar a tarefa.');
            }
          },
          (error) => {
            console.log("Erro ao adicionar tarefa:", error);
            Alert.alert('Erro', 'Não foi possível adicionar a tarefa.');
          }
        );
      });
    }).catch((error) => {
      console.log("Erro ao conectar ao banco de dados:", error);
      Alert.alert('Erro', 'Não foi possível conectar ao banco de dados.');
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Adicionar Tarefa</Text>
          <TextInput
            placeholder="Nome da Tarefa"
            value={task}
            onChangeText={setTask}
            style={styles.input}
            placeholderTextColor={'#ccc'}
          />
          <Text style={styles.label}>Dificuldade:</Text>
          <Picker
            selectedValue={dificuldade}
            onValueChange={(itemValue) => setDificuldade(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Fácil" value="Fácil" />
            <Picker.Item label="Média" value="Média" />
            <Picker.Item label="Difícil" value="Difícil" />
          </Picker>
          <Text style={styles.label}>Tipo:</Text>
          <Picker
            selectedValue={tipo}
            onValueChange={(itemValue) => setTipo(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Atividade" value="atividade" />
            <Picker.Item label="Missão" value="missão" />
            <Picker.Item label="Desafio" value="desafio" />
          </Picker>
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Recorrente:</Text>
            <Switch
              value={recorrente}
              onValueChange={setRecorrente}
              thumbColor={recorrente ? '#81b0ff' : '#f4f3f4'}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
            />
          </View>
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
              <Button 
                title="Escolher Data de Fim da Recorrência" 
                onPress={() => setShowDataFimRecorrenciaPicker(true)} 
                color="#6200ee" 
              />
              {showDataFimRecorrenciaPicker && (
                <DateTimePicker
                  value={dataFimRecorrencia}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    const currentDate = selectedDate || dataFimRecorrencia;
                    setShowDataFimRecorrenciaPicker(false);
                    setDataFimRecorrencia(currentDate);
                  }}
                />
              )}
            </>
          )}
          <Button 
            title="Escolher Data da Tarefa" 
            onPress={() => setShowTaskDatePicker(true)} 
            color="#6200ee" 
          />
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
          <Button 
            title="Escolher Horário" 
            onPress={() => setShowDateTimePicker(true)} 
            color="#6200ee" 
          />
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
          <View style={styles.modalButtons}>
            <Button title="Adicionar" onPress={handleAddTask} color="#4CAF50" />
            <Button title="Cancelar" onPress={onClose} color="#F44336" />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 15,
  },
  input: {
    height: 40,
    borderColor: '#6200ee',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    width: '100%',
    backgroundColor: '#f7f7f7',
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginTop: 10,
    fontWeight: '600',
  },
  picker: {
    width: '100%',
    height: 50,
    color: '#6200ee',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
});

export default AddTaskModal;
