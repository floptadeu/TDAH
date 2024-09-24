import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import Database from '../services/Database';

const DatabaseViewer = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [arvores, setArvores] = useState([]);
  const [recompensas, setRecompensas] = useState([]);
  const [itensComprados, setItensComprados] = useState([]);
  const [visibleTables, setVisibleTables] = useState({
    usuarios: false,
    tarefas: false,
    arvores: false,
    recompensas: false,
    itensComprados: false,
  });

  const db = new Database();

  useEffect(() => {
    loadDatabase();
  }, []);

  const loadDatabase = async () => {
    try {
      const database = await db.Conectar();

      // Fetch all tables
      fetchTableData(database, 'Usuario', setUsuarios);
      fetchTableData(database, 'Tarefa', setTarefas);
      fetchTableData(database, 'Arvore', setArvores);
      fetchTableData(database, 'Recompensa', setRecompensas);
      fetchTableData(database, 'ItensComprados', setItensComprados);

    } catch (error) {
      console.log('Erro ao conectar ao banco de dados:', error);
      Alert.alert('Erro', 'Não foi possível conectar ao banco de dados.');
    }
  };

  const fetchTableData = (database, tableName, setData) => {
    database.transaction((tx) => {
      tx.executeSql(`SELECT * FROM ${tableName}`, [], (tx, results) => {
        const rows = results.rows;
        let tableData = [];
        for (let i = 0; i < rows.length; i++) {
          tableData.push(rows.item(i));
        }
        setData(tableData);
      });
    }, (error) => {
      console.log(`Erro ao buscar dados da tabela ${tableName}:`, error);
    });
  };

  const toggleTableVisibility = (tableName) => {
    setVisibleTables((prevState) => ({
      ...prevState,
      [tableName]: !prevState[tableName],
    }));
  };

  const renderTable = (title, data, tableName) => (
    <View style={styles.tableContainer} key={tableName}>
      <TouchableOpacity onPress={() => toggleTableVisibility(tableName)}>
        <Text style={styles.tableTitle}>{title}</Text>
      </TouchableOpacity>
      {visibleTables[tableName] && (
        <FlatList
          data={data}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.row}>
              {Object.entries(item).map(([key, value]) => (
                <Text style={styles.cell} key={key}>{`${key}: ${value}`}</Text>
              ))}
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum dado disponível</Text>}
        />
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {renderTable('Usuários', usuarios, 'usuarios')}
      {renderTable('Tarefas', tarefas, 'tarefas')}
      {renderTable('Arvores', arvores, 'arvores')}
      {renderTable('Recompensas', recompensas, 'recompensas')}
      {renderTable('Itens Comprados', itensComprados, 'itensComprados')}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f7f7f7',
  },
  tableContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#6200ee', // Cor dos títulos das tabelas
  },
  row: {
    flexDirection: 'column',
    marginBottom: 5,
  },
  cell: {
    fontSize: 14,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
  },
});

export default DatabaseViewer;
