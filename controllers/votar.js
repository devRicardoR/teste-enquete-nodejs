const db = require('../database');

function formVotar(req, res) {
    const enqueteId = req.params.id;

    db.query('SELECT * FROM enquetes WHERE id = ?', [enqueteId], function(err, resultado) {
        if (err) {
            console.log(err);
            res.status(500).send('Erro ao buscar enquete');
            return;
        }

        if (!resultado || resultado.length === 0) {
            res.status(404).send('Enquete não encontrada');
            return;
        }

        const enquete = resultado[0];
        const agora = new Date();
        const inicio = new Date(enquete.inicio);
        const fim = new Date(enquete.fim);

        enquete.ativa = inicio.getTime() <= agora.getTime() && fim.getTime() >= agora.getTime();

        db.query('SELECT * FROM opcoes WHERE enquete_id = ?', [enqueteId], function(err, opcoes) {
            if (err) {
                console.log(err);
                res.status(500).send('Erro ao carregar opções');
                return;
            }

            res.render('votar', {
                enquete: enquete,
                opcoes: opcoes,
                inicioFormatado: inicio.toLocaleString(),
                fimFormatado: fim.toLocaleString()
            });
        });
    });
}

function votar(req, res) {
    const opcaoSelecionada = req.body.opcao;
    const idEnquete = req.params.id;
    const io = req.app.get('io');

    if (!io) {
        console.log('Socket.IO não inicializado!');
        res.status(500).send('Erro interno');
        return;
    }

    if (!opcaoSelecionada) {
        res.status(400).send('Selecione uma opção');
        return;
    }

    db.query('UPDATE opcoes SET votos = votos + 1 WHERE id = ?', [opcaoSelecionada], function(errAtualizacao) {
        if (errAtualizacao) {
            console.log('Erro ao atualizar votos:', errAtualizacao);
            res.status(500).send('Erro ao registrar voto');
            return;
        }

        db.query('SELECT id, texto, votos FROM opcoes WHERE enquete_id = ?', [idEnquete], function(errSelecao, opcoes) {
            if (errSelecao) {
                console.log('Erro ao buscar votos:', errSelecao);
                res.redirect('/');
                return;
            }

            try {
                io.emit('atualizarVotos', { enqueteId: idEnquete, opcoes });
            } catch (erroSocket) {
                console.log('Erro no Socket.IO:', erroSocket);
            }

            res.redirect('/votar/' + idEnquete);
        });
    });
}

module.exports = {
    formVotar,
    votar
};