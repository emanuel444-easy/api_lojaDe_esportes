const express = require('express');
const db = require('../config/database');
const router = express.Router();

function lerId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}

function buscarCarrinho(idCliente) {
    const carrinho = db.prepare(
        'SELECT id_carrinho FROM carrinho WHERE id_cliente = ?'
    ).get(idCliente);

    const itens = carrinho
        ? db.prepare(`
            SELECT
                produto.id_produto,
                produto.nome,
                produto.preco,
                item_carrinho.quantidade,
                produto.preco * item_carrinho.quantidade AS subtotal
            FROM item_carrinho
            JOIN produto ON produto.id_produto = item_carrinho.id_produto
            WHERE item_carrinho.id_carrinho = ?
        `).all(carrinho.id_carrinho)
        : [];

    return {
        id_cliente: idCliente,
        id_carrinho: carrinho?.id_carrinho ?? null,
        itens,
        total: itens.reduce((soma, item) => soma + item.subtotal, 0)
    };
}

function clienteExiste(idCliente) {
    return db.prepare(
        'SELECT 1 FROM cliente WHERE id_cliente = ?'
    ).get(idCliente);
}

router.get('/:id_cliente', (req, res) => {
    const idCliente = lerId(req.params.id_cliente);

    if (!idCliente) {
        return res.status(400).json({ erro: 'ID do cliente inválido.' });
    }

    if (!clienteExiste(idCliente)) {
        return res.status(404).json({ erro: 'Cliente não encontrado.' });
    }

    res.json(buscarCarrinho(idCliente));
});

router.post('/:id_cliente', (req, res) => {
    const idCliente = lerId(req.params.id_cliente);
    const body = req.body ?? {};
    const idProduto = lerId(body.id_produto);
    const quantidade = body.quantidade === undefined
        ? 1
        : Number(body.quantidade);

    if (!idCliente || !idProduto || !Number.isInteger(quantidade) || quantidade <= 0) {
        return res.status(400).json({
            erro: 'Informe IDs válidos de cliente e produto e uma quantidade positiva.'
        });
    }

    if (!clienteExiste(idCliente)) {
        return res.status(404).json({ erro: 'Cliente não encontrado.' });
    }

    const produto = db.prepare(
        'SELECT estoque FROM produto WHERE id_produto = ?'
    ).get(idProduto);

    if (!produto) {
        return res.status(404).json({ erro: 'Produto não encontrado.' });
    }

    if (quantidade > produto.estoque) {
        return res.status(400).json({
            erro: 'A quantidade solicitada excede o estoque disponível.'
        });
    }

    const adicionarProduto = db.transaction(() => {
        let carrinho = db.prepare(
            'SELECT id_carrinho FROM carrinho WHERE id_cliente = ?'
        ).get(idCliente);

        if (!carrinho) {
            const resultado = db.prepare(
                'INSERT INTO carrinho (id_cliente) VALUES (?)'
            ).run(idCliente);
            carrinho = { id_carrinho: resultado.lastInsertRowid };
        }

        const item = db.prepare(`
            SELECT id_itemc, quantidade FROM item_carrinho
            WHERE id_carrinho = ? AND id_produto = ?
        `).get(carrinho.id_carrinho, idProduto);
        const novaQuantidade = (item?.quantidade ?? 0) + quantidade;

        if (novaQuantidade > produto.estoque) {
            return false;
        }

        if (item) {
            db.prepare(
                'UPDATE item_carrinho SET quantidade = ? WHERE id_itemc = ?'
            ).run(novaQuantidade, item.id_itemc);
        } else {
            db.prepare(`
                INSERT INTO item_carrinho (id_carrinho, id_produto, quantidade)
                VALUES (?, ?, ?)
            `).run(carrinho.id_carrinho, idProduto, quantidade);
        }

        return true;
    });

    if (!adicionarProduto()) {
        return res.status(400).json({
            erro: 'A quantidade solicitada excede o estoque disponível.'
        });
    }

    res.json(buscarCarrinho(idCliente));
});

router.put('/:id_cliente/:id_produto', (req, res) => {
    const idCliente = lerId(req.params.id_cliente);
    const idProduto = lerId(req.params.id_produto);
    const quantidade = Number((req.body ?? {}).quantidade);

    if (!idCliente || !idProduto || !Number.isInteger(quantidade) || quantidade <= 0) {
        return res.status(400).json({
            erro: 'Informe IDs válidos e uma quantidade positiva.'
        });
    }

    if (!clienteExiste(idCliente)) {
        return res.status(404).json({ erro: 'Cliente não encontrado.' });
    }

    const carrinho = db.prepare(
        'SELECT id_carrinho FROM carrinho WHERE id_cliente = ?'
    ).get(idCliente);
    const item = carrinho && db.prepare(`
        SELECT id_itemc FROM item_carrinho
        WHERE id_carrinho = ? AND id_produto = ?
    `).get(carrinho.id_carrinho, idProduto);
    const produto = db.prepare(
        'SELECT estoque FROM produto WHERE id_produto = ?'
    ).get(idProduto);

    if (!item || !produto) {
        return res.status(404).json({ erro: 'Produto não encontrado no carrinho.' });
    }

    if (quantidade > produto.estoque) {
        return res.status(400).json({
            erro: 'A quantidade solicitada excede o estoque disponível.'
        });
    }

    db.prepare(
        'UPDATE item_carrinho SET quantidade = ? WHERE id_itemc = ?'
    ).run(quantidade, item.id_itemc);

    res.json(buscarCarrinho(idCliente));
});

router.delete('/:id_cliente/:id_produto', (req, res) => {
    const idCliente = lerId(req.params.id_cliente);
    const idProduto = lerId(req.params.id_produto);

    if (!idCliente || !idProduto) {
        return res.status(400).json({ erro: 'IDs inválidos.' });
    }

    if (!clienteExiste(idCliente)) {
        return res.status(404).json({ erro: 'Cliente não encontrado.' });
    }

    const carrinho = db.prepare(
        'SELECT id_carrinho FROM carrinho WHERE id_cliente = ?'
    ).get(idCliente);
    const resultado = carrinho && db.prepare(`
        DELETE FROM item_carrinho
        WHERE id_carrinho = ? AND id_produto = ?
    `).run(carrinho.id_carrinho, idProduto);

    if (!resultado || resultado.changes === 0) {
        return res.status(404).json({ erro: 'Produto não encontrado no carrinho.' });
    }

    res.json(buscarCarrinho(idCliente));
});

module.exports = router;