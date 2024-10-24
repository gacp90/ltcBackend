const { response } = require('express');

const Prefix = require('../models/prefix.model');

/** ======================================================================
 *  GET PREFIXES
=========================================================================*/
const getPrefixes = async(req, res) => {

    try {

        const [prefixes, total] = await Promise.all([
            Prefix.find({}),
            Prefix.countDocuments()
        ]);

        res.json({
            ok: true,
            prefixes,
            total
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error inesperado, porfavor intente nuevamente'
        });

    }


};
/** =====================================================================
 *  GET PREFIXES
=========================================================================*/

/** =====================================================================
 *  GET PREFIX ID
=========================================================================*/
const getPrefixId = async(req, res = response) => {

    try {
        const id = req.params.id;

        const prefixDB = await Prefix.findById(id);
        if (!prefixDB) {
            return res.status(400).json({
                ok: false,
                msg: 'No hemos encontrado este Prefijo, porfavor intente nuevamente.'
            });
        }

        res.json({
            ok: true,
            prefix: prefixDB
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error inesperado, porfavor intente nuevamente'
        });
    }

};
/** =====================================================================
 *  GET PREFIX ID
=========================================================================*/

/** =====================================================================
 *  CREATE PREFIX
=========================================================================*/
const createPrefix = async(req, res = response) => {

    let name = req.body.name;
    name = name.toUpperCase();
    name = name.trim();

    try {

        const validarPrefix = await Prefix.findOne({ name });
        if (validarPrefix) {
            return res.status(400).json({
                ok: false,
                msg: 'Ya existen un prefijo con este nombre'
            });
        }

        // SAVE PREFIX
        const prefix = new Prefix({ name });
        await prefix.save();

        res.json({
            ok: true,
            prefix
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error Inesperado'
        });
    }
};
/** =====================================================================
 *  CREATE PREFIX
=========================================================================*/

/** =====================================================================
 *  UPDATE PREFIXE
=========================================================================*/
const updatePrefix = async(req, res = response) => {

    const prefid = req.params.id;

    try {

        // SEARCH USER
        const prefixDB = await Prefix.findById(prefid);
        if (!prefixDB) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe ningun usuario con este ID'
            });
        }
        // SEARCH USER

        // VALIDATE USER
        let { name, ...campos } = req.body;
        name = name.toUpperCase();
        name = name.trim();

        if (prefixDB.name !== name) {
            const validarPrefijo = await Prefix.findOne({ name });
            if (validarPrefijo) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Ya existe un prefijo con este nombre'
                });
            }

            campos.name = name;
        }

        // UPDATE
        const prefixUpdate = await Prefix.findByIdAndUpdate(prefid, campos, { new: true, useFindAndModify: false });

        res.json({
            ok: true,
            prefix: prefixUpdate
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error Inesperado'
        });
    }

};
/** =====================================================================
 *  UPDATE PREFIXE
=========================================================================*/
/** =====================================================================
//  *  DELETE PREFIX
// =========================================================================*/
// const deleteAbonado = async(req, res = response) => {

//     const id = req.aid;

//     const aid = req.params.id;

//     try {

//         // SEARCH DEPARTMENT
//         const abonadoDB = await User.findById({ _id: aid });
//         if (!abonadoDB) {
//             return res.status(400).json({
//                 ok: false,
//                 msg: 'No existe ningun usuario con este ID'
//             });
//         }
//         // SEARCH DEPARTMENT

//         // CHANGE STATUS
//         if (abonadoDB.status === true) {

//             if (id !== aid) {
//                 abonadoDB.status = false;
//             }

//         } else {
//             abonadoDB.status = true;
//         }
//         // CHANGE STATUS

//         const abonadoUpdate = await Abonado.findByIdAndUpdate(aid, abonadoDB, { new: true, useFindAndModify: false });

//         res.json({
//             ok: true,
//             abonado: abonadoUpdate
//         });

//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({
//             ok: false,
//             msg: 'Error inesperado, porfavor intente nuevamente'
//         });
//     }

// };
// /** =====================================================================
//  *  DELETE PREFIX
// =========================================================================*/


// EXPORTS
module.exports = {
    getPrefixes,
    createPrefix,
    updatePrefix,
    getPrefixId,
    // deleteAbonado,
};