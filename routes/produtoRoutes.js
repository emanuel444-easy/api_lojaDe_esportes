
const express = require('express');
const db = require('../config/database');

const router = express.Router();

// Lista todos os produtos cadastrados.
router.get('/', (req, res) => {
    const produto = db.prepare(
        'SELECT * FROM produto'
    ).all();

    res.json(produto);
});

router.get('/:id', (req, res) => {
    // Valida o identificador antes de procurar o produto.
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            erro: 'ID inválido.'
        });
    }
    const produto = db.prepare(
        'SELECT * FROM produto WHERE id_produto = ?'
    ).get(id);

    if (!produto) {
        return res.status(404).json({
            erro: 'Produto não encontrado.'
        });
    }
    res.json(produto);
});

router.post('/', (req, res) => {
    const {
        id_lojista,
        id_categoria,
        nome,
        descricao,
        preco,
        estoque
    } = req.body;

    // Valida os campos obrigatórios e seus tipos antes de gravar no banco.
    if (
        !Number.isInteger(Number(id_lojista)) ||
        Number(id_lojista) <= 0 ||
        !Number.isInteger(Number(id_categoria)) ||
        Number(id_categoria) <= 0 ||
        typeof nome !== 'string' ||
        !nome.trim() ||
        !Number.isFinite(Number(preco)) ||
        Number(preco) < 0 ||
        estoque === undefined ||
        !Number.isInteger(Number(estoque)) ||
        Number(estoque) < 0
    ) {
        return res.status(400).json({
            erro: 'Informe lojista, categoria, nome, preço e estoque válidos.'
        });
    }

    try {
        // Usa parâmetros SQL para inserir os dados sem concatená-los na consulta.
        const resultado = db.prepare(`
            INSERT INTO produto
            (id_lojista, id_categoria, nome, descricao, preco, estoque)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            Number(id_lojista),
            Number(id_categoria),
            nome.trim(),
            descricao ?? null,
            Number(preco),
            Number(estoque)
        );

        const produto = db.prepare(
            'SELECT * FROM produto WHERE id_produto = ?'
        ).get(resultado.lastInsertRowid);

        res.status(201).json(produto);

    } catch (erro) {
        res.status(400).json({
            erro: 'Não foi possível cadastrar o produto. Confira os IDs do lojista e da categoria.'
        });
    }
});

// Atualiza os dados de um produto existente.
router.put('/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            erro: 'ID inválido.'
        });
    }

    const existente = db.prepare(
        'SELECT * FROM produto WHERE id_produto = ?'
    ).get(id);

    if (!existente) {
        return res.status(404).json({
            erro: 'Produto não encontrado.'
        });
    }

    const {
        id_lojista,
        id_categoria,
        nome,
        descricao,
        preco,
        estoque
    } = req.body;

    // A atualização exige os mesmos campos válidos do cadastro.
    if (
        !Number.isInteger(Number(id_lojista)) ||
        Number(id_lojista) <= 0 ||
        !Number.isInteger(Number(id_categoria)) ||
        Number(id_categoria) <= 0 ||
        typeof nome !== 'string' ||
        !nome.trim() ||
        !Number.isFinite(Number(preco)) ||
        Number(preco) < 0 ||
        estoque === undefined ||
        !Number.isInteger(Number(estoque)) ||
        Number(estoque) < 0
    ) {
        return res.status(400).json({
            erro: 'Informe lojista, categoria, nome, preço e estoque válidos.'
        });
    }

    try {
        db.prepare(`
            UPDATE produto
            SET id_lojista = ?,
                id_categoria = ?,
                nome = ?,
                descricao = ?,
                preco = ?,
                estoque = ?
            WHERE id_produto = ?
        `).run(
            Number(id_lojista),
            Number(id_categoria),
            nome.trim(),
            descricao ?? null,
            Number(preco),
            Number(estoque),
            id
        );

        const produtoAtualizado = db.prepare(
            'SELECT * FROM produto WHERE id_produto = ?'
        ).get(id);

        res.json(produtoAtualizado);

    } catch (erro) {
        res.status(400).json({
            erro: 'Não foi possível atualizar. Confira os dados e os IDs informados.'
        });
    }
});

// Exclui um produto usando seu ID.
router.delete('/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            erro: 'ID inválido.'
        });
    }

    const resultado = db.prepare(
        'DELETE FROM produto WHERE id_produto = ?'
    ).run(id);

    if (resultado.changes === 0) {
        return res.status(404).json({
            erro: 'Produto não encontrado.'
        });
    }

    res.json({
        mensagem: 'Produto excluído com sucesso.'
    });
});

module.exports = router;
