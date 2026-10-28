const express = require('express');
const db = require('../config/database');

const router = express.Router();

function lerId(value) {
    // Padroniza a leitura de IDs e rejeita valores inválidos antes das consultas.
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}

router.get('/produto/:id_produto', (req, res) => {
    const idProduto = lerId(req.params.id_produto);

    if (!idProduto) {
        return res.status(400).json({ erro: 'ID do produto inválido.' });
    }

    const produto = db.prepare(
        'SELECT id_produto FROM produto WHERE id_produto = ?'
    ).get(idProduto);

    if (!produto) {
        return res.status(404).json({ erro: 'Produto não encontrado.' });
    }

    // Inclui o nome do cliente para apresentar avaliações com contexto.
    const avaliacoes = db.prepare(`
        SELECT
            avaliacao.id_avaliacao,
            avaliacao.id_cliente,
            cliente.nome AS nome_cliente,
            avaliacao.id_produto,
            avaliacao.nota,
            avaliacao.comentario,
            avaliacao.data_avaliacao
        FROM avaliacao
        JOIN cliente ON cliente.id_cliente = avaliacao.id_cliente
        WHERE avaliacao.id_produto = ?
        ORDER BY avaliacao.id_avaliacao DESC
    `).all(idProduto);

    // Calcula o resumo das notas separadamente da lista de avaliações.
    const resultado = db.prepare(`
        SELECT ROUND(AVG(nota), 1) AS media, COUNT(*) AS total
        FROM avaliacao
        WHERE id_produto = ?
    `).get(idProduto);

    res.json({
        id_produto: idProduto,
        media: resultado.media ?? 0,
        total: resultado.total,
        avaliacoes
    });
});

router.post('/', (req, res) => {
    const body = req.body ?? {};
    const idCliente = lerId(body.id_cliente);
    const idProduto = lerId(body.id_produto);
    const nota = Number(body.nota);
    const comentario = body.comentario ?? null;

    // Valida os campos recebidos antes de consultar o banco ou gravar a avaliação.
    if (
        !idCliente ||
        !idProduto ||
        !Number.isInteger(nota) ||
        nota < 1 ||
        nota > 5 ||
        (comentario !== null && typeof comentario !== 'string')
    ) {
        return res.status(400).json({
            erro: 'Informe IDs válidos, uma nota de 1 a 5 e um comentário textual.'
        });
    }

    const cliente = db.prepare(
        'SELECT id_cliente FROM cliente WHERE id_cliente = ?'
    ).get(idCliente);

    if (!cliente) {
        return res.status(404).json({ erro: 'Cliente não encontrado.' });
    }

    const produto = db.prepare(
        'SELECT id_produto FROM produto WHERE id_produto = ?'
    ).get(idProduto);

    if (!produto) {
        return res.status(404).json({ erro: 'Produto não encontrado.' });
    }

    const resultado = db.prepare(`
        INSERT INTO avaliacao (id_cliente, id_produto, nota, comentario, data_avaliacao)
        VALUES (?, ?, ?, ?, datetime('now'))
    `).run(idCliente, idProduto, nota, comentario?.trim() || null);

    // Busca o registro recém-criado para devolver a avaliação completa na resposta.
    const avaliacao = db.prepare(
        'SELECT * FROM avaliacao WHERE id_avaliacao = ?'
    ).get(resultado.lastInsertRowid);

    res.status(201).json(avaliacao);
});

router.put('/:id_avaliacao', (req, res) => {
    const idAvaliacao = lerId(req.params.id_avaliacao);
    const body = req.body ?? {};
    const nota = Number(body.nota);
    const comentario = body.comentario ?? null;

    // Atualizações também precisam respeitar a escala de notas e o tipo do comentário.
    if (
        !idAvaliacao ||
        !Number.isInteger(nota) ||
        nota < 1 ||
        nota > 5 ||
        (comentario !== null && typeof comentario !== 'string')
    ) {
        return res.status(400).json({
            erro: 'Informe uma nota de 1 a 5 e um comentário textual.'
        });
    }

    const resultado = db.prepare(`
        UPDATE avaliacao
        SET nota = ?, comentario = ?
        WHERE id_avaliacao = ?
    `).run(nota, comentario?.trim() || null, idAvaliacao);

    if (resultado.changes === 0) {
        return res.status(404).json({ erro: 'Avaliação não encontrada.' });
    }

    const avaliacao = db.prepare(
        'SELECT * FROM avaliacao WHERE id_avaliacao = ?'
    ).get(idAvaliacao);

    res.json(avaliacao);
});

router.delete('/:id_avaliacao', (req, res) => {
    const idAvaliacao = lerId(req.params.id_avaliacao);

    if (!idAvaliacao) {
        return res.status(400).json({ erro: 'ID da avaliação inválido.' });
    }

    // O número de linhas afetadas permite identificar se a avaliação existia.
    const resultado = db.prepare(
        'DELETE FROM avaliacao WHERE id_avaliacao = ?'
    ).run(idAvaliacao);

    if (resultado.changes === 0) {
        return res.status(404).json({ erro: 'Avaliação não encontrada.' });
    }

    res.json({ mensagem: 'Avaliação excluída com sucesso.' });
});

module.exports = router;