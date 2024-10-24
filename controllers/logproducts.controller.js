const { response } = require('express');

const LogProduct = require('../models/log.products.model');

/** =====================================================================
 *  GET PRODUCTS EXCEL
=========================================================================*/
const getLogProducts = async(req, res = response) => {

    try {

        const { desde, hasta, sort, ...query } = req.body;

        const [logproducts, total] = await Promise.all([

            LogProduct.find(query)
            .populate('cajero', 'name')
            .limit(hasta)
            .skip(desde)
            .sort(sort),
            LogProduct.countDocuments()
        ])

        res.json({
            ok: true,
            logproducts,
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

// EXPORTS
module.exports = {
    getLogProducts
};