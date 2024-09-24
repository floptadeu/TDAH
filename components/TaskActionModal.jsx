import React, { useState } from 'react';
import { Modal, View, Text, Button, StyleSheet, TextInput } from 'react-native';

const TaskActionModal = ({ visible, onClose, task, onUpdateTask, onDeleteTask, onStatusChange }) => {
  const [taskName, setTaskName] = useState(task?.nome || '');
  const [taskStatus, setTaskStatus] = useState(task?.status || '');

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Editar Tarefa</Text>

          {/* Editar Nome da Tarefa */}
          <TextInput
            style={styles.input}
            placeholder="Nome da Tarefa"
            value={taskName}
            onChangeText={setTaskName}
          />

          {/* Botões para Atualizar Status */}
          <Text>Status da Tarefa</Text>
          <View style={styles.statusButtons}>
            <Button title="Feita" onPress={() => setTaskStatus('feita')} color="#4CAF50" />
            <Button title="Mais ou Menos" onPress={() => setTaskStatus('mais ou menos feita')} color="#FFC107" />
            <Button title="Não Feita" onPress={() => setTaskStatus('não feita')} color="#F44336" />
          </View>

          {/* Botões de Ação */}
          <View style={styles.actionButtons}>
            <Button
              title="Salvar Alterações"
              onPress={() => {
                onUpdateTask({ ...task, nome: taskName, status: taskStatus });
                onClose();
              }}
            />
            <Button
              title="Deletar Tarefa"
              onPress={() => {
                onDeleteTask(task.id);
                onClose();
              }}
              color="#FF0000"
            />
            <Button title="Cancelar" onPress={onClose} />
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButtons: {
    width: '100%',
    marginTop: 20,
  },
});

export default TaskActionModal;
