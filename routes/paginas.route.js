/** =====================================================================
 *  PAGINA ROUTER
=========================================================================*/
const { Router } = require('express');
const { check } = require('express-validator');

// MIDDLEWARES
const expressFileUpload = require('express-fileupload');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

// CONTROLLER
const { getQueryPagina, createPagina, updatePagina } = require('../controllers/paginas.controller');

const router = Router();

router.use(expressFileUpload());

/** =====================================================================
 *  CREATE PAGINAS
=========================================================================*/
router.post('/create/:product', validarJWT, createPagina);

/** =====================================================================
 *  GET PAGINAS QUERY
=========================================================================*/
router.post('/query', validarJWT, getQueryPagina);

/** =====================================================================
 *  GET UPDATE PAGINA
=========================================================================*/
router.put('/:id', validarJWT, updatePagina);


// EXPORT
module.exports = router;