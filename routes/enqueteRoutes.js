const express = require('express');
const router = express.Router();
const enqueteController = require('../controllers/enqueteController');

router.get('/', enqueteController.listarEnquetes);
router.get('/nova', enqueteController.formNovaEnquete);
router.post('/criar', enqueteController.criarEnquete);
router.get('/votar/:id', enqueteController.formVotar);
router.post('/votar/:id', enqueteController.votar);

module.exports = router;