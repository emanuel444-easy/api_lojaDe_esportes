
const Database = require('better-sqlite3');
const path = require('path');

// Monta o caminho do arquivo do banco a partir da localização deste módulo.
const caminhoBanco = path.join(
    __dirname,
    '..',
    'db',
    'lojade_esportes (1).db'
);

const db = new Database(caminhoBanco);

// Ativa a validação das chaves estrangeiras nas operações desta conexão.
db.pragma('foreign_keys = ON');

module.exports = db;
