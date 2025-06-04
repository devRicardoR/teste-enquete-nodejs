const db = require('../database');

function formNovaEnquete(req, res) {
    res.render('nova');
}

function criarEnquete(req, res) {
    const titulo = req.body.titulo;
    const inicio = req.body.inicio;
    const fim = req.body.fim;
    let opcoes = req.body.opcoes;

    if (!Array.isArray(opcoes)) {
        opcoes = [opcoes];
    }

    if (!titulo || !inicio || !fim || !opcoes || opcoes.length < 3 || opcoes.length > 10) {
        res.status(400).send('Preencha todos os campos e inclua entre 3 e 10 opções');
        return;
    }

    const dataInicio = new Date(inicio);
    const dataFim = new Date(fim);

    if (dataInicio.getTime() >= dataFim.getTime()) {
        res.status(400).send('A data de término deve ser posterior à data de início');
        return;
    }

    db.query('INSERT INTO enquetes (titulo, inicio, fim) VALUES (?, ?, ?)',
        [titulo, inicio, fim],
        function(err, result) {
            if (err) {
                console.log(err);
                res.status(500).send('Erro ao criar enquete');
                return;
            }

            const valores = [];
            for (let i = 0; i < opcoes.length; i++) {
                const texto = opcoes[i];
                if (texto && texto.trim() !== '') {
                    valores.push([result.insertId, texto.trim()]);
                }
            }

            if (valores.length === 0) {
                res.status(400).send('Nenhuma opção válida para inserir');
                return;
            }

            let placeholders = valores.map(() => '(?, ?)').join(', ');
            let flatValues = valores.flat();

            db.query('INSERT INTO opcoes (enquete_id, texto) VALUES ' + placeholders, flatValues, function(err) {
                if (err) {
                    console.log(err);
                    res.status(500).send('Erro ao salvar opções');
                    return;
                }
                res.redirect('/');
            });
        }
    );
}

module.exports = {
    formNovaEnquete,
    criarEnquete
};