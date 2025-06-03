const db = require('../database');

// SQLs usados para criar as tabelas (só para referência)
const SQL_ENQUETES = `
    CREATE TABLE enquetes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        inicio DATETIME NOT NULL,
        fim DATETIME NOT NULL
    )
`;

const SQL_OPCOES = `
    CREATE TABLE opcoes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        enquete_id INT NOT NULL,
        texto VARCHAR(255) NOT NULL,
        votos INT DEFAULT 0,
        FOREIGN KEY (enquete_id) REFERENCES enquetes(id) ON DELETE CASCADE
    )
`;

// Não precisa executar automaticamente (só para consulta)
console.log('Estrutura do banco:');
console.log(SQL_ENQUETES);
console.log(SQL_OPCOES);

module.exports = { SQL_ENQUETES, SQL_OPCOES };