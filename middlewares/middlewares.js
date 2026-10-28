function notFound(req, res) {
    // Responde quando nenhuma das rotas registradas reconhece o endereço solicitado.
    res.status(404).json({
        erro: 'Rota não encontrada.'
    });
}

function errorHandler(error, req, res, next) {
    // Delega erros se a resposta já começou, evitando tentar enviar uma segunda resposta.
    if (res.headersSent) {
        return next(error);
    }

    // Registra o erro no servidor e evita expor detalhes internos ao cliente da API.
    console.error(error);

    res.status(500).json({
        erro: 'Erro interno do servidor.'
    });
}

module.exports = {
    notFound,
    errorHandler
};