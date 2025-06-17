const db = require('../database');

function deletarEnquete(req, res) {
    const id = req.params.id;

    db.query('DELETE FROM opcoes WHERE enquete_id = ?', [id], function(err) {
        if (err) {
            console.log(err);
            res.status(500).send('Erro ao deletar opções da enquete');
            return;
        }

        db.query('DELETE FROM enquetes WHERE id = ?', [id], function(err2, resultado) {
            if (err2) {
                console.log(err2);
                res.status(500).send('Erro ao deletar enquete');
                return;
            }

            if (resultado.affectedRows === 0) {
                res.status(404).send('Enquete não encontrada');
                return;
            }

            res.redirect('/');
        });
    });
}

module.exports = {
    deletarEnquete
};