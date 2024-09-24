// InsigniasScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import Database from '../services/Database';

const InsigniasScreen = ({ route, navigation }) => {
  const { user } = route.params;
  const [insignias, setInsignias] = useState([]);

  const db = new Database();

  useEffect(() => {
    inserirInsigniasDeExemplo();
  }, []);

  const inserirInsigniasDeExemplo = () => {
    db.Conectar()
      .then((database) => {
        database.transaction((tx) => {
          // Obter o nível atual do usuário
          tx.executeSql(
            'SELECT nivel FROM Usuario WHERE id = ?',
            [user.id],
            (_, results) => {
              if (results.rows.length > 0) {
                const nivelUsuario = results.rows.item(0).nivel;

                // Definir insígnias baseadas no nível
                const insigniasParaAdicionar = [];

                if (nivelUsuario >= 1) {
                  insigniasParaAdicionar.push('Iniciante');
                }
                if (nivelUsuario >= 5) {
                  insigniasParaAdicionar.push('Intermediário');
                }
                if (nivelUsuario >= 10) {
                  insigniasParaAdicionar.push('Avançado');
                }
                if (nivelUsuario >= 20) {
                  insigniasParaAdicionar.push('Especialista');
                }

                // Inserir cada insígnia, se ainda não tiver sido atribuída
                if (insigniasParaAdicionar.length === 0) {
                  // Se não houver insígnias para adicionar, buscar as existentes
                  fetchUserBadges();
                } else {
                  const promises = insigniasParaAdicionar.map((nomeInsignia) => {
                    return new Promise((resolve, reject) => {
                      tx.executeSql(
                        'SELECT * FROM UsuarioInsignia WHERE usuario_id = ? AND nome_insignia = ?',
                        [user.id, nomeInsignia],
                        (_, results) => {
                          if (results.rows.length === 0) {
                            // Inserir a insígnia
                            tx.executeSql(
                              'INSERT INTO UsuarioInsignia (usuario_id, nome_insignia, data_conquista, pontos_recebidos) VALUES (?, ?, ?, ?)',
                              [user.id, nomeInsignia, new Date().toISOString(), 0],
                              () => {
                                console.log(`Insígnia ${nomeInsignia} atribuída ao usuário ${user.id}`);
                                resolve();
                              },
                              (error) => {
                                console.log('Erro ao inserir insígnia:', error);
                                resolve();
                              }
                            );
                          } else {
                            resolve();
                          }
                        },
                        (error) => {
                          console.log('Erro ao verificar insígnia:', error);
                          resolve();
                        }
                      );
                    });
                  });

                  Promise.all(promises).then(() => {
                    fetchUserBadges();
                  });
                }
              } else {
                // Se o usuário não for encontrado, buscar as insígnias existentes
                fetchUserBadges();
              }
            },
            (error) => {
              console.log('Erro ao obter nível do usuário:', error);
              fetchUserBadges();
            }
          );
        });
      })
      .catch((error) => {
        console.log('Erro ao conectar ao banco de dados:', error);
        fetchUserBadges();
      });
  };

  const fetchUserBadges = () => {
    db.Conectar()
      .then((database) => {
        database.transaction((tx) => {
          tx.executeSql(
            'SELECT nome_insignia, data_conquista, pontos_recebidos FROM UsuarioInsignia WHERE usuario_id = ?',
            [user.id],
            (_, results) => {
              const rows = results.rows;
              let badges = [];
              for (let i = 0; i < rows.length; i++) {
                badges.push(rows.item(i));
              }
              setInsignias(badges);
            },
            (error) => {
              console.log('Erro ao buscar insígnias:', error);
            }
          );
        });
      })
      .catch((error) => {
        console.log('Erro ao conectar ao banco de dados:', error);
      });
  };

  // Mapas para descrições, pontos e ícones das insígnias
  const badgeDescriptions = {
    'Iniciante': 'Concedida ao alcançar o nível 1.',
    'Intermediário': 'Concedida ao alcançar o nível 5.',
    'Avançado': 'Concedida ao alcançar o nível 10.',
    'Especialista': 'Concedida ao alcançar o nível 20.',
  };

  const badgePoints = {
    'Iniciante': 50,
    'Intermediário': 100,
    'Avançado': 150,
    'Especialista': 200,
  };

  const badgeIcons = {
    'Iniciante': require('../assets/icons/iniciante.png'),
    'Intermediário': require('../assets/icons/intermediario.png'),
    'Avançado': require('../assets/icons/avancado.png'),
    'Especialista': require('../assets/icons/especialista.png'),
  };

  const handleClaimPoints = (item) => {
    const pontos = badgePoints[item.nome_insignia] || 0;

    db.Conectar()
      .then((database) => {
        database.transaction((tx) => {
          tx.executeSql(
            'UPDATE Usuario SET pontos = pontos + ? WHERE id = ?',
            [pontos, user.id],
            (_, results) => {
              if (results.rowsAffected > 0) {
                tx.executeSql(
                  'UPDATE UsuarioInsignia SET pontos_recebidos = 1 WHERE usuario_id = ? AND nome_insignia = ?',
                  [user.id, item.nome_insignia],
                  (_, results) => {
                    if (results.rowsAffected > 0) {
                      Alert.alert('Sucesso', `Você recebeu ${pontos} pontos pela insígnia ${item.nome_insignia}.`);
                      fetchUserBadges();
                    }
                  },
                  (error) => {
                    console.log('Erro ao atualizar pontos_recebidos:', error);
                  }
                );
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

  const renderInsignia = ({ item }) => (
    <View style={styles.insigniaItem}>
      {/* Exibição do ícone da insígnia */}
      <Image
        source={badgeIcons[item.nome_insignia]}
        style={styles.insigniaIcon}
        resizeMode="contain"
      />
      <View style={styles.insigniaInfo}>
        <Text style={styles.insigniaTitulo}>{item.nome_insignia}</Text>
        <Text style={styles.insigniaDescricao}>{badgeDescriptions[item.nome_insignia]}</Text>
        <Text style={styles.insigniaData}>
          Conquistada em: {new Date(item.data_conquista).toLocaleDateString()}
        </Text>
        {item.pontos_recebidos === 0 ? (
          <TouchableOpacity
            style={styles.claimButton}
            onPress={() => handleClaimPoints(item)}
          >
            <Text style={styles.claimButtonText}>Receber Pontos</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.pointsReceivedText}>Pontos já recebidos</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Botão de voltar */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Voltar</Text>
      </TouchableOpacity>

      <FlatList
        data={insignias}
        renderItem={renderInsignia}
        keyExtractor={(item) => item.nome_insignia}
        ListEmptyComponent={<Text>Nenhuma insígnia conquistada ainda.</Text>}
        contentContainerStyle={{ paddingTop: 20 }}
      />
    </View>
  );
};

export default InsigniasScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#f7f7f7',
  },
  backButton: {
    marginTop: 40,
    alignSelf: 'flex-start',
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: '#000',
  },
  insigniaItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  insigniaIcon: {
    width: 60,
    height: 60,
    marginRight: 15,
  },
  insigniaInfo: {
    flex: 1,
  },
  insigniaTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  insigniaDescricao: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  insigniaData: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  claimButton: {
    marginTop: 10,
    backgroundColor: '#48BB78',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  claimButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  pointsReceivedText: {
    marginTop: 10,
    color: '#4A5568',
    fontStyle: 'italic',
  },
});
