/** =====================================================================
 *  ABONADO ROUTER 
=========================================================================*/
const { Router } = require('express');
const { check } = require('express-validator');

// MIDDLEWARES
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

// CONTROLLERS
const { getPrefixes, createPrefix, updatePrefix, getPrefixId } = require('../controllers/prefix.controller');

const router = Router();

/** =====================================================================
 *  GET PREFIX
=========================================================================*/
router.get('/', validarJWT, getPrefixes);
/** =====================================================================
 *  GET PREFIX
=========================================================================*/

/** =====================================================================
 *  GET PREFIX ID
=========================================================================*/
router.get('/:id', validarJWT, getPrefixId);
/** =====================================================================
 *  GET PREFIX ID
=========================================================================*/

/** =====================================================================
 *  POST CREATE PREFIX
=========================================================================*/
router.post('/', [
        validarJWT,
        check('name', 'El nombre es olbigatorio').not().isEmpty(),
        validarCampos
    ],
    createPrefix
);
/** =====================================================================
 *  POST CREATE PREFIX
=========================================================================*/

/** =====================================================================
 *  PUT PREFIX
=========================================================================*/
router.put('/:id', [
        validarJWT,
        check('name', 'El nombre es olbigatorio').not().isEmpty(),
        validarCampos
    ],
    updatePrefix
);
/** =====================================================================
 *  PUT PREFIX
=========================================================================*/



// EXPORT
module.exports = router;