// DashboardFilho.js

import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { Agenda, LocaleConfig } from 'react-native-calendars';
import { format, addDays } from 'date-fns';
import Database from '../services/Database';
import NavigationBar from '../components/NavigationBar';
import XPBar from '../components/XPBar';
import TaskItem from '../components/TaskItem'; // Reutilizar o componente TaskItem

// Configuração do Locale para Português
LocaleConfig.locales['pt'] = {
  monthNames: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ],
  monthNamesShort: [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
  ],
  dayNames: [
    'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
    'Quinta-feira', 'Sexta-feira', 'Sábado',
  ],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: 'Hoje',
};
LocaleConfig.defaultLocale = 'pt';

const DashboardFilho = ({ navigation, route }) => {
  const { user } = route.params; // Usuário filho
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [tasks, setTasks] = useState({});
  const [points, setPoints] = useState(0);
  const [experienciaAtual, setExperienciaAtual] = useState(0);
  const [experienciaMaxima, setExperienciaMaxima] = useState(100);
  const [nivelAtual, setNivelAtual] = useState(1);
  const [visibleButtons, setVisibleButtons] = useState({});

  const db = new Database();

  useEffect(() => {
    fetchTasks();
    fetchUserData();
  }, []);

  const fetchUserData = () => {
    const userId = child ? child.id : user.id;
    db.Conectar()
      .then((database) => {
        database.transaction((tx) => {
          tx.executeSql(
            'SELECT pontos_experiencia, nivel, pontos FROM Usuario WHERE id = ?',
            [userId],
            (tx, results) => {
              if (results.rows.length > 0) {
                const userData = results.rows.item(0);
                setExperienciaAtual(userData.pontos_experiencia || 0); // Garantindo que nunca seja undefined
                setExperienciaMaxima(100); // Defina o valor apropriado de experiência máxima
                setNivelAtual(userData.nivel || 1); // Garantindo que nunca seja undefined
                setPoints(userData.pontos || 0);
              }
            },
            (error) => {
              console.log('Erro ao buscar dados do usuário:', error);
            }
          );
        });
      })
      .catch((error) => {
        console.log('Erro ao conectar ao banco de dados:', error);
      });
  };

  const fetchTasks = () => {
    db.Conectar()
      .then((database) => {
        database.transaction((tx) => {
          tx.executeSql(
            'SELECT * FROM Tarefa WHERE usuario_id = ?',
            [user.id],
            (tx, results) => {
              const rows = results.rows;
              let tasksData = {};

              // Loop sobre as tarefas retornadas
              for (let i = 0; i < rows.length; i++) {
                const task = rows.item(i);

                // Verifique se o ID da tarefa existe
                if (!task.id) {
                  console.error('Tarefa sem ID: ', task);
                  continue; // Pula a tarefa se não tiver um ID válido
                }

                // Formate a data da tarefa ou a data de criação
                const taskDate = format(
                  addDays(new Date(task.data_tarefa || task.data_criacao), 1),
                  'yyyy-MM-dd'
                );

                // Organize as tarefas por data
                if (!tasksData[taskDate]) {
                  tasksData[taskDate] = [];
                }

                // Adicione a tarefa à data correspondente
                tasksData[taskDate].push({
                  ...task,
                  key: task.id.toString(), // Adiciona a propriedade key
                });
              }

              // Atualiza o estado com as tarefas organizadas
              setTasks(tasksData);
            },
            (error) => {
              console.log('Erro ao buscar tarefas:', error);
            }
          );
        });
      })
      .catch((error) => {
        console.log('Erro ao conectar ao banco de dados:', error);
      });
  };

  const toggleButtonVisibility = (taskId) => {
    setVisibleButtons((prevVisibleButtons) => ({
      ...prevVisibleButtons,
      [taskId]: !prevVisibleButtons[taskId],
    }));
  };

// Dentro do DashboardPai.js

const updateTaskStatus = (taskId, status) => {
  // Atualização otimista: atualize o estado localmente antes de atualizar o banco de dados
  setTasks((prevTasks) => {
    const updatedTasks = { ...prevTasks };
    Object.keys(updatedTasks).forEach((date) => {
      updatedTasks[date] = updatedTasks[date].map((task) =>
        task.id === taskId ? { ...task, status } : task
      );
    });
    return updatedTasks;
  });

  // Atualizar o status no banco de dados
  db.Conectar()
    .then((database) => {
      database.transaction((tx) => {
        tx.executeSql(
          'UPDATE Tarefa SET status = ? WHERE id = ?',
          [status, taskId],
          (_, results) => {
            if (results.rowsAffected > 0) {
              console.log('Status da tarefa atualizado no banco de dados.');
              fetchTasks(); // Atualiza as tarefas
            } else {
              Alert.alert('Erro', 'Não foi possível atualizar o status da tarefa.');
            }
          },
          (error) => {
            console.log('Erro ao atualizar status da tarefa:', error);
            Alert.alert('Erro', 'Não foi possível atualizar o status da tarefa.');
          }
        );
      });
    })
    .catch((error) => {
      console.log('Erro ao conectar ao banco de dados:', error);
      Alert.alert('Erro', 'Não foi possível conectar ao banco de dados.');
    });
};


  const adicionarXP = (xpGanho) => {
    setExperienciaAtual((prevXp) => {
      const novoXp = prevXp + xpGanho;
      if (novoXp >= experienciaMaxima) {
        setNivelAtual((prevNivel) => prevNivel + 1);
        return novoXp - experienciaMaxima; // Reseta o XP e mantém o excesso
      } else {
        return novoXp;
      }
    });

    // Atualizar o XP e nível no banco de dados
    db.Conectar()
      .then((database) => {
        database.transaction((tx) => {
          tx.executeSql(
            'UPDATE Usuario SET pontos_experiencia = ?, nivel = ? WHERE id = ?',
            [experienciaAtual, nivelAtual, user.id],
            (_, results) => {
              if (results.rowsAffected > 0) {
                console.log('XP e nível atualizados no banco de dados.');
              }
            },
            (error) => {
              console.log('Erro ao atualizar XP e nível:', error);
            }
          );
        });
      })
      .catch((error) => {
        console.log('Erro ao conectar ao banco de dados:', error);
      });
  };

  const goToStore = () => navigation.navigate('Loja', { user });
  const goToGarden = () => navigation.navigate('Garden', { user });
  const goToProfile = () => navigation.navigate('Perfil', { user });
  const goToInsignias = () => navigation.navigate('Insignias', { user });

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  return (
    <View style={styles.container}>
      <XPBar
        experienciaAtual={experienciaAtual}
        experienciaMaxima={experienciaMaxima}
        nivelAtual={nivelAtual}
        pontos={points}
        onPress={goToInsignias}
      />

      <Agenda
        items={tasks}
        selected={selectedDate}
        onDayPress={handleDayPress}
        locale={'pt'}
        renderItem={(item) => (
          <TaskItem
            key={item.id.toString()}
            item={item}
            toggleButtonVisibility={toggleButtonVisibility}
            visibleButtons={visibleButtons}
            updateTaskStatus={updateTaskStatus}
          />
        )}
        renderEmptyDate={() => (
          <View style={styles.emptyDate}>
            <Text>Sem tarefas</Text>
          </View>
        )}
      />

      <NavigationBar
        goToStore={goToStore}
        goToGarden={goToGarden}
        goToProfile={goToProfile}
        openAddTaskModal={() => {}}
      />
    </View>
  );
};

export default DashboardFilho;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f7f7f7',
  },
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 30,
  },
});
