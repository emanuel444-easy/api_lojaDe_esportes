
const express = require('express');
const db = require('../config/database');

const router = express.Router();

router.get('/', (req, res) => {
    const produtos = db.prepare(
        'SELECT * FROM produto'
    ).all();

    res.json(produtos);
});

module.exports = router;
