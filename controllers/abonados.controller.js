const { response } = require('express');
const bcrypt = require('bcryptjs');

const Abonado = require('../models/abonado.model');

/** ======================================================================
 *  GET ABONADOS
=========================================================================*/
const getAbonados = async(req, res) => {

    try {

        const [abonados, total] = await Promise.all([
            Abonado.find({}, 'usuario name valid status fecha'),
            Abonado.countDocuments()
        ]);

        res.json({
            ok: true,
            abonados,
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
 *  GET ABONADOS
=========================================================================*/

/** =====================================================================
 *  GET ABONADOS ID
=========================================================================*/
const getAbonadoId = async(req, res = response) => {

    try {
        const id = req.params.id;

        const abonadoDB = await Abonado.findById(id)
            .populate('clients.client', 'name cid phone address city status');
        if (!abonadoDB) {
            return res.status(400).json({
                ok: false,
                msg: 'No hemos encontrado este Abonado, porfavor intente nuevamente.'
            });
        }

        res.json({
            ok: true,
            abonado: abonadoDB
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
 *  GET ABONADOS ID
=========================================================================*/

/** =====================================================================
 *  CREATE ABONADOS
=========================================================================*/
const createAbonado = async(req, res = response) => {

    const { usuario, password } = req.body;

    try {

        const validarAbonado = await Abonado.findOne({ usuario });

        if (validarAbonado) {
            return res.status(400).json({
                ok: false,
                msg: 'Ya existen alguien con este nombre de usuario'
            });
        }

        const abonado = new Abonado(req.body);

        // ENCRYPTAR PASSWORD
        const salt = bcrypt.genSaltSync();
        abonado.password = bcrypt.hashSync(password, salt);

        // SAVE USER
        await abonado.save();

        res.json({
            ok: true,
            abonado
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
 *  CREATE ABONADO
=========================================================================*/

/** =====================================================================
 *  ADD CLIENT
=========================================================================*/
const addClient = async(req, res = response) => {

    try {

        const client = req.params.client;
        const aid = req.params.id;

        const abonadoDB = await Abonado.findById(aid);
        if (!abonadoDB) {
            return res.status(400).json({
                ok: false,
                msg: 'No hemos encontrado este abonado, porfavor intente nuevamente.'
            });
        }

        abonadoDB.clients.push({ client });

        const abonadoUpdate = await Abonado.findByIdAndUpdate(aid, { clients: abonadoDB.clients }, { new: true, useFindAndModify: false })
            .populate('clients.client', 'name cid phone address city status');

        res.json({
            ok: true,
            abonado: abonadoUpdate
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
 *  ADD CLIENT
=========================================================================*/

/** =====================================================================
 *  DEL CLIENT
=========================================================================*/
const delClient = async(req, res = response) => {

    try {

        const client = req.params.client;
        const aid = req.params.id;

        const abonadoUpdate = await Abonado.updateOne({ _id: aid }, { $pull: { clients: { client } } });

        // VERIFICAR SI SE ACTUALIZO
        if (abonadoUpdate.nModified === 0) {
            return res.status(400).json({
                ok: false,
                msg: 'No se pudo eliminar esta imagen, porfavor intente de nuevo'
            });
        }

        const abonado = await Abonado.findById(aid)
            .populate('clients.client', 'name cid phone address city status');

        res.json({
            ok: true,
            abonado
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
 *  DEL CLIENT
=========================================================================*/

/** =====================================================================
 *  UPDATE ABONADOS
=========================================================================*/
const updateAbonado = async(req, res = response) => {

    const aid = req.params.id;

    try {

        // SEARCH USER
        const abonadoDB = await Abonado.findById(aid);
        if (!abonadoDB) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe ningun usuario con este ID'
            });
        }
        // SEARCH USER

        // VALIDATE USER
        const { password, usuario, ...campos } = req.body;
        if (abonadoDB.usuario !== usuario) {
            const validarAbonado = await Abonado.findOne({ usuario });
            if (validarAbonado) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Ya existe un usuario con este nombre'
                });
            }
        }

        if (password) {

            // ENCRYPTAR PASSWORD
            const salt = bcrypt.genSaltSync();
            campos.password = bcrypt.hashSync(password, salt);

        }

        // UPDATE
        campos.usuario = usuario;
        const abonadoUpdate = await Abonado.findByIdAndUpdate(aid, campos, { new: true, useFindAndModify: false });

        res.json({
            ok: true,
            user: abonadoUpdate
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
 *  UPDATE ABONADOS
=========================================================================*/
/** =====================================================================
 *  DELETE ABONADOS
=========================================================================*/
const deleteAbonado = async(req, res = response) => {

    const id = req.aid;

    const aid = req.params.id;

    try {

        // SEARCH DEPARTMENT
        const abonadoDB = await User.findById({ _id: aid });
        if (!abonadoDB) {
            return res.status(400).json({
                ok: false,
                msg: 'No existe ningun usuario con este ID'
            });
        }
        // SEARCH DEPARTMENT

        // CHANGE STATUS
        if (abonadoDB.status === true) {

            if (id !== aid) {
                abonadoDB.status = false;
            }

        } else {
            abonadoDB.status = true;
        }
        // CHANGE STATUS

        const abonadoUpdate = await Abonado.findByIdAndUpdate(aid, abonadoDB, { new: true, useFindAndModify: false });

        res.json({
            ok: true,
            abonado: abonadoUpdate
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
 *  DELETE ABONADOS
=========================================================================*/


// EXPORTS
module.exports = {
    getAbonados,
    createAbonado,
    updateAbonado,
    deleteAbonado,
    getAbonadoId,
    addClient,
    delClient
};