const { response } = require('express');

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const sharp = require('sharp');

const Preventive = require('../models/preventives.model');
const Product = require('../models/products.model');
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
 *  GET PREVENTIVES
=========================================================================*/
const getPreventives = async(req, res = response) => {

    try {

        const desde = Number(req.query.desde) || 0;
        const limite = Number(req.query.limite) || 10;

        const [preventives, total] = await Promise.all([

            Preventive.find()
            .sort({ control: -1 })
            .populate('create', 'name')
            .populate('staff', 'name')
            .populate('notes.staff', 'name role img')
            .populate('client', 'name cedula phone email address city')
            .populate('product', 'code serial brand model year status estado next img ubicacion')
            .skip(desde)
            .limit(limite),
            Preventive.countDocuments()
        ]);

        res.json({
            ok: true,
            preventives,
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
 *  GET PREVENTIVES
=========================================================================*/
/** =====================================================================
 *  GET PREVENTIVE FOR ID
=========================================================================*/
const getPreventiveId = async(req, res = response) => {

    try {

        const preid = req.params.id;

        const preventiveDB = await Preventive.findById(preid)
            .populate('create', 'name role img')
            .populate('staff', 'name role img')
            .populate('notes.staff', 'name role img')
            .populate('client', 'name cedula phone email address city')
            .populate('product', 'code serial brand model year status estado next img frecuencia ubicacion');

        if (!preventiveDB) {
            return res.status(400).json({
                ok: false,
                msg: 'No existe ningun mantenimiento preventivo con este ID'
            });
        }

        // TRANSFORMAR ROLE
        preventiveDB.staff.role = getRole(preventiveDB.staff.role);

        res.json({
            ok: true,
            preventive: preventiveDB
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
 *  GET PREVENTIVE FOR ID
=========================================================================*/

/** =====================================================================
 *  GET PREVENTIVE FOR STAFF SORT -1
=========================================================================*/
const getPreventiveStaff = async(req, res = response) => {

    try {

        const staff = req.params.staff;
        const status = req.query.status || true;
        const estado = req.query.estado;

        const preventives = await Preventive.find({ staff, estado, status })
            .populate('create', 'name role img')
            .populate('staff', 'name role img')
            .populate('notes.staff', 'name role img')
            .populate('client', 'name cedula phone email address city')
            .populate('product', 'code serial brand model year status estado next img')
            .sort({ control: -1 });

        res.json({
            ok: true,
            preventives,
            total: preventives.length
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
 *  GET PREVENTIVE FOR STAFF
=========================================================================*/

/** =====================================================================
 *  GET PREVENTIVE FOR PRODUCT
=========================================================================*/
const getPreventiveProduct = async(req, res = response) => {

    try {

        const product = req.params.product;
        const estado = req.query.estado;

        const preventives = await Preventive.find({ product, estado })
            .populate('create', 'name role img')
            .populate('staff', 'name role img')
            .populate('notes.staff', 'name role img')
            .populate('client', 'name cedula phone email address city')
            .populate('product', 'code serial brand model year status estado next img')
            .limit(20)
            .sort({ control: -1 });

        res.json({
            ok: true,
            preventives,
            total: preventives.length
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
 *  GET PREVENTIVE FOR PRODUCT
=========================================================================*/

/** =====================================================================
 *  CREATE PREVENTIVE
=========================================================================*/
const createPreventive = async(req, res = response) => {

    try {

        const uid = req.uid;

        // SAVE PREVENTIVE
        const preventive = new Preventive(req.body);
        preventive.create = uid;

        // AGREGAMOS EL PRIMER COMENTARIO
        preventive.notes.push({
            note: 'Se ha creado el mantenimiento preventivo',
            staff: uid
        });

        await preventive.save();

        const product = await Product.findByIdAndUpdate(preventive.product, ({ preventivo: true }), { new: true, useFindAndModify: false });

        res.json({
            ok: true,
            preventive
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
 *  CREATE PREVENTIVE
=========================================================================*/

/** =====================================================================
 *  CREATE NOTES IN PREVENTIVE
=========================================================================*/
const postNotes = async(req, res = response) => {

    try {

        const preid = req.params.id;
        const uid = req.uid;

        // SEARCH PREVENTIVE
        const preventiveDB = await Preventive.findById(preid);
        if (!preventiveDB) {
            return res.status(400).json({
                ok: false,
                msg: 'No existe ningun Mantenimiento Preventivo con este ID'
            });
        }
        // SEARCH PREVENTIVE

        const nota = req.body;

        // AGREGAMOS AL USUARIO
        nota.staff = uid;

        // AGREGAMOS EL NUEVO COMENTARIO
        preventiveDB.notes.push(nota);

        // UPDATE
        const preventiveUpdate = await Preventive.findByIdAndUpdate(preid, { notes: preventiveDB.notes }, { new: true })
            .populate('create', 'name role img')
            .populate('staff', 'name role img')
            .populate('notes.staff', 'name role img')
            .populate('client', 'name cedula phone email address city')
            .populate('product', 'code serial brand model year status estado next img');

        // TRANSFORMAR ROLE
        preventiveUpdate.staff.role = getRole(preventiveDB.staff.role);

        res.json({
            ok: true,
            preventive: preventiveUpdate
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
 *  CREATE NOTES IN PREVENTIVE
=========================================================================*/

/** =====================================================================
 *  UPDATE PREVENTIVES
=========================================================================*/
const updatePreventives = async(req, res = response) => {

    const preid = req.params.id;

    try {

        // SEARCH CLIENT
        const preventiveDB = await Preventive.findById({ _id: preid });

        if (!preventiveDB) {
            return res.status(400).json({
                ok: false,
                msg: 'No existe ningun Mantenimiento Preventivo con este ID'
            });
        }
        // SEARCH CLIENT

        // VALIDATE CEDULA
        const {...campos } = req.body;

        // UPDATE
        const preventiveUpdate = await Preventive.findByIdAndUpdate(preid, campos, { new: true, useFindAndModify: false })
            .populate('create', 'name role img')
            .populate('staff', 'name role img')
            .populate('client', 'name cedula phone email address city')
            .populate('product', 'code serial brand model year status estado next img pid');

        // TRANSFORMAR ROLE
        preventiveUpdate.staff.role = getRole(preventiveDB.staff.role);

        if (campos.check) {
            const frecuencia = campos.frecuencia;

            let next = new Date(Date.now());
            next = new Date(next.setMonth(next.getMonth() + frecuencia));

            await Product.findByIdAndUpdate(preventiveUpdate.product._id, ({ preventivo: false, next, frecuencia }), { new: true, useFindAndModify: false });

        }



        res.json({
            ok: true,
            preventive: preventiveUpdate
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
 *  UPDATE PREVENTIVES
=========================================================================*/

/** =====================================================================
 *  ADD ITEMS PREVENTIVES
=========================================================================*/
const addItemsPreventive = async(req, res = response) => {

    try {

        const preid = req.params.id;
        const uid = req.uid;

        // SEARCH CLIENT
        const preventiveDB = await Preventive.findById({ _id: preid });

        if (!preventiveDB) {
            return res.status(400).json({
                ok: false,
                msg: 'No existe ningun Mantenimiento Preventivo con este ID'
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
            description: `Preventivo #${preventiveDB.control}`,
            type,
            product: preventiveDB.product,
            befored: product.inventory + qty,
            qty: qty,
            stock: product.inventory,
            preventive: preventiveDB._id,
            cajero: uid
        }

        const log = new LogProduct(data);
        await log.save();


        preventiveDB.items.push({
            sku,
            quantity: qty,
            description,
            logproduct: log._id
        });

        const preventiveUpdate = await Preventive.findByIdAndUpdate(preid, { items: preventiveDB.items }, { new: true, useFindAndModify: false })

        res.json({
            ok: true,
            preventive: preventiveUpdate
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
 *  DELETE NOTE
=========================================================================*/
const deleteNotePreventive = async(req, res = response) => {

    try {

        const preid = req.params.preid;
        const note = req.params.note;

        // SEARCH CORRECTIVE
        const preventiveDB = await Preventive.findById(preid);
        if (!preventiveDB) {
            return res.status(400).json({
                ok: false,
                msg: 'No existe ningun Mantenimiento preventivo con este ID'
            });
        }
        // SEARCH CORRECTIVE

        const preventiveUpdate = await Preventive.updateOne({ _id: preid }, { $pull: { notes: { _id: note } } });

        // VERIFICAR SI SE ACTUALIZO
        if (preventiveUpdate.nModified === 0) {
            return res.status(400).json({
                ok: false,
                msg: 'No se pudo eliminar, porfavor intente de nuevo'
            });
        }

        const preventive = await Preventive.findById(preid)
            .populate('create', 'name role img')
            .populate('staff', 'name role img')
            .populate('notes.staff', 'name role img')
            .populate('client', 'name cedula phone email address city')
            .populate('product', 'code serial brand model year status estado next img frecuencia ubicacion');

        res.json({
            ok: true,
            preventive
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
 *  DELETE PREVENTIVES
=========================================================================*/
const deletePreventives = async(req, res = response) => {

    const preid = req.params.id;

    try {

        // SEARCH PREVENTIVE
        const preventiveDB = await Preventive.findById({ _id: preid });
        if (!preventiveDB) {
            return res.status(400).json({
                ok: false,
                msg: 'No existe ningun Mantenimiento Preventivo con este ID'
            });
        }
        // SEARCH PREVENTIVE

        // CHANGE STATUS
        if (preventiveDB.status === true) {
            preventiveDB.status = false;
        } else {
            preventiveDB.status = true;
        }
        // CHANGE STATUS

        const PreventiveUpdate = await Preventive.findByIdAndUpdate(preid, preventiveDB, { new: true, useFindAndModify: false });

        res.json({
            ok: true,
            preventive: PreventiveUpdate
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
 *  DEL ITEMS PREVENTIVE
=========================================================================*/
const delItemPreventive = async(req, res = response) => {

    try {

        const {...item } = req.body;
        const preid = req.params.preid;

        // BUSCAMOS EL CORRECTIVO
        const preventiveDB = await Preventive.findById(preid);
        if (!preventiveDB) {
            return res.status(400).json({
                ok: false,
                msg: 'Error, no existe ningun preventivo con este ID'
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
        const result = await Preventive.updateOne({ _id: preid }, { $pull: { items: { _id: item._id } } });

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

        const preventive = await Preventive.findById(preid);

        res.json({
            ok: true,
            preventive
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
 *  PDF PREVENTIVE
=========================================================================*/
const pdfPreventive = async(req, res = response) => {

    try {

        const preid = req.params.id;

        // SEARCH CORRECTIVE
        const preventiveDB = await Preventive.findById({ _id: preid })
            .populate('create', 'name role img')
            .populate('staff', 'name role img')
            .populate('notes.staff', 'name role img')
            .populate('client', 'name cedula phone email address city')
            .populate('product', 'code serial brand model year status estado next img ubicacion');
        if (!preventiveDB) {
            return res.status(400).json({
                ok: false,
                msg: 'No existe ningun usuario con este ID'
            });
        }
        // SEARCH CORRECTIVE

        // FIX DATE
        preventiveDB.date = new Date(preventiveDB.date).getTime() - 18000000;

        const pathPDf = path.join(__dirname, `../uploads/pdf/${preid}.pdf`);

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

        doc.image(path.join(__dirname, `../uploads/logo/liteco.png`), 210, 35, { width: 130, align: 'center', valign: 'center' });
        // doc.image(path.join(__dirname, `../uploads/logo/castitoner.png`), 210, 35, { width: 130, align: 'center', valign: 'center' });

        // Embed a font, set the font size, and render some text
        doc
            .font('Helvetica-Bold')
            .fontSize(16)
            .moveDown(2)
            .text('LINEA TECNOLOGICA DEL ORIENTE SA', {
                // .text('CASTITONER & SUMINISTROS', {
                width: 412,
                align: 'center',
                ellipsis: true,
            });
        doc
            .font('Helvetica')
            .fontSize(12)
            .text('NIT. 901.614.914-0', {
                // .text('NIT. 88.264.373-5', {
                width: 412,
                align: 'center',
                ellipsis: true
            });
        doc
            .fontSize(12)
            .text('Carrera 10 # 26 - 11 Lagos 1 Floridablanca', {
                // .text('AV 0 11 72 LC 205 CC GRAN BULEVAR BRR CENTRO CUCUTA', {
                width: 412,
                align: 'center',
                ellipsis: true
            });
        doc
            .fontSize(12)
            .text('Telefono: 3112125174', {
                // .text('Telefono: 3103011828', {
                width: 412,
                align: 'center',
                ellipsis: true
            });
        doc
            .fontSize(12)
            .text('comercial@litecoriente.com', {
                // .text('castitoner@gmail.com', {
                width: 412,
                align: 'center',
                ellipsis: true
            });

        doc
            .font('Helvetica-Bold')
            .fontSize(14)
            .moveDown(1)
            .text(`Control #${preventiveDB.control}`, {
                width: 412,
                align: 'right',
                ellipsis: true
            });

        doc
            .font('Helvetica')
            .fontSize(12)
            .text(`Fecha: ${ new Date(preventiveDB.date).getDate()}/${ new Date(preventiveDB.date).getMonth()+1}/${ new Date(preventiveDB.date).getFullYear()}`, {
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
            .text(`Codigo: ${preventiveDB.product.code}`, {
                width: 412,
                align: 'left',
                indent: 10,
                height: 50,
                ellipsis: true
            });
        doc
            .fontSize(12)
            .text(`Serial: ${preventiveDB.product.serial}`, {
                width: 412,
                align: 'left',
                indent: 10,
                height: 50,
                ellipsis: true
            });
        doc
            .fontSize(12)
            .text(`Marca: ${preventiveDB.product.brand}`, {
                width: 412,
                align: 'left',
                indent: 10,
                height: 50,
                ellipsis: true
            });
        doc
            .fontSize(12)
            .text(`Modelo: ${preventiveDB.product.model}`, {
                width: 412,
                align: 'left',
                indent: 10,
                height: 50,
                ellipsis: true
            });
        doc
            .fontSize(12)
            .text(`Ubicacion: ${preventiveDB.product.ubicacion || ''}`, {
                width: 412,
                align: 'left',
                indent: 10,
                height: 50,
                ellipsis: true
            });

        doc
            .fontSize(12)
            .text(`Solicitante: ${preventiveDB.solicitante || ''}`, {
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
            .text('INFORME:', {
                width: 412,
                align: 'left',
                height: 50,
                ellipsis: true
            });

        for (const nota of preventiveDB.notes) {

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
                .text(` Por: ${nota.staff.name} - ${ new Date(nota.date).getDate()}/${ new Date(nota.date).getMonth() + 1}/${ new Date(nota.date).getFullYear()} ${ new Date(nota.date).getHours()}:${ new Date(nota.date).getMinutes()}`, {
                    width: 412,
                    align: 'left',
                    indent: 10,
                    height: 25,
                    ellipsis: true
                });
        }

        if (preventiveDB.red) {
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

        if (preventiveDB.operativa) {
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
            .text(`Tecnico: ${preventiveDB.staff.name}`, 150, (altura), {
                continued: true,
            })
            .text(``, {
                continued: true,
            })
            .text(`Recibe: ${preventiveDB.recibe || ''}`, {
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

        if (preventiveDB.imgBef.length > 0) {

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
            if (preventiveDB.imgBef.length < 2) {
                v = preventiveDB.imgBef.length;
            }

            for (let i = 0; i < v; i++) {
                const pic = preventiveDB.imgBef[i];

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



        if (preventiveDB.imgAft.length > 0) {

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
            if (preventiveDB.imgAft.length < 2) {
                v = preventiveDB.imgAft.length;
            }

            for (let i = 0; i < 2; i++) {
                const pic = preventiveDB.imgAft[i];

                const pathImg = path.join(__dirname, `../uploads/preventives/${pic.img}`);

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
                    msg: 'No se ha generado el PDF del preventivo!'
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

/** =====================================================================
 *  DELETE PREVENTIVES
=========================================================================*/

// EXPORTS
module.exports = {
    getPreventives,
    createPreventive,
    updatePreventives,
    deletePreventives,
    getPreventiveId,
    postNotes,
    getPreventiveStaff,
    getPreventiveProduct,
    pdfPreventive,
    deleteNotePreventive,
    addItemsPreventive,
    delItemPreventive
};