const express = require("express");
const db = require("../config/database");
const router = express.Router();

function lerId(value) {
  // Aceita somente IDs inteiros positivos antes de consultar o banco.
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function buscarCarrinho(idCliente) {
  // Um cliente sem carrinho recebe uma lista vazia e total igual a zero.
  const carrinho = db
    .prepare("SELECT id_carrinho FROM carrinho WHERE id_cliente = ?")
    .get(idCliente);

  // O subtotal de cada item é calculado com o preço atual do produto.
  const itens = carrinho
    ? db
        .prepare(
          `
            SELECT
                produto.id_produto,
                produto.nome,
                produto.preco,
                item_carrinho.quantidade,
                produto.preco * item_carrinho.quantidade AS subtotal
            FROM item_carrinho
            JOIN produto ON produto.id_produto = item_carrinho.id_produto
            WHERE item_carrinho.id_carrinho = ?
        `,
        )
        .all(carrinho.id_carrinho)
    : [];

  return {
    id_cliente: idCliente,
    id_carrinho: carrinho?.id_carrinho ?? null,
    itens,
    total: itens.reduce((soma, item) => soma + item.subtotal, 0),
  };
}

// Retorna o registro do cliente, ou undefined quando ele não existe.
function clienteExiste(idCliente) {
  return db
    .prepare("SELECT 1 FROM cliente WHERE id_cliente = ?")
    .get(idCliente);
}

router.get("/:id_cliente", (req, res) => {
  const idCliente = lerId(req.params.id_cliente);

  if (!idCliente) {
    return res.status(400).json({ erro: "ID do cliente inválido." });
  }

  if (!clienteExiste(idCliente)) {
    return res.status(404).json({ erro: "Cliente não encontrado." });
  }

  // Monta a resposta a partir do carrinho e de seus itens cadastrados.
  res.json(buscarCarrinho(idCliente));
});

router.post("/:id_cliente", (req, res) => {
  const idCliente = lerId(req.params.id_cliente);
  const body = req.body ?? {};
  const idProduto = lerId(body.id_produto);
  const quantidade =
    body.quantidade === undefined ? 1 : Number(body.quantidade);

  if (
    !idCliente ||
    !idProduto ||
    !Number.isInteger(quantidade) ||
    quantidade <= 0
  ) {
    return res.status(400).json({
      erro: "Informe IDs válidos de cliente e produto e uma quantidade positiva.",
    });
  }

  if (!clienteExiste(idCliente)) {
    return res.status(404).json({ erro: "Cliente não encontrado." });
  }

  const produto = db
    .prepare("SELECT estoque FROM produto WHERE id_produto = ?")
    .get(idProduto);

  if (!produto) {
    return res.status(404).json({ erro: "Produto não encontrado." });
  }

  if (quantidade > produto.estoque) {
    return res.status(400).json({
      erro: "A quantidade solicitada excede o estoque disponível.",
    });
  }

  // Agrupa a criação do carrinho e a inclusão/atualização do item numa transação.
  const adicionarProduto = db.transaction(() => {
    let carrinho = db
      .prepare("SELECT id_carrinho FROM carrinho WHERE id_cliente = ?")
      .get(idCliente);

    if (!carrinho) {
      const resultado = db
        .prepare("INSERT INTO carrinho (id_cliente) VALUES (?)")
        .run(idCliente);
      carrinho = { id_carrinho: resultado.lastInsertRowid };
    }

    const item = db
      .prepare(
        `
            SELECT id_itemc, quantidade FROM item_carrinho
            WHERE id_carrinho = ? AND id_produto = ?
        `,
      )
      .get(carrinho.id_carrinho, idProduto);
    const novaQuantidade = (item?.quantidade ?? 0) + quantidade;

    // Considera também a quantidade que já estava no carrinho ao conferir o estoque.
    if (novaQuantidade > produto.estoque) {
      return false;
    }

    if (item) {
      db.prepare(
        "UPDATE item_carrinho SET quantidade = ? WHERE id_itemc = ?",
      ).run(novaQuantidade, item.id_itemc);
    } else {
      db.prepare(
        `
                INSERT INTO item_carrinho (id_carrinho, id_produto, quantidade)
                VALUES (?, ?, ?)
            `,
      ).run(carrinho.id_carrinho, idProduto, quantidade);
    }

    return true;
  });

  if (!adicionarProduto()) {
    return res.status(400).json({
      erro: "A quantidade solicitada excede o estoque disponível.",
    });
  }

  res.json(buscarCarrinho(idCliente));
});

router.put("/:id_cliente/:id_produto", (req, res) => {
  const idCliente = lerId(req.params.id_cliente);
  const idProduto = lerId(req.params.id_produto);
  const quantidade = Number((req.body ?? {}).quantidade);

  if (
    !idCliente ||
    !idProduto ||
    !Number.isInteger(quantidade) ||
    quantidade <= 0
  ) {
    return res.status(400).json({
      erro: "Informe IDs válidos e uma quantidade positiva.",
    });
  }

  if (!clienteExiste(idCliente)) {
    return res.status(404).json({ erro: "Cliente não encontrado." });
  }

  const carrinho = db
    .prepare("SELECT id_carrinho FROM carrinho WHERE id_cliente = ?")
    .get(idCliente);
  const item =
    carrinho &&
    db
      .prepare(
        `
        SELECT id_itemc FROM item_carrinho
        WHERE id_carrinho = ? AND id_produto = ?
    `,
      )
      .get(carrinho.id_carrinho, idProduto);
  const produto = db
    .prepare("SELECT estoque FROM produto WHERE id_produto = ?")
    .get(idProduto);

  if (!item || !produto) {
    return res
      .status(404)
      .json({ erro: "Produto não encontrado no carrinho." });
  }

  if (quantidade > produto.estoque) {
    return res.status(400).json({
      erro: "A quantidade solicitada excede o estoque disponível.",
    });
  }

  // A substituição da quantidade só ocorre se o produto já estiver no carrinho.
  db.prepare("UPDATE item_carrinho SET quantidade = ? WHERE id_itemc = ?").run(
    quantidade,
    item.id_itemc,
  );

  res.json(buscarCarrinho(idCliente));
});

router.post("/:id_cliente/cupom", (req, res) => {
  try {
    const idCliente = lerId(req.params.id_cliente);
    const { codigo } = req.body;

    if (!idCliente) {
      return res.status(400).json({
        erro: "ID do cliente inválido.",
      });
    }

    if (!codigo) {
      return res.status(400).json({
        mensagem: "Informe o código do cupom.",
      });
    }

    const carrinhoCliente = db
      .prepare("SELECT id_carrinho FROM carrinho WHERE id_cliente = ?")
      .get(idCliente);

    if (!carrinhoCliente) {
      return res.status(404).json({
        mensagem: "Carrinho não encontrado.",
      });
    }

    const cupom = db
      .prepare(`
        SELECT * FROM cupom_desconto
        WHERE codigo = ?
      `)
      .get(codigo);

    if (!cupom) {
      return res.status(404).json({
        mensagem: "Cupom inválido.",
      });
    }

    const hoje = new Date().toISOString().split("T")[0];

    if (cupom.validade < hoje) {
      return res.status(400).json({
        mensagem: "Este cupom está vencido.",
      });
    }

    const carrinho = db
      .prepare(`
        SELECT
          SUM(p.preco * ic.quantidade) AS subtotal
        FROM item_carrinho ic
        JOIN produto p ON p.id_produto = ic.id_produto
        WHERE ic.id_carrinho = ?
      `)
      .get(carrinhoCliente.id_carrinho);

    if (!carrinho || carrinho.subtotal === null) {
      return res.status(404).json({
        mensagem: "Carrinho vazio.",
      });
    }

    const valorDesconto = carrinho.subtotal * (cupom.desconto / 100);
    const total = carrinho.subtotal - valorDesconto;

    res.status(200).json({
      mensagem: "Cupom aplicado com sucesso!",
      cupom: cupom.codigo,
      subtotal: carrinho.subtotal,
      desconto_percentual: cupom.desconto,
      valor_desconto: Number(valorDesconto.toFixed(2)),
      total: Number(total.toFixed(2)),
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao aplicar o cupom.",
    });
  }
});

router.delete("/:id_cliente/:id_produto", (req, res) => {
  const idCliente = lerId(req.params.id_cliente);
  const idProduto = lerId(req.params.id_produto);

  if (!idCliente || !idProduto) {
    return res.status(400).json({ erro: "IDs inválidos." });
  }

  if (!clienteExiste(idCliente)) {
    return res.status(404).json({ erro: "Cliente não encontrado." });
  }

 
  // A exclusão é limitada ao carrinho do cliente para não remover itens de terceiros.
  const carrinho = db
    .prepare("SELECT id_carrinho FROM carrinho WHERE id_cliente = ?")
    .get(idCliente);
  const resultado =
    carrinho &&
    db
      .prepare(
        `
        DELETE FROM item_carrinho
        WHERE id_carrinho = ? AND id_produto = ?
    `,
      )
      .run(carrinho.id_carrinho, idProduto);

  if (!resultado || resultado.changes === 0) {
    return res
      .status(404)
      .json({ erro: "Produto não encontrado no carrinho." });
  }

  res.json(buscarCarrinho(idCliente));
});

module.exports = router;
