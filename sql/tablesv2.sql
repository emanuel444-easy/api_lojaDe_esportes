
-- Cadastro de lojistas responsáveis pelos produtos.
CREATE TABLE IF NOT EXISTS "lojista" (
	"id_lojista"	INTEGER,
	"nome"	TEXT NOT NULL,
	"email"	TEXT NOT NULL UNIQUE,
	"senha"	TEXT NOT NULL,
	PRIMARY KEY("id_lojista" AUTOINCREMENT)
);

-- Dados dos clientes e seus endereços.
CREATE TABLE  IF NOT EXISTS "cliente" (
    "id_cliente" INTEGER,
	"nome" TEXT NOT NULL,
	"email"	TEXT NOT NULL,
	"senha"	TEXT NOT NULL,
	"telefone" varchar(30),
    "endereco" 	TEXT not null,
	PRIMARY KEY ("id_cliente" AUTOINCREMENT)
	);
	
-- Categorias usadas para organizar os produtos.
	CREATE TABLE IF NOT EXISTS "categoria" (
	"id_categoria"	INTEGER,
	"nome"	TEXT NOT NULL,
	"descricao"	TEXT,
	PRIMARY KEY("id_categoria" AUTOINCREMENT)
);

-- Produtos vinculados a um lojista e a uma categoria.
CREATE TABLE IF NOT EXISTS "produto" (
	"id_produto"	INTEGER,
	"id_lojista"	INTEGER NOT NULL,	
	"id_categoria"	INTEGER NOT NULL,
	"nome"	TEXT NOT NULL,
	"descricao"	TEXT,
	"preco"	REAL NOT NULL,
	"estoque"	INTEGER NOT NULL,
	PRIMARY KEY("id_produto" AUTOINCREMENT),
	FOREIGN KEY("id_categoria") REFERENCES "categoria"("id_categoria"),
	FOREIGN KEY("id_lojista") REFERENCES "lojista"("id_lojista")
);

-- Um carrinho por cliente e os respectivos produtos e quantidades.
CREATE TABLE IF NOT EXISTS "carrinho" (
    "id_carrinho" INTEGER,
	"id_cliente" INTEGER NOT NULL UNIQUE,
	PRIMARY KEY ("id_carrinho" AUTOINCREMENT),
	FOREIGN KEY("id_cliente") REFERENCES "cliente"("id_cliente")
);
	
CREATE TABLE IF NOT EXISTS "item_carrinho" (
   "id_itemc" INTEGER,
   "id_carrinho" INTEGER NOT NULL,
   "id_produto" INTEGER NOT NULL,
   "quantidade" INTEGER,
   PRIMARY KEY ("id_itemc" AUTOINCREMENT),
   FOREIGN KEY ("id_carrinho") REFERENCES "carrinho" ("id_carrinho"),
   FOREIGN key ("id_produto") REFERENCES "produto" ("id_produto")
   );
   
-- Pedidos e vendas registram etapas diferentes da compra.
CREATE TABLE IF NOT EXISTS "pedido" (
    "id_pedido" INTEGER,
	"id_cliente" INTEGER not null,
	"data_pedido" datetime,
	"status" varchar(40),
	"rastreamento" varchar(120),
	PRIMARY KEY ("id_pedido" AUTOINCREMENT),
	FOREIGN KEY ("id_cliente") REFERENCES "cliente" (id_cliente)
	);
	
CREATE TABLE IF NOT EXISTS venda (
    id_venda INTEGER PRIMARY KEY AUTOINCREMENT,
    id_cliente INTEGER NOT NULL,
    data_venda DATETIME,
    valor_total DECIMAL(10,2),
    status VARCHAR(40),

    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
);

-- Itens vendidos preservam o preço unitário registrado na venda.
CREATE TABLE IF NOT EXISTS "item_venda" (
    "id_item" INTEGER PRIMARY KEY AUTOINCREMENT,
    "id_venda" INTEGER NOT NULL,
    "id_produto" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "preco_unitario" DECIMAL(10,2),

    FOREIGN KEY ("id_venda") REFERENCES "venda" ("id_venda"),
    FOREIGN KEY ("id_produto") REFERENCES "produto" ("id_produto")
);

-- Pagamentos pertencem a uma venda e aceitam formas definidas no CHECK.
CREATE TABLE IF NOT EXISTS pagamento (
    id_pagamento INTEGER PRIMARY KEY AUTOINCREMENT,
    id_venda INTEGER NOT NULL,
    forma_pagamento VARCHAR(40) NOT NULL
        CHECK (forma_pagamento IN ('PIX', 'Cartão', 'Boleto')),
    valor DECIMAL(10,2),
    status VARCHAR(40),
    FOREIGN KEY ("id_venda") REFERENCES venda("id_venda")
);

-- Avaliações relacionam clientes e produtos, com nota de 1 a 5.
CREATE TABLE IF NOT EXISTS avaliacao (
    id_avaliacao INTEGER PRIMARY KEY AUTOINCREMENT,
    id_cliente INTEGER NOT NULL,
    id_produto INTEGER NOT NULL,
    nota INTEGER
	CHECK (nota in ('1','2','3','4','5')),
    comentario TEXT,
    data_avaliacao DATETIME,

    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente),
    FOREIGN KEY (id_produto) REFERENCES produto(id_produto)
);
	
