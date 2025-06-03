const db = require('../database');

// Função para listar enquetes
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
            } else {
                if (agora > fim) {
                    status = 'finalizada';
                } else {
                    status = 'em andamento';
                }
            }

            const enqueteComStatus = {
                id: enquete.id,
                titulo: enquete.titulo,
                inicio: enquete.inicio,
                fim: enquete.fim,
                status: status
            };

            enquetesComStatus.push(enqueteComStatus);
        }

        res.render('lista', { enquetes: enquetesComStatus });
    });
}

module.exports.listarEnquetes = listarEnquetes;

// 2. FORMULÁRIO DE CRIAÇÃO (SIMPLES)
function formNovaEnquete(req, res) {
    res.render('nova');
}

module.exports.formNovaEnquete = formNovaEnquete;

// 3. CRIAÇÃO DE ENQUETE (COM VALIDAÇÕES)
function criarEnquete(req, res) {
    const titulo = req.body.titulo;
    const inicio = req.body.inicio;
    const fim = req.body.fim;
    const opcoes = req.body.opcoes;

    const tituloVazio = titulo === undefined || titulo === null || titulo === '';
    const inicioVazio = inicio === undefined || inicio === null || inicio === '';
    const fimVazio = fim === undefined || fim === null || fim === '';
    const opcoesInvalidas = opcoes === undefined || opcoes === null || opcoes.length < 3;

    if (tituloVazio || inicioVazio || fimVazio || opcoesInvalidas) {
        res.status(400).send('Preencha todos os campos e inclua no mínimo 3 opções');
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
            let contador = 0;

            for (let i = 0; i < opcoes.length; i++) {
                const texto = opcoes[i];
                const textoEhValido = texto !== undefined && texto !== null && texto.trim() !== '';

                if (textoEhValido) {
                    if (contador < 10) {
                        valores.push([result.insertId, texto]);
                        contador = contador + 1;
                    }
                }
            }

            db.query('INSERT INTO opcoes (enquete_id, texto) VALUES ?', [valores], function(err) {
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

module.exports.criarEnquete = criarEnquete;

// 4. PÁGINA DE VOTAÇÃO (COM VERIFICAÇÃO DE STATUS)
function formVotar(req, res) {
    const enqueteId = req.params.id;

    db.query('SELECT * FROM enquetes WHERE id = ?', [enqueteId], function(err, resultado) {
        if (err) {
            console.log(err);
            res.status(500).send('Erro ao buscar enquete');
            return;
        }

        if (resultado === undefined || resultado.length === 0) {
            res.status(404).send('Enquete não encontrada');
            return;
        }

        const enquete = resultado[0];

        const agora = new Date();
        const inicio = new Date(enquete.inicio);
        const fim = new Date(enquete.fim);

        if (inicio.getTime() <= agora.getTime() && fim.getTime() >= agora.getTime()) {
            enquete.ativa = true;
        } else {
            enquete.ativa = false;
        }

        db.query('SELECT * FROM opcoes WHERE enquete_id = ?', [enqueteId], function(err, opcoes) {
            if (err) {
                console.log(err);
                res.status(500).send('Erro ao carregar opções');
                return;
            }

            const dataInicioFormatada = inicio.toLocaleString();
            const dataFimFormatada = fim.toLocaleString();

            res.render('votar', {
                enquete: enquete,
                opcoes: opcoes,
                inicioFormatado: dataInicioFormatada,
                fimFormatado: dataFimFormatada
            });
        });
    });
}

module.exports.formVotar = formVotar;

// 5. PROCESSAMENTO DE VOTOS (COM SOCKET.IO)
function votar(req, res) {
    const opcaoSelecionada = req.body.opcao;
    const idEnquete = req.params.id;

    const io = req.app.get('io');

    if (io === undefined || io === null) {
        console.log('Socket.IO não inicializado!');
        res.status(500).send('Erro interno');
        return;
    }

    if (opcaoSelecionada === undefined || opcaoSelecionada === null || opcaoSelecionada === '') {
        res.status(400).send('Selecione uma opção');
        return;
    }

    db.query('UPDATE opcoes SET votos = votos + 1 WHERE id = ?', [opcaoSelecionada], function(erroAtualizacao) {
        if (erroAtualizacao !== null && erroAtualizacao !== undefined) {
            console.log('Erro ao atualizar votos:', erroAtualizacao);
            res.status(500).send('Erro ao registrar voto');
            return;
        }

        db.query('SELECT id, texto, votos FROM opcoes WHERE enquete_id = ?', [idEnquete], function(erroSelecao, opcoes) {
            if (erroSelecao !== null && erroSelecao !== undefined) {
                console.log('Erro ao buscar votos:', erroSelecao);
                res.redirect('/');
                return;
            }

            try {
                console.log('Enviando atualização via Socket.IO para enquete', idEnquete);
                io.emit('atualizarVotos', { enqueteId: idEnquete, opcoes: opcoes });
            } catch (erroSocket) {
                console.log('Erro no Socket.IO:', erroSocket);
            }

            res.redirect('/votar/' + idEnquete);
        });
    });
}

module.exports.votar = votar;