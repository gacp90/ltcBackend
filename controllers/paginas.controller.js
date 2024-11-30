const { response } = require('express');

const path = require('path');
const fs = require('fs');

const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');

const Pagina = require('../models/paginas.model');

/** =====================================================================
 *  GET QUERY
=========================================================================*/
const getQueryPagina = async(req, res = response) => {

    try {

        const { desde, hasta, sort, ...query } = req.body;

        const [paginas, total] = await Promise.all([

            Pagina.find(query)
            .limit(hasta)
            .skip(desde)
            .sort(sort)
            .populate('product')
            .populate('staff'),
            Pagina.countDocuments({ status: true })
        ])

        res.json({
            ok: true,
            paginas,
            total
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error inesperado, porfavor intente nuevamente'
        });
    }


}


/** =====================================================================
 *  CREATE
=========================================================================*/
const createPagina = async(req, res = response) => {

    try {

        const uid = req.uid;
        let { total, copia, scaner } = req.body;
        const product = req.params.product;

        total = Number(total);
        copia = Number(copia);
        scaner = Number(scaner);

        // VALIDATE IMAGE
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({
                ok: false,
                msg: 'No has seleccionado ningún archivo'
            });
        }

        // PROCESS IMAGE
        const file = await sharp(req.files.image.data).metadata();

        // const nameShort = file.format.split('.');
        const extFile = file.format;

        // VALID EXT
        const validExt = ['jpg', 'png', 'jpeg', 'webp', 'bmp', 'svg'];
        if (!validExt.includes(extFile)) {
            return res.status(400).json({
                ok: false,
                msg: 'No se permite este tipo de imagen, solo extenciones JPG - PNG - WEBP - SVG'
            });
        }
        // VALID EXT

        // GENERATE NAME UID
        const nameFile = `${ uuidv4() }.webp`;

        // PATH IMAGE
        const path = `./uploads/paginas/${ nameFile }`;

        // Procesar la imagen con sharp (por ejemplo, redimensionar)
        await sharp(req.files.image.data)
            .webp({ equality: 75, effort: 6 })
            .resize(300, 300)
            .toFile(path, async(err, info) => {

                let qty = 0;
                let qtys = 0;
                let qtyc = 0;
                const oldPagina = await Pagina.findOne({ product })
                    .sort({ fecha: -1 })
                if (oldPagina) {

                    if (oldPagina.total > total) {

                        if (fs.existsSync(__dirname + path)) {
                            // DELET IMAGE OLD
                            fs.unlinkSync(__dirname + path);
                        }

                        return res.status(400).json({
                            ok: false,
                            msg: `Error, el ultimo registro de paginas impresas fue de ${oldPagina.total}, y estas registrando una cantidad menor de paginas impresas ${total}`
                        });
                    }

                    qty = total - (oldPagina.total || 0);
                    qtys = scaner - (oldPagina.scaner || 0);
                    qtyc = copia - (oldPagina.copia || 0);
                }

                const pagina = new Pagina({
                    total: Number(total),
                    scaner: Number(scaner),
                    copia: Number(copia),
                    qty: Number(qty),
                    qtys: Number(qtys),
                    qtyc: Number(qtyc),
                    img: nameFile,
                    product: product,
                    staff: uid
                });

                await pagina.save();

                const paginaDB = await Pagina.findById(pagina._id)
                    .populate('staff')
                    .populate('product')

                res.json({
                    ok: true,
                    pagina: paginaDB
                });

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
 *  UPDATE
=========================================================================*/
const updatePagina = async(req, res = response) => {

    const paid = req.params.id;

    try {

        // SEARCH
        const paginaDB = await Pagina.findById(paid);
        if (!paginaDB) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe ningun log de paginas con este ID'
            });
        }
        // SEARCH

        // VALIDATE
        let {...campos } = req.body;

        campos.qty = 0;
        campos.qtys = 0;
        campos.qtyc = 0;

        const oldPaginas = await Pagina.find({ product: paginaDB.product })
            .sort({ fecha: -1 })
            .limit(2)

        if (oldPaginas.length > 2) {            
            const oldPagina = oldPaginas[1];
    
            if (oldPagina) {
                if (oldPagina.total > campos.total) {
                    return res.status(400).json({
                        ok: false,
                        msg: `Error, el ultimo registro de paginas impresas fue de ${oldPagina.total}, y estas registrando una cantidad menor de paginas impresas ${total}`
                    });
                }
                campos.qty = total - (oldPagina.total || 0);
                campos.qtys = scaner - (oldPagina.scaner || 0);
                campos.qtyc = copia - (oldPagina.copia || 0);
            }
        }

        // UPDATE
        const paginaUpdate = await Pagina.findByIdAndUpdate(paid, campos, { new: true, useFindAndModify: false });

        res.json({
            ok: true,
            pagina: paginaUpdate
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error Inesperado'
        });
    }

};

// EXPORTS
module.exports = {
    getQueryPagina,
    createPagina,
    updatePagina
};