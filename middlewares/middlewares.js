function notFound(req, res) {
    res.status(404).json({
        erro: 'Rota não encontrada.'
    });
}

function errorHandler(error, req, res, next) {
    if (res.headersSent) {
        return next(error);
    }

    const status = Number.isInteger(error.status) &&
        error.status >= 400 &&
        error.status <= 599
        ? error.status
        : 500;

    if (status >= 500) {
        console.error(error);
    }

    res.status(status).json({
        erro: status >= 500
            ? 'Erro interno do servidor.'
            : error.message
    });
}

module.exports = {
    notFound,
    errorHandler
};