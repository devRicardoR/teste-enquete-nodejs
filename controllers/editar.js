const db = require('../database');

function formEditarEnquete(req, res) {
    const id = req.params.id;

    db.query('SELECT * FROM enquetes WHERE id = ?', [id], function(err, resultado) {
        if (err) {
            console.log(err);
            res.status(500).send('Erro ao carregar enquete');
            return;
        }

        if (resultado.length === 0) {
            res.status(404).send('Enquete não encontrada');
            return;
        }

        const enquete = resultado[0];

        enquete.inicio = enquete.inicio.toISOString().slice(0,16);
        enquete.fim = enquete.fim.toISOString().slice(0,16);

        res.render('editar', { enquete });
    });
}

function atualizarEnquete(req, res) {
    const id = req.params.id;
    const { titulo, inicio, fim } = req.body;

    if (!titulo || !inicio || !fim) {
        res.status(400).send('Preencha todos os campos');
        return;
    }

    db.query('UPDATE enquetes SET titulo = ?, inicio = ?, fim = ? WHERE id = ?',
        [titulo, inicio, fim, id],
        function(err, resultado) {
            if (err) {
                console.log(err);
                res.status(500).send('Erro ao atualizar enquete');
                return;
            }

            if (resultado.affectedRows === 0) {
                res.status(404).send('Enquete não encontrada');
                return;
            }

            res.send('Enquete atualizada com sucesso');
        });
}

module.exports = {
    formEditarEnquete,
    atualizarEnquete
};