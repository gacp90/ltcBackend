const { response } = require('express');

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const sharp = require('sharp');

const Corrective = require('../models/correctives.model');

const Inventory = require('../models/inventory.model');
const LogProduct = require('../models/log.products.model');

/** =====================================================================
 *  GET ROLE
=========================================================================*/
const getRole = (role) => {

    if (role === 'ADMIN') {
        return 'Administrador';
    } else if (role === 'TECH') {
        return 'Tecnico';
    } else {
        return 'Usuario';
    }

}

/** =====================================================================
 *  GET CORRECTIVES QUERY
=========================================================================*/
const getCorrectivesQuery = async(req, res = response) => {

    try {

        const { desde, hasta, sort, ...query } = req.body;

        const [correctives, total] = await Promise.all([

            Corrective.find(query)
            .populate('create', 'name')
            .populate('staff', 'name')
            .populate('notes.staff', 'name role img')
            .populate('client', 'name cedula phone email address city')
            .populate('product', 'code serial brand model year status estado next img ubicacion')
            .limit(hasta)
            .skip(desde)
            .sort(sort),

            Corrective.countDocuments()
        ]);

        res.json({
            ok: true,
            correctives,
            total
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado, porfavor intente de nuevo'
        });

    }

};
/** =====================================================================
 *  GET CORRECTIVES
=========================================================================*/

/** =====================================================================
 *  GET CORRECTIVES
=========================================================================*/
const getCorrectives = async(req, res = response) => {

    try {

        const desde = Number(req.query.desde) || 0;
        const limite = Number(req.query.limite) || 10;

        const [correctives, total] = await Promise.all([

            Corrective.find()
            .populate('create', 'name')
            .populate('staff', 'name')
            .populate('notes.staff', 'name role img')
            .populate('client', 'name cedula phone email address city')
            .populate('product', 'code serial brand model year status estado next img ubicacion')
            .sort({ control: -1 })
            .skip(desde)
            .limit(limite),

            Corrective.countDocuments()
        ]);

        res.json({
            ok: true,
            correctives,
            total
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado, porfavor intente de nuevo'
        });

    }

};
/** =====================================================================
 *  GET CORRECTIVES
=========================================================================*/
/** =====================================================================
 *  GET CORRECTIVE FOR ID
=========================================================================*/
const getCorrectiveId = async(req, res = response) => {

    try {

        const coid = req.params.id;

        const correctiveDB = await Corrective.findById(coid)
            .populate('create', 'name role img')
            .populate('staff', 'name role img')
            .populate('notes.staff', 'name role img')
            .populate('client', 'name cedula phone email address city')
            .populate('product', 'code serial brand model year status estado next img ubicacion');

        if (!correctiveDB) {
            return res.status(400).json({
                ok: false,
                msg: 'No existe ningun mantenimiento correctivo con este ID'
            });
        }

        // TRANSFORMAR ROLE
        correctiveDB.staff.role = getRole(correctiveDB.staff.role);

        res.json({
            ok: true,
            corrective: correctiveDB
        });


    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado, porfavor intente de nuevo'
        });
    }

};

/** =====================================================================
 *  GET CORRECTIVE FOR ID
=========================================================================*/

/** =====================================================================
 *  GET CORRECTIVE FOR STAFF
=========================================================================*/
const getCorrectiveStaff = async(req, res = response) => {

    try {

        const staff = req.params.staff;
        const status = req.query.status;
        const estado = req.query.estado;

        const correctives = await Corrective.find({ staff, estado })
            .sort({ control: -1 })
            .populate('create', 'name role img')
            .populate('staff', 'name role img')
            .populate('notes.staff', 'name role img')
            .populate('client', 'name cedula phone email address city')
            .populate('product', 'code serial brand model year status estado next img ubicacion');

        res.json({
            ok: true,
            correctives,
            total: correctives.length
        });


    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado, porfavor intente de nuevo'
        });
    }

}

/** =====================================================================
 *  GET CORRECTIVE FOR STAFF
=========================================================================*/

/** =====================================================================
 *  GET CORRECTIVE FOR PRODUCT
=========================================================================*/
const getCorrectiveProduct = async(req, res = response) => {

    try {

        const product = req.params.product;
        const estado = req.query.estado;

        const correctives = await Corrective.find({ product, estado })
            .populate('create', 'name role img')
            .populate('staff', 'name role img')
            .populate('notes.staff', 'name role img')
            .populate('client', 'name cedula phone email address city')
            .populate('product', 'code serial brand model year status estado next img ubicacion')
            .limit(20)
            .sort({ control: -1 });

        res.json({
            ok: true,
            correctives,
            total: correctives.length
        });


    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado, porfavor intente de nuevo'
        });
    }

}

