const db = require('../database');

function listarEnquetes(req, res) {
    db.query('SELECT id, titulo, inicio, fim FROM enquetes ORDER BY inicio DESC', function(err, enquetes) {
        if (err) {
            console.log(err);
            res.status(500).send('Erro ao carregar enquetes');
            return;
        }

        const agora = new Date();
        const enquetesComStatus = [];

        for (let i = 0; i < enquetes.length; i++) {
            const enquete = enquetes[i];
            const inicio = new Date(enquete.inicio);
            const fim = new Date(enquete.fim);
            let status;

            if (agora < inicio) {
                status = 'não iniciada';
            } else if (agora > fim) {
                status = 'finalizada';
            } else {
                status = 'em andamento';
            }

            enquetesComStatus.push({
                id: enquete.id,
                titulo: enquete.titulo,
                inicio: enquete.inicio,
                fim: enquete.fim,
                status: status
            });
        }

        res.render('lista', { enquetes: enquetesComStatus });
    });
}

module.exports = {
    listarEnquetes
};