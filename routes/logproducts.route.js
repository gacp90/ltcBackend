/** =====================================================================
 *  PRODUCTS ROUTER
=========================================================================*/
const { Router } = require('express');
const { check } = require('express-validator');

// MIDDLEWARES
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

// CONTROLLER
const { getLogProducts } = require('../controllers/logproducts.controller');

const router = Router();

/** =====================================================================
 *  GET PRODUCTS
=========================================================================*/
router.post('/query', validarJWT, getLogProducts);
/** =====================================================================
 *  GET PRODUCTS 
=========================================================================*/

// EXPORT
module.exports = router;