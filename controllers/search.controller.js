const { response } = require('express');

const User = require('../models/users.model');
const Client = require('../models/clients.model');
const Product = require('../models/products.model');
const Inventory = require('../models/inventory.model');
const Preventive = require('../models/preventives.model');
const Corrective = require('../models/correctives.model');
const LogProduct = require('../models/log.products.model');

/** =====================================================================
 *  SEARCH FOR TABLE
=========================================================================*/
const search = async(req, res = response) => {

    const busqueda = req.params.busqueda;
    const tabla = req.params.tabla;
    const regex = new RegExp(busqueda, 'i');
    const desde = Number(req.query.desde) || 0;
    const hasta = Number(req.query.hasta) || 50;

    let data = [];
    let total;

    const numeros = /^[0-9]+$/;
    let number = false;

    if (busqueda.match(numeros)) {
        number = true;
    } else {
        number = false;
    }

    switch (tabla) {

        case 'users':

            // data = await User.find({ name: regex });
            [data, total] = await Promise.all([
                User.find({
                    $or: [
                        { usuario: regex },
                        { name: regex },
                        { role: regex },
                        { address: regex }
                    ]
                }),
                User.countDocuments()
            ]);
            break;


        case 'clients':

            // data = await Client.find({ name: regex });
            [data, total] = await Promise.all([
                Client.find({
                    $or: [
                        { name: regex },
                        { cedula: regex },
                        { phone: regex },
                        { email: regex },
                        { address: regex },
                        { city: regex },
                        { Department: regex }
                    ]
                }),
                Client.countDocuments()
            ]);
            break;
        case 'products':

            // data = await Client.find({ name: regex });
            [data, total] = await Promise.all([
                Product.find({
                    $or: [
                        { code: regex },
                        { serial: regex },
                        { brand: regex },
                        { model: regex },
                        { estado: regex },
                        { prefix: regex },
                    ]
                })
                .populate('client', 'name phone cid'),
                Product.countDocuments()
            ]);
            break;
        case 'inventory':

            // data = await Client.find({ name: regex });
            [data, total] = await Promise.all([
                Inventory.find({
                    $or: [
                        { sku: regex },
                        { name: regex },
                        { type: regex },
                        { description: regex },
                    ]
                })
                .populate('client', 'name phone cid'),
                Inventory.countDocuments()
            ]);
            break;

        case 'movimientos':

            // data = await Client.find({ name: regex });
            [data, total] = await Promise.all([
                LogProduct.find({
                    $or: [
                        { sku: regex },
                        { name: regex },
                        { description: regex },
                        { type: regex },
                        { categoria: regex },
                        { subcategoria: regex }
                    ]
                })
                .populate('cajero', 'name')
                .skip(desde)
                .limit(hasta),
                LogProduct.countDocuments()
            ]);
            break;

        case 'preventives':

            // COMPROBAR SI ES NUMERO
            if (number) {

                [data, total] = await Promise.all([
                    Preventive.find({
                        status: true,
                        $or: [
                            { control: busqueda }
                        ]
                    })
                    .populate('client', 'name cedula phone email address city')
                    .populate('create', 'name')
                    .populate('staff', 'name')
                    .populate('product', 'code serial brand model year status estado next img ubicacion'),
                    Preventive.countDocuments()
                ]);

            } else {

                let status = (busqueda === 'Eliminado' || busqueda === 'Eliminados' || busqueda === 'eliminados' || busqueda === 'eliminado') ? false : true;


                [data, total] = await Promise.all([
                    Preventive.find({
                        $or: [
                            { estado: regex },
                            { status }

                        ]
                    })
                    .populate('client', 'name cedula phone email address city')
                    .populate('create', 'name')
                    .populate('staff', 'name')
                    .populate('product', 'code serial brand model year status estado next img ubicacion'),
                    Preventive.countDocuments()
                ]);
            }


            break;
        case 'correctives':

            // COMPROBAR SI ES NUMERO
            if (number) {

                [data, total] = await Promise.all([
                    Corrective.find({
                        $or: [
                            { control: busqueda }
                        ]
                    })
                    .populate('client', 'name cedula phone email address city')
                    .populate('create', 'name')
                    .populate('staff', 'name')
                    .populate('product', 'code serial brand model year status estado next img ubicacion'),
                    Corrective.countDocuments()
                ]);

            } else {

                let status = (busqueda === 'Eliminado' || busqueda === 'Eliminados' || busqueda === 'eliminados' || busqueda === 'eliminado') ? false : true;

                [data, total] = await Promise.all([
                    Corrective.find({
                        $or: [
                            { estado: regex },
                            { status }
                        ]
                    })
                    .populate('client', 'name cedula phone email address city')
                    .populate('create', 'name')
                    .populate('staff', 'name')
                    .populate('product', 'code serial brand model year status estado next img ubicacion'),
                    Corrective.countDocuments()
                ]);
            }


            break;

        default:
            res.status(400).json({
                ok: false,
                msg: 'Error en los parametros de la busquedad'
            });
            break;

    }

    res.json({
        ok: true,
        resultados: data,
        total
    });

};
/** =====================================================================
 *  SEARCH FOR TABLE
=========================================================================*/


// EXPORTS
module.exports = {
    search
};