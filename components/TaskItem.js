// components/TaskItem.js

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Button, StyleSheet } from 'react-native';
import { format } from 'date-fns';

const TaskItem = ({
  item,
  toggleButtonVisibility,
  visibleButtons,
  updateTaskStatus,
  deleteTask,
  editTask,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePress = () => {
    setIsExpanded(!isExpanded);
    toggleButtonVisibility(item.id);
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={styles.taskItem}>
        <Text style={styles.taskDescription}>{item.nome}</Text>
        <Text style={styles.taskStatus}>Status: {item.status}</Text>
        <Text style={styles.taskTime}>
          Horário: {format(new Date(item.data_criacao), 'HH:mm')}
        </Text>

        {isExpanded && (
          <>
            {item.descricao ? (
              <Text style={styles.taskDetail}>Descrição: {item.descricao}</Text>
            ) : null}
            <View style={styles.statusButtons}>
              <Button
                title="Feita"
                onPress={() => updateTaskStatus(item.id, 'feita')}
                color="#4CAF50"
              />
              <Button
                title="Mais ou Menos"
                onPress={() => updateTaskStatus(item.id, 'mais ou menos feita')}
                color="#FFC107"
              />
              <Button
                title="Não Feita"
                onPress={() => updateTaskStatus(item.id, 'não feita')}
                color="#F44336"
              />
            </View>
            <View style={styles.actionButtons}>
              <Button
                title="Editar"
                onPress={() => editTask(item)}
                color="#007BFF"
              />
              <Button
                title="Deletar"
                onPress={() => deleteTask(item.id)}
                color="#F44336"
              />
            </View>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  taskItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 5,
    marginRight: 10,
    marginTop: 17,
    // Removido 'height' para permitir expansão dinâmica
    // height: 120,
    justifyContent: 'space-between',
  },
  taskDescription: {
    fontSize: 16,
    color: '#333',
  },
  taskStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  taskTime: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
  },
  taskDetail: {
    fontSize: 14,
    color: '#333',
    marginTop: 10,
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

export default TaskItem;