/** =====================================================================
 *  GET CORRECTIVE FOR PRODUCT
=========================================================================*/

/** =====================================================================
 *  CREATE CORRECTIVE
=========================================================================*/
const createCorrectives = async(req, res = response) => {

    try {

        const uid = req.uid;

        // SAVE CORRECTIVE
        const corrective = new Corrective(req.body);
        corrective.create = uid;

        // AGREGAMOS EL PRIMER COMENTARIO
        corrective.notes.push({
            note: 'Se ha creado el mantenimiento correctivo',
            staff: uid
        });

        await corrective.save();

        res.json({
            ok: true,
            corrective
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado, porfavor intente nuevamente'
        });
    }

};
/** =====================================================================
 *  CREATE CORRECTIVE
=========================================================================*/

/** =====================================================================
 *  CREATE NOTES IN CORRECTIVE
=========================================================================*/
const postNotesCorrectives = async(req, res = response) => {

    try {

        const coid = req.params.id;
        const uid = req.uid;

        // SEARCH CORRECTIVE
        const correctiveDB = await Corrective.findById(coid);
        if (!correctiveDB) {
            return res.status(400).json({
                ok: false,
                msg: 'No existe ningun Mantenimiento correctivo con este ID'
            });
        }
        // SEARCH CORRECTIVE

        const nota = req.body;

        // AGREGAMOS AL USUARIO
        nota.staff = uid;

        // AGREGAMOS EL NUEVO COMENTARIO
        correctiveDB.notes.push(nota);

        // UPDATE
        const correctiveUpdate = await Corrective.findByIdAndUpdate(coid, { notes: correctiveDB.notes }, { new: true })
            .populate('create', 'name role img')
            .populate('staff', 'name role img')
            .populate('notes.staff', 'name role img')
            .populate('client', 'name cedula phone email address city')
            .populate('product', 'code serial brand model year status estado next img ubicacion');

        // TRANSFORMAR ROLE
        correctiveUpdate.staff.role = getRole(correctiveDB.staff.role);

        res.json({
            ok: true,
            corrective: correctiveUpdate
        });



    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado, porfavor intente nuevamente'
        });
    }

}

/** =====================================================================
 *  DELETE NOTE
=========================================================================*/
const deleteNoteCorrective = async(req, res = response) => {

    try {

        const coid = req.params.coid;
        const note = req.params.note;

        // SEARCH CORRECTIVE
        const correctiveDB = await Corrective.findById(coid);
        if (!correctiveDB) {
            return res.status(400).json({
                ok: false,
                msg: 'No existe ningun Mantenimiento correctivo con este ID'
            });
        }
        // SEARCH CORRECTIVE

        const correctiveUpdate = await Corrective.updateOne({ _id: coid }, { $pull: { notes: { _id: note } } });

        // VERIFICAR SI SE ACTUALIZO
        if (correctiveUpdate.nModified === 0) {
            return res.status(400).json({
                ok: false,
                msg: 'No se pudo eliminar, porfavor intente de nuevo'
            });
        }

        const corrective = await Corrective.findById(coid)
            .populate('create', 'name role img')
            .populate('staff', 'name role img')
            .populate('notes.staff', 'name role img')
            .populate('client', 'name cedula phone email address city')
            .populate('product', 'code serial brand model year status estado next img ubicacion');

        res.json({
            ok: true,
            corrective
        });



    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado, porfavor intente nuevamente'
        });
    }

};

/** =====================================================================
 *  UPDATE CORRECTIVES
=========================================================================*/
const updateCorrectives = async(req, res = response) => {

    const coid = req.params.id;

    try {

        // SEARCH CLIENT
        const corretiveDB = await Corrective.findById({ _id: coid });
        if (!corretiveDB) {
            return res.status(400).json({
                ok: false,
                msg: 'No existe ningun usuario con este ID'
            });
        }
        // SEARCH CLIENT

        // SPREAD
        const {...campos } = req.body;

        // UPDATE
        const correctiveUpdate = await Corrective.findByIdAndUpdate(coid, campos, { new: true, useFindAndModify: false })
            .populate('create', 'name role img')
            .populate('staff', 'name role img')
            .populate('client', 'name cedula phone email address city')
            .populate('product', 'code serial brand model year status estado next img ubicacion');

        res.json({
            ok: true,
            corrective: correctiveUpdate
        });


    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado, porfavor intente nuevamente'
        });
    }

};

