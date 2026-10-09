-- lojista 
INSERT into lojista (nome, email, senha)
VALUES ('Emanuel Do Vale', 'emanuel@gmail.com', '1234567');

-- clientes 
INSERT into cliente (nome, email, senha, telefone, endereco)
VALUES ('Samuel Contri', 'samueldamamae@gmail.com', '12345678', '88997515974', 'Rua Falesio - 420'); 

INSERT into cliente (nome, email, senha, telefone, endereco)
VALUES ('Maria Monteiro', 'mariamont@gmail.com', 'amogatos', '88955330003', 'Rua Santos Dumont - 777');

INSERT into cliente (nome, email, senha, telefone, endereco)
VALUES ('Lucas Oliveira', 'lucasoliveira@gmail.com', 'lucas123', '88987654321', 'Rua José de Alencar - 125');

INSERT into cliente (nome, email, senha, telefone, endereco)
VALUES ('Ana Beatriz', 'anabeatriz@gmail.com', 'ana123', '88976543210', 'Rua Padre Cícero - 350');

INSERT into cliente (nome, email, senha, telefone, endereco)
VALUES ('Carlos Eduardo', 'carloseduardo@gmail.com', 'carlos123', '88965432109', 'Rua Coronel João - 580');

-- categorias
INSERT INTO categoria (nome, descricao)
VALUES
('Basquete', 'Produtos para prática de basquete'),
('Futebol', 'Produtos para prática de futebol'),
('Vestuário', 'Roupas e peças esportivas'),
('Acessórios', 'Acessórios para atividades esportivas'),
('Esportes Aquáticos', 'Produtos para surf e kite-surf');

-- produtos 
INSERT INTO produto 
(id_lojista, id_categoria, nome, descricao, preco, estoque)
VALUES
(1, 1, 'Bola de Basquete', 'Bola oficial para prática de basquete', 149.90, 20),

(1, 1, 'Bola de Altinha', 'Bola para prática de altinha e futebol', 79.90, 25),

(1, 2, 'Chuteiras', 'Chuteira para prática de futebol', 299.90, 15),

(1, 3, 'Camisas de Time', 'Camisa esportiva de times de futebol', 199.90, 30),

(1, 1, 'Tênis de Basquete', 'Tênis esportivo próprio para basquete', 449.90, 12),

(1, 4, 'Calça Térmica', 'Calça térmica para atividades esportivas', 129.90, 18),

(1, 4, 'Faixa de Cabeça', 'Faixa esportiva para proteção e conforto', 39.90, 35),

(1, 5, 'Prancha de Surf', 'Prancha para prática de surf', 899.90, 8),

(1, 5, 'Prancha de Kite-Surf', 'Prancha própria para prática de kite-surf', 1299.90, 5);


-- carrinhos 
INSERT INTO carrinho (id_cliente)
VALUES (1);

INSERT Into carrinho (id_cliente)
values (2);

INSERT INTO item_carrinho (id_carrinho, id_produto, quantidade)
VALUES (1, 8, 1);

-- pedidos 
INSERT INTO pedido (id_cliente, data_pedido, status, rastreamento)
VALUES (3, '2026-09-24', 'Processando', 'BR123456789');

-- venda 
INSERT INTO venda (id_cliente, data_venda, valor_total, status)
VALUES (3, '2026-09-24', 899.90, 'Concluída');

-- item_venda
INSERT INTO item_venda (id_venda, id_produto, quantidade, preco_unitario)
VALUES (1, 8, 1, 899.90);

-- pagamento
INSERT INTO pagamento (id_venda, forma_pagamento, valor, status)
VALUES (1, 'PIX', 899.90, 'Pago');

--avaliacao
INSERT INTO avaliacao (id_cliente, id_produto, nota, comentario, data_avaliacao)
VALUES (3, 8, 5, 'Produto muito bom e chegou em perfeito estado', '2026-09-24');

