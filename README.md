# API da Loja de Esportes

API REST desenvolvida em **Node.js**, **Express** e **SQLite** para gerenciar produtos de uma loja de materiais esportivos. O projeto faz parte de uma atividade escolar de desenvolvimento back-end.

## Tecnologias utilizadas

- Node.js
- Express
- SQLite com `better-sqlite3`
- EJS (configurado como mecanismo de templates)
- REST Client para testar as requisições HTTP
- Nodemon para reiniciar o servidor durante o desenvolvimento

## Funcionalidades

A API permite realizar as operações CRUD de produtos:

- **Listar** todos os produtos.
- **Consultar** um produto pelo ID.
- **Cadastrar** um produto.
- **Atualizar** os dados de um produto.
- **Excluir** um produto.

## Requisitos

- [Node.js](https://nodejs.org/) instalado.
- npm (incluído na instalação do Node.js).
- Banco SQLite configurado para o projeto.

## Como executar

1. Clone o repositório:

   ```bash
   git clone https://github.com/emanuel444-easy/api_lojaDe_esportes.git
   ```

2. Entre na pasta do projeto:

   ```bash
   cd api_lojaDe_esportes
   ```

3. Instale as dependências:

   ```bash
   npm install
   ```

4. Confira se o arquivo do banco SQLite está no local esperado pela configuração em `config/database.js`.

5. Inicie o servidor em modo de desenvolvimento:

   ```bash
   npm run dev
   ```

O servidor utiliza a porta **3000**. Quando estiver em execução, acesse [http://localhost:3000](http://localhost:3000). A resposta esperada é uma mensagem indicando que a API está funcionando.

## Endpoints de produtos

A URL base dos produtos é `http://localhost:3000/produtos`.

| Método HTTP | Endpoint | Descrição |
|---|---|---|
| GET | `/produtos` | Lista todos os produtos |
| GET | `/produtos/:id` | Consulta um produto pelo ID |
| POST | `/produtos` | Cadastra um produto |
| PUT | `/produtos/:id` | Atualiza um produto |
| DELETE | `/produtos/:id` | Exclui um produto |

### Exemplo de cadastro (POST)

Envie o corpo da requisição no formato JSON. Os IDs de lojista e categoria precisam existir no banco de dados.

```json
{
  "id_lojista": 1,
  "id_categoria": 1,
  "nome": "Bola de basquete",
  "descricao": "Produto para prática de basquete",
  "preco": 149.90,
  "estoque": 10
}
```

### Campos do produto

- `id_produto`: identificador do produto gerado pelo banco.
- `id_lojista`: identificador do lojista relacionado.
- `id_categoria`: identificador da categoria relacionada.
- `nome`: nome do produto.
- `descricao`: descrição do produto (opcional).
- `preco`: preço do produto.
- `estoque`: quantidade disponível.

## Testes

As rotas podem ser testadas com a extensão **REST Client** do Visual Studio Code ou outra ferramenta que envie requisições HTTP. Para cadastrar e atualizar produtos, envie um corpo JSON com os campos obrigatórios.

A API valida os IDs e os dados recebidos e pode retornar códigos HTTP como `201` para cadastro realizado, `400` para dados inválidos e `404` quando o produto não é encontrado.

## Tratamento de erros

Rotas que não existem retornam `404` com a mensagem `Rota não encontrada.`. Erros internos não tratados retornam `500` com uma mensagem genérica, enquanto o detalhe do erro é registrado no console do servidor.

## Estrutura principal

```text
api_lojaDe_esportes/
├── app.js
├── package.json
├── config/
│   └── database.js
├── routes/
│   └── produtoRoutes.js
├── public/
├── views/
└── db/
```

A estrutura acima destaca os diretórios e arquivos usados pelo projeto; os arquivos do banco devem permanecer no local definido em `config/database.js`.

## Objetivo do projeto

Praticar a construção de uma API back-end, a integração com banco de dados relacional SQLite e o uso de rotas HTTP para operações CRUD
