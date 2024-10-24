const { response } = require('express');

const Product = require('../models/products.model');

/** =====================================================================
 *  GET PRODUCTS QUERY
======================================= ==================================*/
const getProductsQuery = async(req, res = response) => {

    try {

        const { desde, hasta, sort, ...query } = req.body;

        const [products, total] = await Promise.all([

            Product.find(query)
            .populate('client', 'name cid phone address')
            .skip(desde)
            .limit(hasta)
            .sort(sort),
            Product.countDocuments()
        ])

        //const products = await 

        res.json({
            ok: true,
            products,
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
 *  GET PRODUCTS
=========================================================================*/
const getProducts = async(req, res = response) => {

    try {

        const tipo = req.query.tipo || 'none';
        const preventivo = req.query.preventivo | false;

        const initial = '01/01/2001';
        let end = Date.now();

        const desde = Number(req.query.desde) | 0;
        const limite = Number(req.query.limite) | 10;
        const status = Boolean(req.query.status) | true;
        const valor = req.query.valor || 'false';

        let products = [];
        let total = 0;



        switch (tipo) {
            case 'none':

                [products, total] = await Promise.all([
                    Product.find()
                    .populate('client', 'name cid phone address')
                    .skip(desde)
                    .limit(limite),
                    Product.countDocuments()

                ]);

                break;

            case 'proximos':

                end = new Date(end);
                end = end.setDate(end.getDate() + 7);

                [products, total] = await Promise.all([
                    Product.find({
                        $and: [{ next: { $gte: new Date(initial), $lt: new Date(end) } }],
                        preventivo,
                        status
                    })
                    .populate('client', 'name cid phone address')
                    .skip(desde)
                    .limit(1000),
                    0
                ]);

                break;

            default:
                break;
        }

        if (tipo === 'proximos') {
            total = products.length;
        }

        res.json({
            ok: true,
            products,
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
 *  GET PRODUCTS
=========================================================================*/

/** =====================================================================
 *  GET PRODUTS FOR ID
=========================================================================*/
const oneProduct = async(req, res = response) => {

    const id = req.params.id;

    try {

        const product = await Product.findById(id)
            .populate('client', 'name phone address');

        res.json({
            ok: true,
            product
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
 *  GET PRODUCTS OF CLIENT
=========================================================================*/
const getProductsClients = async(req, res = response) => {

    try {

        const client = req.params.id;

        const products = await Product.find({ client })
            .populate('client', 'name cid phone address');

        res.json({
            ok: true,
            products
        });


    } catch (error) {

        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error inesperado, porfavor intente nuevamente'
        });

    }

};

/** ======================================================================
 *  GET COUNT OF PREFIX
=========================================================================*/
const getCountPrefix = async(req, res) => {

    try {

        const prefix = req.params.prefix;
        const total = await Product.countDocuments({ prefix });

        res.json({
            ok: true,
            total: (total + 1)
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
 *  GET COUNT OF PREFIX
=========================================================================*/



/** =====================================================================
 *  GET PRODUCTS EXCEL
=========================================================================*/
const productsExcel = async(req, res = response) => {

    try {

        const products = await Product.find({}, 'code name type cost inventario gain price wholesale brand stock bought sold returned damaged fecha');

        res.json({
            ok: true,
            products
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
 *  CREATE PRODUCT
=========================================================================*/
const createProduct = async(req, res = response) => {

    const { code, name } = req.body;

    try {

        // VALIDATE CODE
        const validateCode = await Product.findOne({ code });
        if (validateCode) {
            return res.status(400).json({
                ok: false,
                msg: 'Ya existe un producto con este codigo de barras'
            });
        }

        // SAVE PRODUCT
        const product = new Product(req.body);

        let next = new Date(Date.now());
        product.next = new Date(next.setMonth(next.getMonth() + req.body.frecuencia));

        await product.save();

        res.json({
            ok: true,
            product
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
 *  CREATE PRODUCT
=========================================================================*/

/** =====================================================================
 *  UPDATE PRODUCT
=========================================================================*/
const updateProduct = async(req, res = response) => {

    const pid = req.params.id;

    const user = req.uid;

    try {

        // SEARCH PRODUCT
        const productDB = await Product.findById({ _id: pid });
        if (!productDB) {
            return res.status(400).json({
                ok: false,
                msg: 'No existe ningun producto con este ID'
            });
        }
        // SEARCH PRODUCT

        // VALIDATE CODE && NAME
        const { code, name, ...campos } = req.body;

        // CODE
        if (String(productDB.code) !== String(code)) {
            const validateCode = await Product.findOne({ code });
            if (validateCode) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Ya existe un producto con este codigo de barras'
                });
            }
        }

        // NAME
        if (productDB.name !== name) {
            const validateName = await Product.findOne({ name });
            if (validateName) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Ya existe un producto con este nombre'
                });
            }
        }

        // UPDATE
        campos.code = code;
        campos.name = name;
        const productUpdate = await Product.findByIdAndUpdate(pid, campos, { new: true, useFindAndModify: false });

        res.json({
            ok: true,
            product: productUpdate
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
 *  UPDATE PRODUCT
=========================================================================*/
/** =====================================================================
 *  UPDATE CLIENT PRODUCT 
=========================================================================*/
const updateClientProduct = async(req, res = response) => {

    try {

        const pid = req.params.product;
        const {...campos } = req.body;

        // SEARCH PRODUCT
        const productDB = await Product.findById({ _id: pid })
        if (!productDB) {
            return res.status(400).json({
                ok: false,
                msg: 'No existe ningun producto con este ID'
            });
        }

        const productUpdate = await Product.findByIdAndUpdate(pid, campos, { new: true, useFindAndModify: false })
            .populate('client', 'name cid');

        res.json({
            ok: true,
            product: productUpdate
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
 *  UPDATE CLIENT PRODUCT
=========================================================================*/

/** =====================================================================
 *  DELETE PRODUCT
=========================================================================*/
const deleteProduct = async(req, res = response) => {

    const _id = req.params.id;

    try {

        // SEARCH PRODUCT
        const productDB = await Product.findById({ _id });
        if (!productDB) {
            return res.status(400).json({
                ok: false,
                msg: 'No existe ningun producto con este ID'
            });
        }
        // SEARCH PRODUCT

        // CHANGE STATUS
        if (productDB.status === true) {
            productDB.status = false;
        } else {
            productDB.status = true;
        }
        // CHANGE STATUS

        const productUpdate = await Product.findByIdAndUpdate(_id, productDB, { new: true, useFindAndModify: false });

        res.json({
            ok: true,
            product: productUpdate
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
 *  DELETE PRODUCT
=========================================================================*/

// EXPORTS
module.exports = {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    oneProduct,
    updateClientProduct,
    productsExcel,
    getProductsClients,
    getCountPrefix,
    getProductsQuery
};