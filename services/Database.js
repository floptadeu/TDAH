import SQLite from 'react-native-sqlite-storage';

SQLite.DEBUG(true); // Habilita o modo de depuração para o SQLite
SQLite.enablePromise(true); // Habilita o uso de Promises

const database_name = "TDAH.db"; // Nome do banco de dados
const database_version = "1.0"; // Versão do banco de dados
const database_displayname = "TDAH - React Native"; // Nome de exibição do banco de dados
const database_size = 200000; // Tamanho do banco de dados

export default class Database {
  // Função para conectar ao banco de dados
  Conectar() {
    let db;
    return new Promise((resolve, reject) => {
      console.log("Checando a integridade do plugin ...");
      SQLite.echoTest().then(() => {
        console.log("Integridade Ok ...");
        console.log("Abrindo Banco de Dados ...");
        SQLite.openDatabase(
          database_name,
          database_version,
          database_displayname,
          database_size
        )
          .then((DB) => {
            db = DB;
            console.log("Banco de dados Aberto");
            // Verifica se a tabela 'Usuario' já existe
            db.executeSql('SELECT 1 FROM Usuario LIMIT 1')
              .then(() => {
                console.log("O banco de dados está pronto ... Executando Consulta SQL ...");
                resolve(db);
              })
              .catch((error) => {
                console.log("Erro Recebido: ", error);
                console.log("O Banco de dados não está pronto ... Criando Dados");
                // Se as tabelas não existirem, crie-as
                this.criarTabelas(db)
                  .then(() => {
                    console.log("Tabelas criadas com sucesso");
                    // Adiciona os itens padrão após a criação das tabelas
                    this.adicionarItensPadrao(db)
                      .then(() => {
                        console.log("Itens padrão adicionados");
                        resolve(db);
                      })
                      .catch((error) => {
                        console.log("Erro ao adicionar itens padrão:", error);
                        reject(error);
                      });
                  })
                  .catch((error) => {
                    console.log("Erro na criação das tabelas:", error);
                    reject(error);
                  });
              });
          })
          .catch((error) => {
            console.log("Erro ao abrir banco de dados: ", error);
            reject(error);
          });
      }).catch((error) => {
        console.log("echoTest Falhou - plugin não funcional");
        reject(error);
      });
    });
  }

  // Função para criar as tabelas no banco de dados
  criarTabelas(db) {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS Usuario (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            nome VARCHAR(50) NOT NULL, 
            email VARCHAR(100) UNIQUE NOT NULL, 
            senha VARCHAR(100) NOT NULL,
            pontos_experiencia INTEGER DEFAULT 0, 
            nivel INTEGER DEFAULT 1, 
            pontos INTEGER DEFAULT 0,  
            data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
            pai_id INTEGER,
            tipo_usuario VARCHAR(10) CHECK (tipo_usuario IN ('pai', 'filho')) NOT NULL,
            FOREIGN KEY (pai_id) REFERENCES Usuario(id) ON DELETE SET NULL
          );`
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS Tarefa (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            nome VARCHAR(100) NOT NULL, 
            dificuldade VARCHAR(20), 
            status VARCHAR(20), 
            pontos_dados INTEGER, 
            experiencia_dada INTEGER,
            tipo VARCHAR(10) NOT NULL, 
            usuario_id INTEGER NOT NULL,
            data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
            data_tarefa DATE NOT NULL,
            recorrente BOOLEAN DEFAULT 0,
            frequencia_recorrencia VARCHAR(20),
            data_fim_recorrencia DATE,
            descricao VARCHAR(250), 
            FOREIGN KEY (usuario_id) REFERENCES Usuario(id) ON DELETE CASCADE
          );`
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS Arvore (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              usuario_id INTEGER NOT NULL,
              recompensa_id INTEGER,
              data_plantio DATETIME DEFAULT CURRENT_TIMESTAMP,
              quantidade INTEGER DEFAULT 1,
              FOREIGN KEY (usuario_id) REFERENCES Usuario(id) ON DELETE CASCADE,
            FOREIGN KEY (recompensa_id) REFERENCES Recompensa(id) ON DELETE CASCADE
);`
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS Recompensa (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome VARCHAR(50) NOT NULL,
            descricao TEXT,
            custo INTEGER NOT NULL,
            quantidade_disponivel INTEGER DEFAULT 1
          );`
        );
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS UsuarioInsignia (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            nome_insignia VARCHAR(50) NOT NULL,
            data_conquista DATETIME DEFAULT CURRENT_TIMESTAMP,
            pontos_recebidos INTEGER DEFAULT 0,
            FOREIGN KEY (usuario_id) REFERENCES Usuario(id) ON DELETE CASCADE
          );`
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS ItensComprados (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id INTEGER NOT NULL,
            tipo_item VARCHAR(20) NOT NULL,
            usuario_id INTEGER NOT NULL,
            quantidade INTEGER DEFAULT 1,
            data_compra DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES Usuario(id) ON DELETE CASCADE
          );`
        );
      })
        .then(() => {
          console.log("Todas as tabelas foram criadas com sucesso.");
          resolve();
        })
        .catch((error) => {
          console.log("Erro na criação das tabelas: ", error);
          reject(error);
        });
    });
  }
  
  // Função para adicionar itens padrão nas tabelas
  adicionarItensPadrao(db) {
    return new Promise((resolve, reject) => {
      const recompensasPadrao = [
        { nome: 'Skin Especial', descricao: 'Uma skin rara para personalizar seu personagem.', custo: 50 },
        { nome: 'Avatar Exclusivo', descricao: 'Um avatar único para o seu perfil.', custo: 30 },
        { nome: 'Música Personalizada', descricao: 'Adicione uma música personalizada ao seu perfil.', custo: 20 },
        { nome: 'Tema Noturno', descricao: 'Altere o tema para um visual noturno.', custo: 40 },
        { nome: 'Plantar Árvore', descricao: 'Plante uma árvore virtual no seu jardim.', custo: 10 },
      ];

      const tarefasPadrao = [
        { nome: 'Fazer lição de casa', descricao: 'Completar todas as tarefas de casa.', custo: 15, pai_id: 1 },
        { nome: 'Arrumar o quarto', descricao: 'Deixar o quarto limpo e organizado.', custo: 20, pai_id: 1 },
      ];

      db.transaction((tx) => {
        recompensasPadrao.forEach((recompensa) => {
          tx.executeSql(
            `INSERT INTO Recompensa (nome, descricao, custo) 
             SELECT ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM Recompensa WHERE nome = ?)`,
            [recompensa.nome, recompensa.descricao, recompensa.custo, recompensa.nome]
          );
        });

        tarefasPadrao.forEach((tarefa) => {
          tx.executeSql(
            `INSERT INTO TarefasLoja (nome, descricao, custo, pai_id) 
             SELECT ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM TarefasLoja WHERE nome = ?)`,
            [tarefa.nome, tarefa.descricao, tarefa.custo, tarefa.pai_id, tarefa.nome]
          );
        });
      })
        .then(() => {
          console.log("Itens padrão foram adicionados com sucesso.");
          resolve();
        })
        .catch((error) => {
          console.log("Erro ao inserir itens padrão: ", error);
          reject(error);
        });
    });
  }
}
