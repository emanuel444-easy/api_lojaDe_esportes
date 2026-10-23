function notFound(req, res) {
    res.status(404).json({
        erro: 'Rota não encontrada.'
    });
}

function errorHandler(error, req, res, next) {
    if (res.headersSent) {
        return next(error);
    }

    console.error(error);

    res.status(500).json({
        erro: 'Erro interno do servidor.'
    });
}

module.exports = {
    notFound,
    errorHandler
};