/** =====================================================================
 *  UPDATE CORRECTIVES
=========================================================================*/

/** =====================================================================
 *  ADD ITEMS CORRECTIVE
=========================================================================*/
const addItemsCorrective = async(req, res = response) => {

    try {

        const coid = req.params.id;
        const uid = req.uid;

        // SEARCH CLIENT
        const correctiveDB = await Corrective.findById({ _id: coid });

        if (!correctiveDB) {
            return res.status(400).json({
                ok: false,
                msg: 'No existe ningun Mantenimiento Correctio con este ID'
            });
        }
        // SEARCH CLIENT

        const { qty, sku, type, description } = req.body;

        const product = await Inventory.findOne({ sku });

        product.inventory -= qty;
        product.sold += qty;
        product.save();

        const data = {
            sku: product.sku,
            name: product.name,
            description: `Correctivo #${correctiveDB.control}`,
            type,
            befored: product.inventory + qty,
            qty: qty,
            product: correctiveDB.product,
            stock: product.inventory,
            corrective: coid,
            cajero: uid
        }

        const log = new LogProduct(data);
        await log.save();


        correctiveDB.items.push({
            sku,
            quantity: qty,
            description,
            logproduct: log._id
        });

        const correctiveUpdate = await Corrective.findByIdAndUpdate(coid, { items: correctiveDB.items }, { new: true, useFindAndModify: false })

        res.json({
            ok: true,
            corrective: correctiveUpdate
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado, porfavor intente nuevamente'
        });
    }

};

/** =====================================================================
 *  DEL ITEMS CORRECTIVE
=========================================================================*/
const delItemCorrective = async(req, res = response) => {

    try {

        const {...item } = req.body;
        const coid = req.params.coid;

        // BUSCAMOS EL CORRECTIVO
        const correctiveDB = await Corrective.findById(coid);
        if (!correctiveDB) {
            return res.status(400).json({
                ok: false,
                msg: 'Error, no existe ningun correctivo con este ID'
            })
        }

        // BUSCAMOS EL PRODUCTO
        const inventoryDB = await Inventory.findOne({ sku: item.sku })
        if (!inventoryDB) {
            return res.status(400).json({
                ok: false,
                msg: 'Error, no existe ningun producto con este ID'
            })
        }


        // ELIMINAMOS EL ITEM DEL CORRECTIVO
        const result = await Corrective.updateOne({ _id: coid }, { $pull: { items: { _id: item._id } } });

        if (result.modifiedCount === 0) {
            return res.status(404).json({
                ok: false,
                msg: 'Ha ocurrido un error al eliminar el item.'
            });
        }

        // ELIMINAMOS EL HISTORIAL
        await LogProduct.findByIdAndDelete(item.logproduct)

        // ACTUALIZAMOS EL INVENTARIO Y GUARDAMOS
        inventoryDB.inventory += item.quantity;
        inventoryDB.save();

        const corrective = await Corrective.findById(coid);

        res.json({
            ok: true,
            corrective
        })


    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado, porfavor intente nuevamente'
        });
    }

};

