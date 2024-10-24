const Inventory = require('../models/inventory.model');
const LogProduct = require('../models/log.products.model');

/** =====================================================================
 *  UPDATE STOCK 
=========================================================================*/
const soldProduct = async(invoice) => {

    try {

        const products = invoice.items;

        for (const item of products) {

            const product = await Inventory.findOne({ sku: item.sku });

            product.inventory -= item.quantity;
            product.sold += item.quantity;
            product.save();

            const data = {
                sku: product.sku,
                name: product.name,
                description: `Remision #${invoice.invoice}`,
                type: 'Salida',
                condition: 'Normal',
                befored: product.inventory + item.quantity,
                qty: item.quantity,
                stock: product.inventory,
                invoice: invoice._id,
                cajero: invoice.create
            }


            const log = new LogProduct(data);
            await log.save();

        }

        return true;

    } catch (error) {
        console.log(error);
        return false;
    }

};

// EXPORT
module.exports = {
    soldProduct
};