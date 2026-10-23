
const express = require('express');
const path = require('path');

const app = express();
const { notFound, errorHandler } = require('./middlewares/middlewares');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.send('API da Loja de Esportes funcionando!');
});

const produtoRoutes = require('./routes/produtoRoutes');
app.use('/produtos', produtoRoutes);

const categoriaRoutes = require('./routes/categoriaRoutes');
app.use('/categorias', categoriaRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
