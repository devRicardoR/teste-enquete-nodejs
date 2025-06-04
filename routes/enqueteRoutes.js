const express = require('express');
const router = express.Router();

const listar = require('../controllers/listar');
const nova = require('../controllers/nova');
const criar = require('../controllers/criar');
const votar = require('../controllers/votar');
const editar = require('../controllers/editar');
const deletar = require('../controllers/deletar');

router.get('/', listar.listarEnquetes);
router.get('/nova', nova.formNovaEnquete);
router.post('/criar', criar.criarEnquete);
router.get('/votar/:id', votar.formVotar);
router.post('/votar/:id', votar.votar);
router.get('/enquetes/:id/editar', editar.formEditarEnquete);
router.post('/enquetes/:id/atualizar', editar.atualizarEnquete);
router.post('/enquetes/:id/deletar', deletar.deletarEnquete);

module.exports = router;