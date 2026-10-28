
const express = require('express');
const path = require('path');

const app = express();
const { notFound, errorHandler } = require('./middlewares/middlewares');

// Permite que as rotas recebam dados enviados em JSON ou em formulários.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configura as pastas usadas por páginas EJS e arquivos estáticos, como CSS e imagens.
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Rota simples para confirmar que a API está no ar.
app.get('/', (req, res) => {
    res.send('API da Loja de Esportes funcionando!');
});

// Cada grupo de endpoints fica isolado em seu próprio módulo.
const produtoRoutes = require('./routes/produtoRoutes');
app.use('/produtos', produtoRoutes);

const categoriaRoutes = require('./routes/categoriaRoutes');
app.use('/categorias', categoriaRoutes);

const carrinhoRoutes = require('./carrinho/carrinho');
app.use('/carrinho', carrinhoRoutes);

const avaliacaoRoutes = require('./routes/avaliacao');
app.use('/avaliacoes', avaliacaoRoutes);

// Mantém os tratamentos de erro depois das rotas para capturar suas respostas.
app.use(notFound);
app.use(errorHandler);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
