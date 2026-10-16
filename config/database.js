
const Database = require('better-sqlite3');
const path = require('path');

const caminhoBanco = path.join(
    __dirname,
    '..',
    'db',
    'lojade_esportes (1).db'
);

const db = new Database(caminhoBanco);

db.pragma('foreign_keys = ON');

module.exports = db;
