/** =====================================================================
 *  CORRECTIVES ROUTER
=========================================================================*/
const { Router } = require('express');
const { check } = require('express-validator');

// MIDDLEWARES
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

// CONTROLLER
const { getCorrectives, createCorrectives, updateCorrectives, deleteCorrectives, getCorrectiveId, getCorrectiveStaff, postNotesCorrectives, getCorrectiveProduct, pdfCorrective, getCorrectivesQuery, deleteNoteCorrective, addItemsCorrective, delItemCorrective } = require('../controllers/correctives.controller');

const router = Router();

/** =====================================================================
 *  GET CORRECTIVES
=========================================================================*/
router.get('/', validarJWT, getCorrectives);

/** =====================================================================
 *  GET CORRECTIVE FOR ID
=========================================================================*/
router.get('/:id', validarJWT, getCorrectiveId);

/** =====================================================================
 *  GET CORRECTIVE FOR STAFF
=========================================================================*/
router.get('/staff/:staff', validarJWT, getCorrectiveStaff);

/** =====================================================================
 *  GET CORRECTIVE FOR PRODUCT
=========================================================================*/
router.get('/product/:product', validarJWT, getCorrectiveProduct);

/** =====================================================================
 *  GET CORRECTIVE FOR PRODUCT
=========================================================================*/
router.get('/pdf/:id', pdfCorrective);

/** =====================================================================
 *  CREATE CORRECTIVE
=========================================================================*/
router.post('/', [
        validarJWT,
        check('staff', 'El tecnico es olbigatorio').isMongoId(),
        check('client', 'El cliente es olbigatorio').isMongoId(),
        check('description', 'La descripcion del correctivo es obligatoria').not().isEmpty(),
        validarCampos
    ],
    createCorrectives
);

/** =====================================================================
 *  GET CORRECTIVES QUERY POST
=========================================================================*/
router.post('/query', validarJWT, getCorrectivesQuery);

/** =====================================================================
 *  POST NOTES IN PREVENTIVE
=========================================================================*/
router.post('/notes/:id', [
        validarJWT,
        check('note', 'El comentario es olbigatorio').not().isEmpty(),
        validarCampos
    ],
    postNotesCorrectives
);

/** =====================================================================
 *  UPDATE CORRECTIVES
=========================================================================*/
router.put('/:id', [
        validarJWT,
        validarCampos
    ],
    updateCorrectives
);

/** =====================================================================
 *  UPDATE ITEMS CORRECTIVE
=========================================================================*/
router.put('/items/:id', [
        validarJWT,
        validarCampos
    ],
    addItemsCorrective
);

/** =====================================================================
 *  DELETE CORRECTIVES
=========================================================================*/
router.delete('/:id', validarJWT, deleteCorrectives);

/** =====================================================================
 *  DELETE NOTES CORRECTIVES
=========================================================================*/
router.delete('/delete/note/:coid/:note', validarJWT, deleteNoteCorrective);

/** =====================================================================
 *  DELETE ITEMS CORRECTIVES
=========================================================================*/
router.put('/delete/item/:coid/', validarJWT, delItemCorrective);

// EXPORTS
module.exports = router;