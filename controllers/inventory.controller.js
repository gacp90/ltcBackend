const { response } = require('express');

const Inventory = require('../models/inventory.model');
const LogProduct = require('../models/log.products.model');

/** =====================================================================
 *  GET INVENTORY EXCEL
=========================================================================*/
const getInventory = async(req, res = response) => {

    try {

        const { desde, hasta, sort, ...query } = req.body;

        const [products, total] = await Promise.all([

            Inventory.find(query)
            .limit(hasta)
            .skip(desde)
            .sort(sort)
            .populate('categoria')
            .populate('tax')
            .populate('subcategoria'),
            Inventory.countDocuments({ status: true })
        ])

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


}

/** =====================================================================
 *  GET PRODUCTS EXCEL
=========================================================================*/
const getInventoryClients = async(req, res = response) => {

    try {

        const { desde, hasta, sort, ...query } = req.body;

        const [products, total] = await Promise.all([

            Inventory.find(query)
            .limit(hasta)
            .skip(desde)
            .sort(sort)
            .populate('categoria')
            .populate('tax')
            .populate('subcategoria'),
            Inventory.countDocuments({ status: true })
        ])

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


}

/** =====================================================================
 *  GET PRODUTS FOR ID
=========================================================================*/
const oneInventory = async(req, res = response) => {

    const id = req.params.id;

    try {

        const product = await Inventory.findById(id)
            .populate('categoria')
            .populate('tax')
            .populate('subcategoria');

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
 *  GET PRODUTS FOR SKU
=========================================================================*/
const GetSkuInventory = async(req, res = response) => {

    try {

        const sku = req.params.sku;

        const product = await Inventory.findOne({ sku })
            .populate('categoria')
            .populate('tax')
            .populate('subcategoria');

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
 *  GET PRODUCTS EXCEL
=========================================================================*/
const productsExcel = async(req, res = response) => {

    try {

        const {...query } = req.body;

        const products = await Inventory.find(query)
            .populate('categoria')
            .populate('tax')
            .populate('subcategoria');

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
const createInventory = async(req, res = response) => {

    const { sku } = req.body;

    try {

        // VALIDATE CODE
        const validateSku = await Inventory.findOne({ sku });
        if (validateSku) {
            return res.status(400).json({
                ok: false,
                msg: 'Ya existe un producto con este codigo de barras'
            });
        }

        // SAVE PRODUCT
        const productNew = new Inventory(req.body);
        productNew.inventory = productNew.stock;

        await productNew.save();

        const product = await Inventory.findById(productNew._id);

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
 *  CREATE PRODUCT EXCEL
=========================================================================*/
const createInventoryExcel = async(req, res = response) => {

    try {

        let products = req.body.products;

        if (products.length === 0) {
            return res.status(400).json({
                ok: false,
                msg: 'Lista de productos vacias, verifique he intene nuevamente'
            });
        }

        let i = 0;

        for (const producto of products) {

            // VALIDATE CODE
            const validateSku = await Inventory.findOne({ sku: producto.sku });
            if (!validateSku) {

                producto.inventory = producto.stock;

                // SAVE PRODUCT
                const inventory = new Inventory(producto);
                await inventory.save();
                i++;
            }

        }

        res.json({
            ok: true,
            total: i
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
 *  CREATE PRODUCT EXCEL
=========================================================================*/

/** =====================================================================
 *  UPDATE PRODUCT
=========================================================================*/
const updateInventory = async(req, res = response) => {

    const pid = req.params.id;

    const user = req.uid;

    try {

        // SEARCH PRODUCT
        const productDB = await Inventory.findById({ _id: pid });
        if (!productDB) {
            return res.status(400).json({
                ok: false,
                msg: 'No existe ningun producto con este ID'
            });
        }
        // SEARCH PRODUCT

        // VALIDATE SKU && NAME
        const { sku, name, qty, movimiento, ...campos } = req.body;

        // SKU
        if (String(productDB.sku) !== String(sku)) {
            const validateSku = await Inventory.findOne({ sku });
            if (validateSku) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Ya existe un producto con este codigo de barras'
                });
            }

            campos.sku = sku;
        }

        // NAME
        if (name && productDB.name !== name) {
            const validateName = await Inventory.findOne({ name });
            if (validateName) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Ya existe un producto con este nombre'
                });
            }
            campos.name = name;
        }

        if (qty || qty > 0) {

            const data = {
                sku: productDB.sku,
                name: productDB.name,
                type: movimiento,
                condition: 'Normal',
                befored: productDB.inventory + qty,
                qty: qty,
                stock: productDB.inventory,
                cajero: user
            }

            if (movimiento === 'Eliminados') {
                campos.damaged = productDB.damaged + qty;
                campos.inventory = productDB.inventory - qty;

                data.description = 'Dañados o Perdidos';
                data.befored = productDB.inventory;
                data.stock = campos.inventory;

            } else if (movimiento === 'Agregados') {
                campos.bought = productDB.bought + qty;
                campos.inventory = productDB.inventory + qty;

                data.description = 'Compro';
                data.befored = productDB.inventory;
                data.stock = campos.inventory;
            }

            const log = new LogProduct(data);
            await log.save();

        }

        // UPDATE        
        await Inventory.findByIdAndUpdate(pid, campos, { new: true, useFindAndModify: false });

        const product = await Inventory.findById(pid);

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
 *  UPDATE PRODUCT
=========================================================================*/

/** =====================================================================
 *  DELETE PRODUCT
=========================================================================*/
const deleteInventory = async(req, res = response) => {

    const _id = req.params.id;

    try {

        // SEARCH PRODUCT
        const productDB = await Inventory.findById({ _id });
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

        const productUpdate = await Inventory.findByIdAndUpdate(_id, productDB, { new: true, useFindAndModify: false });

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
    getInventory,
    oneInventory,
    productsExcel,
    createInventory,
    createInventoryExcel,
    updateInventory,
    deleteInventory,
    getInventoryClients,
    GetSkuInventory
};