/** =====================================================================
 *  DELETE CORRECTIVES
=========================================================================*/
const deleteCorrectives = async(req, res = response) => {

    const coid = req.params.id;

    try {

        // SEARCH CORRECTIVE
        const corretiveDB = await Corrective.findById({ _id: coid });
        if (!corretiveDB) {
            return res.status(400).json({
                ok: false,
                msg: 'No existe ningun usuario con este ID'
            });
        }
        // SEARCH CORRECTIVE

        // CHANGE STATUS
        if (corretiveDB.status === true) {
            corretiveDB.status = false;
        } else {
            corretiveDB.status = true;
        }
        // CHANGE STATUS

        const correctiveUpdate = await Corrective.findByIdAndUpdate(coid, corretiveDB, { new: true, useFindAndModify: false });

        res.json({
            ok: true,
            corrective: correctiveUpdate
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
 *  PDF CORRECTIVE
=========================================================================*/
const pdfCorrective = async(req, res = response) => {

    try {

        const coid = req.params.id;

        // SEARCH CORRECTIVE
        const corretiveDB = await Corrective.findById({ _id: coid })
            .populate('create', 'name role img')
            .populate('staff', 'name role img')
            .populate('notes.staff', 'name role img')
            .populate('client', 'name cedula phone email address city')
            .populate('product', 'code serial brand model year status estado next img ubicacion');
        if (!corretiveDB) {
            return res.status(400).json({
                ok: false,
                msg: 'No existe ningun usuario con este ID'
            });
        }
        // SEARCH CORRECTIVE

        // FIX DATE
        corretiveDB.date = new Date(corretiveDB.date).getTime() - 18000000;

        const pathPDf = path.join(__dirname, `../uploads/pdf/${coid}.pdf`);

        // VALIDATE CERTIFICADO
        if (fs.existsSync(pathPDf)) {
            // DELET CERTIFICADO OLD
            fs.unlinkSync(pathPDf);
        }

        const parrafo = '';

        // Create a document
        const doc = new PDFDocument({ size: 'A4' });

        // Pipe its output somewhere, like to a file or HTTP response
        // See below for browser usage
        doc.pipe(fs.createWriteStream(pathPDf));

        // doc.image(path.join(__dirname, `../uploads/logo/liteco.png`), 210, 35, { width: 130, align: 'center', valign: 'center' });
        doc.image(path.join(__dirname, `../uploads/logo/castitoner.png`), 210, 35, { width: 130, align: 'center', valign: 'center' });

        // Embed a font, set the font size, and render some text
        doc
            .font('Helvetica-Bold')
            .fontSize(16)
            .moveDown(2)
            // .text('LINEA TECNOLOGICA DEL ORIENTE SA', {
            .text('CASTITONER & SUMINISTROS', {
                width: 412,
                align: 'center',
                ellipsis: true,
            });
        doc
            .font('Helvetica')
            .fontSize(12)
            // .text('NIT. 901.614.914-0', {
            .text('NIT. 88.264.373-5', {
                width: 412,
                align: 'center',
                ellipsis: true
            });
        doc
            .fontSize(12)
            // .text('Carrera 10 # 26 - 11 Lagos 1 Floridablanca', {
            .text('AV 0 11 72 LC 205 CC GRAN BULEVAR BRR CENTRO CUCUTA', {
                width: 412,
                align: 'center',
                ellipsis: true
            });
        doc
            .fontSize(12)
            // .text('Telefono: 3112125174', {
            .text('Telefono: 3103011828', {
                width: 412,
                align: 'center',
                ellipsis: true
            });
        doc
            .fontSize(12)
            // .text('comercial@litecoriente.com', {
            .text('castitoner@gmail.com', {
                width: 412,
                align: 'center',
                ellipsis: true
            });

        doc
            .font('Helvetica-Bold')
            .fontSize(14)
            .moveDown(1)
            .text(`Control #${corretiveDB.control}`, {
                width: 412,
                align: 'right',
                ellipsis: true
            });

        doc
            .font('Helvetica')
            .fontSize(12)
            .text(`Fecha: ${ new Date(corretiveDB.date).getDate()}/${ new Date(corretiveDB.date).getMonth()+1}/${ new Date(corretiveDB.date).getFullYear()}`, {
                width: 412,
                align: 'right',
                ellipsis: true
            });

        doc
            .font('Helvetica-Bold')
            .fontSize(14)
            .text('Producto:', {
                width: 412,
                align: 'left',
                height: 50,
                ellipsis: true
            });
        doc
            .font('Helvetica')
            .fontSize(12)
            .text(`Codigo: ${corretiveDB.product.code}`, {
                width: 412,
                align: 'left',
                indent: 10,
                height: 50,
                ellipsis: true
            });
        doc
            .fontSize(12)
            .text(`Serial: ${corretiveDB.product.serial}`, {
                width: 412,
                align: 'left',
                indent: 10,
                height: 50,
                ellipsis: true
            });
        doc
            .fontSize(12)
            .text(`Marca: ${corretiveDB.product.brand}`, {
                width: 412,
                align: 'left',
                indent: 10,
                height: 50,
                ellipsis: true
            });
        doc
            .fontSize(12)
            .text(`Modelo: ${corretiveDB.product.model}`, {
                width: 412,
                align: 'left',
                indent: 10,
                height: 50,
                ellipsis: true
            });
        doc
            .fontSize(12)
            .text(`Ubicacion: ${corretiveDB.product.ubicacion || ''}`, {
                width: 412,
                align: 'left',
                indent: 10,
                height: 50,
                ellipsis: true
            });

        doc
            .fontSize(12)
            .text(`Solicitante: ${corretiveDB.solicitante || ''}`, {
                width: 412,
                align: 'left',
                indent: 10,
                height: 50,
                ellipsis: true
            });

        doc
            .font('Helvetica-Bold')
            .fontSize(14)
            .moveDown()
            .text('Descripción:', {
                width: 412,
                align: 'left',
                height: 50,
                ellipsis: true
            });

        doc
            .font('Helvetica')
            .fontSize(12)
            .text(`${corretiveDB.description}`, {
                width: 412,
                align: 'left',
                height: 50,
                ellipsis: true
            });


        doc
            .font('Helvetica-Bold')
            .fontSize(14)
            .moveDown()
            .text('INFORME:', {
                width: 412,
                align: 'left',
                height: 50,
                ellipsis: true
            });

        for (const nota of corretiveDB.notes) {

            nota.date = new Date(nota.date).getTime() - 18000000;

            doc
                .font('Helvetica')
                .fontSize(12)
                .text(`> ${nota.note}`, {
                    width: 412,
                    align: 'left',
                    height: 50,
                    ellipsis: true
                });

            doc
                .fontSize(8)
                .text(` Por: ${nota.staff.name} - ${ new Date(nota.date).getDate()}/${ new Date(nota.date).getMonth() + 1 }/${ new Date(nota.date).getFullYear()} ${ new Date(nota.date).getHours()}:${ new Date(nota.date).getMinutes()}`, {
                    width: 412,
                    align: 'left',
                    indent: 10,
                    height: 25,
                    ellipsis: true
                });
        }

        if (corretiveDB.red) {
            doc
                .fontSize(12)
                .moveDown()
                .text(`> Equipo en red`, {
                    width: 412,
                    align: 'left',
                    height: 50,
                    ellipsis: true
                });
        }

        if (corretiveDB.operativa) {
            doc
                .fontSize(12)
                .moveDown()
                .text(`> Equipo en optimas condiciones y operativo`, {
                    width: 412,
                    align: 'left',
                    height: 50,
                    ellipsis: true
                });
        }



        let altura = 700;

        // FIRMAS
        doc
            .text(`Tecnico: ${corretiveDB.staff.name}`, 150, (altura), {
                continued: true,
            })
            .text(``, {
                continued: true,
            })
            .text(`Recibe: ${corretiveDB.recibe || ''}`, {
                continued: true,
                align: 'rigth',

            });


        doc.addPage({ size: 'A4' });

        doc
            .font('Helvetica')
            .fontSize(12)
            .text(``, {
                continued: false,
                width: 412,
            });

        if (corretiveDB.imgBef.length > 0) {

            doc
                .font('Helvetica')
                .fontSize(12)
                .text(`Imagenes Antes del mantenimiento:`, {
                    continued: false,
                    width: 412,
                    align: 'left',
                    ellipsis: true
                });

            let v = 2;
            if (corretiveDB.imgBef.length < 2) {
                v = corretiveDB.imgBef.length;
            }

            for (let i = 0; i < v; i++) {
                const pic = corretiveDB.imgBef[i];

                const pathImg = path.join(__dirname, `../uploads/correctives/${pic.img}`);

                if (fs.existsSync(pathImg)) {

                    const img = await sharp(pathImg)
                        .png()
                        .toBuffer();

                    await doc.image(img, { scale: 0.20, align: 'center' })
                        .moveDown();
                }


            }
        }



        if (corretiveDB.imgAft.length > 0) {

            doc
                .font('Helvetica')
                .fontSize(12)
                .moveDown()
                .text(`Imagenes Despues del mantenimiento:`, {
                    width: 412,
                    align: 'left',
                    ellipsis: true
                });

            let v = 2;
            if (corretiveDB.imgAft.length < 2) {
                v = corretiveDB.imgAft.length;
            }

            for (let i = 0; i < v; i++) {
                const pic = corretiveDB.imgAft[i];

                const pathImg = path.join(__dirname, `../uploads/correctives/${pic.img}`);

                if (fs.existsSync(pathImg)) {

                    const img = await sharp(pathImg)
                        .png()
                        .toBuffer();

                    await doc.image(img, { scale: 0.20, align: 'center' })
                        .moveDown();
                }

            }
        }



        await doc.end();

        setTimeout(() => {

            if (fs.existsSync(pathPDf)) {
                res.sendFile(pathPDf);
            } else {
                res.json({
                    ok: false,
                    msg: 'No se ha generado el certificado laboral exitosamente!'
                });
            }

        }, 2000);



    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error inesperado, porfavor intente nuevamente'
        });
    }

};

// EXPORTS
module.exports = {
    getCorrectives,
    createCorrectives,
    updateCorrectives,
    deleteCorrectives,
    getCorrectiveId,
    getCorrectiveStaff,
    postNotesCorrectives,
    getCorrectiveProduct,
    pdfCorrective,
    getCorrectivesQuery,
    deleteNoteCorrective,
    addItemsCorrective,
    delItemCorrective
};