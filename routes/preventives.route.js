/** =====================================================================
 *  PREVENTIVES ROUTER
=========================================================================*/
const { Router } = require('express');
const { check } = require('express-validator');

// MIDDLEWARES
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

// CONTROLLER
const { getPreventives, createPreventive, updatePreventives, deletePreventives, getPreventiveId, postNotes, getPreventiveStaff, getPreventiveProduct, pdfPreventive, deleteNotePreventive, addItemsPreventive, delItemPreventive } = require('../controllers/preventives.controller');


const router = Router();

/** =====================================================================
 *  GET PREVENTIVES
=========================================================================*/
router.get('/', validarJWT, getPreventives);
/** =====================================================================
 *  GET PREVENTIVES
=========================================================================*/

/** =====================================================================
 *  GET PREVENTIVE FOR ID
=========================================================================*/
router.get('/:id', validarJWT, getPreventiveId);
/** =====================================================================
 *  GET PREVENTIVE FOR ID
=========================================================================*/

/** =====================================================================
 *  GET PREVENTIVE FOR STAFF
=========================================================================*/
router.get('/staff/:staff', validarJWT, getPreventiveStaff);
/** =====================================================================
 *  GET PREVENTIVE FOR STAFF
=========================================================================*/

/** =====================================================================
 *  GET PREVENTIVE FOR PRODUCT
=========================================================================*/
router.get('/product/:product', validarJWT, getPreventiveProduct);
/** =====================================================================
 *  GET PREVENTIVE FOR PRODUCT
=========================================================================*/

/** =====================================================================
 *  GET CORRECTIVE FOR PRODUCT
=========================================================================*/
router.get('/pdf/:id', pdfPreventive);
/** =====================================================================
 *  GET CORRECTIVE FOR PRODUCT
=========================================================================*/

/** =====================================================================
 *  CREATE PREVENTIVE
=========================================================================*/
router.post('/', [
        validarJWT,
        check('staff', 'El tecnico es olbigatorio').isMongoId(),
        check('client', 'El cliente es olbigatorio').isMongoId(),
        validarCampos
    ],
    createPreventive
);
/** =====================================================================
 *  CREATE PREVENTIVE
=========================================================================*/

/** =====================================================================
 *  POST NOTES IN PREVENTIVE
=========================================================================*/
router.post('/notes/:id', [
        validarJWT,
        check('note', 'El comentario es olbigatorio').not().isEmpty(),
        validarCampos
    ],
    postNotes
);
/** =====================================================================
 *  POST NOTES IN PREVENTIVE
=========================================================================*/


/** =====================================================================
 *  UPDATE PREVENTIVES
=========================================================================*/
router.put('/:id', [
        validarJWT,
        validarCampos
    ],
    updatePreventives
);
/** =====================================================================
 *  UPDATE PREVENTIVES
=========================================================================*/

/** =====================================================================
 *  UPDATE ITEMS PREVENTIVES
=========================================================================*/
router.put('/items/:id', [
        validarJWT,
        validarCampos
    ],
    addItemsPreventive
);

/** =====================================================================
 *  DELETE PREVENTIVES
=========================================================================*/
router.delete('/:id', validarJWT, deletePreventives);
/** =====================================================================
 *  DELETE PREVENTIVES
=========================================================================*/

/** =====================================================================
 *  DELETE NOTES CORRECTIVES
=========================================================================*/
router.delete('/delete/note/:preid/:note', validarJWT, deleteNotePreventive);
/** =====================================================================
 *  DELETE NOTES CORRECTIVES
=========================================================================*/

/** =====================================================================
 *  DELETE ITEMS CORRECTIVES
=========================================================================*/
router.put('/delete/item/:preid/', validarJWT, delItemPreventive);

// EXPORTS
module.exports = router;