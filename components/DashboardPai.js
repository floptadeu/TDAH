// DashboardPai.js

import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { Agenda, LocaleConfig } from 'react-native-calendars';
import { format, addDays } from 'date-fns';
import Database from '../services/Database';
import NavigationBar from '../components/NavigationBar';
import AddTaskModal from '../components/AddTaskModal';
import EditTaskModal from '../components/EditTaskModal';
import XPBar from '../components/XPBar';
import TaskItem from '../components/TaskItem';

// Configuração do Locale para Português
LocaleConfig.locales['pt'] = {
  monthNames: [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ],
  monthNamesShort: [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ],
  dayNames: [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: 'Hoje',
};
LocaleConfig.defaultLocale = 'pt';

const DashboardPai = ({ navigation, route }) => {
  const { user, child } = route.params;
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [tasks, setTasks] = useState({});
  const [points, setPoints] = useState(0); // Inicializado como 0
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [experienciaAtual, setExperienciaAtual] = useState(0); // Inicializado como 0
  const [experienciaMaxima, setExperienciaMaxima] = useState(100);
  const [nivelAtual, setNivelAtual] = useState(1); // Inicializado como 1
  const [visibleButtons, setVisibleButtons] = useState({});

  const db = new Database();

  useEffect(() => {
    fetchUserData();
    fetchTasks();
    console.log('ID do usuário:', user.id);
    if (child) {
      console.log('Visualizando tarefas do filho:', child.nome);
    }
  }, [child, showEditModal, showModal]);

  // Função para buscar dados do usuário do banco de dados
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
                setExperienciaAtual(userData.pontos_experiencia);
                setNivelAtual(userData.nivel);
                setPoints(userData.pontos);
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

  const goToDatabaseViewer = () => navigation.navigate('DatabaseViewer');

  const toggleButtonVisibility = (taskId) => {
    setVisibleButtons((prevVisibleButtons) => ({
      ...prevVisibleButtons,
      [taskId]: !prevVisibleButtons[taskId],
    }));
  };

  const fetchTasks = () => {
    const userId = child ? child.id : user.id;
    db.Conectar()
      .then((database) => {
        database.transaction((tx) => {
          tx.executeSql(
            'SELECT * FROM Tarefa WHERE usuario_id = ?',
            [userId],
            (tx, results) => {
              const rows = results.rows;
              let tasksData = {};

              for (let i = 0; i < rows.length; i++) {
                const task = rows.item(i);

                if (!task.id) {
                  console.error('Tarefa sem ID: ', task);
                  continue;
                }

                const taskDate = format(
                  addDays(new Date(task.data_tarefa || task.data_criacao), 1),
                  'yyyy-MM-dd'
                );

                if (!tasksData[taskDate]) {
                  tasksData[taskDate] = [];
                }

                tasksData[taskDate].push({
                  ...task,
                  key: task.id.toString(),
                });
              }

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

  const adicionarXP = (xpGanho) => {
    setExperienciaAtual((prevXp) => {
      const novoXp = prevXp + xpGanho;
      if (novoXp >= experienciaMaxima) {
        const xpRestante = novoXp - experienciaMaxima;
        const novoNivel = nivelAtual + 1;
        setNivelAtual(novoNivel);
        updateUserXPandLevel(xpRestante, novoNivel);
        return xpRestante; // Reseta o XP e mantém o excesso
      } else {
        updateUserXPandLevel(novoXp, nivelAtual);
        return novoXp;
      }
    });
  };

  // Função para atualizar XP e nível no banco de dados
  const updateUserXPandLevel = (xp, nivel) => {
    const userId = child ? child.id : user.id;
    db.Conectar()
      .then((database) => {
        database.transaction((tx) => {
          tx.executeSql(
            'UPDATE Usuario SET pontos_experiencia = ?, nivel = ? WHERE id = ?',
            [xp, nivel, userId],
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

  const updateTaskStatus = (taskId, status) => {
    let xpGanho = 0;
    if (status === 'feita') {
      xpGanho = 20; // Valor de XP para tarefas feitas
    } else if (status === 'mais ou menos feita') {
      xpGanho = 10;
    }

    adicionarXP(xpGanho);

    // Atualização otimista
    setTasks((prevTasks) => {
      const updatedTasks = { ...prevTasks };
      Object.keys(updatedTasks).forEach((date) => {
        updatedTasks[date] = updatedTasks[date].map((task) =>
          task.id === taskId ? { ...task, status } : task
        );
      });
      return updatedTasks;
    });

    // Atualizar no banco de dados
    db.Conectar()
      .then((database) => {
        database.transaction((tx) => {
          tx.executeSql(
            'UPDATE Tarefa SET status = ? WHERE id = ?',
            [status, taskId],
            (_, results) => {
              if (results.rowsAffected > 0) {
                console.log('Status da tarefa atualizado no banco de dados.');
                fetchTasks();
                checkForNewBadges();
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

  // Função para verificar se o usuário ganhou novas insígnias
  const checkForNewBadges = () => {
    const userId = child ? child.id : user.id;
    db.Conectar()
      .then((database) => {
        database.transaction((tx) => {
          tx.executeSql(
            "SELECT COUNT(*) as total FROM Tarefa WHERE usuario_id = ? AND status = 'feita'",
            [userId],
            (_, results) => {
              const totalTarefasFeitas = results.rows.item(0).total;

              if (totalTarefasFeitas === 5) {
                grantBadge('Iniciante', 50);
              }
              // Adicione mais condições para outras insígnias
            }
          );
        });
      })
      .catch((error) => {
        console.log('Erro ao conectar ao banco de dados:', error);
      });
  };

  // Função para conceder uma insígnia ao usuário
  const grantBadge = (badgeName, pointsAwarded) => {
    const userId = child ? child.id : user.id;
    db.Conectar()
      .then((database) => {
        database.transaction((tx) => {
          // Verifica se o usuário já possui a insígnia
          tx.executeSql(
            'SELECT * FROM UsuarioInsignia WHERE usuario_id = ? AND nome_insignia = ?',
            [userId, badgeName],
            (_, results) => {
              if (results.rows.length === 0) {
                // Inserir a nova insígnia
                tx.executeSql(
                  'INSERT INTO UsuarioInsignia (usuario_id, nome_insignia) VALUES (?, ?)',
                  [userId, badgeName],
                  () => {
                    updateUserPoints(points + pointsAwarded); // Atualiza os pontos
                    Alert.alert('Parabéns!', `Você ganhou a insígnia ${badgeName} e recebeu ${pointsAwarded} pontos!`);
                  }
                );
              }
            }
          );
        });
      })
      .catch((error) => {
        console.log('Erro ao conceder insígnia:', error);
      });
  };
  

  // Função para atualizar os pontos do usuário
  const updateUserPoints = (newPoints) => {
    const userId = child ? child.id : user.id;
    setPoints(newPoints);
    db.Conectar()
      .then((database) => {
        database.transaction((tx) => {
          tx.executeSql(
            'UPDATE Usuario SET pontos = ? WHERE id = ?',
            [newPoints, userId],
            (_, results) => {
              if (results.rowsAffected > 0) {
                console.log('Pontos do usuário atualizados no banco de dados.');
              }
            },
            (error) => {
              console.log('Erro ao atualizar pontos do usuário:', error);
            }
          );
        });
      })
      .catch((error) => {
        console.log('Erro ao conectar ao banco de dados:', error);
      });
  };

  const deleteTask = (taskId) => {
    db.Conectar()
      .then((database) => {
        database.transaction((tx) => {
          tx.executeSql(
            'DELETE FROM Tarefa WHERE id = ?',
            [taskId],
            (_, results) => {
              if (results.rowsAffected > 0) {
                Alert.alert('Sucesso', 'Tarefa deletada com sucesso.');
                fetchTasks();
              } else {
                Alert.alert('Erro', 'Não foi possível deletar a tarefa.');
              }
            },
            (error) => {
              console.log('Erro ao deletar tarefa:', error);
              Alert.alert('Erro', 'Não foi possível deletar a tarefa.');
            }
          );
        });
      })
      .catch((error) => {
        console.log('Erro ao conectar ao banco de dados:', error);
        Alert.alert('Erro', 'Não foi possível conectar ao banco de dados.');
      });
  };

  const editTask = (task) => {
    setTaskToEdit(task);
    setShowEditModal(true);
  };

  const goToStore = () => navigation.navigate('Loja', { user, points, setPoints });
  const goToGarden = () => navigation.navigate('Garden', { user });
  const goToProfile = () => navigation.navigate('Perfil', { user });
  const goToInsignias = () => navigation.navigate('Insignias', { user: child || user });

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  return (
    <View style={styles.container}>
      {child ? (
        <Text style={styles.title}>Tarefas de {child.nome}</Text>
      ) : (
        <Text style={styles.title}>Suas Tarefas</Text>
      )}

      <XPBar
        experienciaAtual={experienciaAtual}
        experienciaMaxima={experienciaMaxima}
        nivelAtual={nivelAtual}
        pontos={points}
        onPress={goToInsignias}
      />

      <AddTaskModal
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          fetchTasks();
        }}
        onAddTask={fetchTasks}
        user={child || user}
      />

      {taskToEdit && (
        <EditTaskModal
          visible={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setTaskToEdit(null);
            fetchTasks();
          }}
          task={taskToEdit}
          user={child || user}
        />
      )}

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
            deleteTask={deleteTask}
            editTask={editTask}
          />
        )}
        renderEmptyDate={() => (
          <View style={styles.emptyDate}>
            <Text>Sem tarefas</Text>
          </View>
        )}
      />

      <TouchableOpacity onPress={goToDatabaseViewer} style={styles.viewDbButton}>
        <Text style={styles.viewDbButtonText}>Visualizar Banco de Dados</Text>
      </TouchableOpacity>

      <NavigationBar
        goToStore={goToStore}
        goToGarden={goToGarden}
        goToProfile={goToProfile}
        openAddTaskModal={() => setShowModal(true)}
      />
    </View>
  );
};

export default DashboardPai;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f7f7f7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 30,
  },
  viewDbButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  viewDbButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
