const { response } = require('express');

const Invoice = require('../models/invoice.model');
const { soldProduct } = require('../helpers/update-product');

/**
 * The function `getInvoice` is an asynchronous function that retrieves invoices based on a query and
 * returns them along with the total count.
 * @param req - The `req` parameter is the request object that contains information about the incoming
 * HTTP request, such as the request headers, request body, and request parameters. It is used to
 * retrieve data sent by the client and to send a response back to the client.
 * @param res - The `res` parameter is the response object that is used to send the response back to
 * the client. It is an instance of the Express `Response` object.
 * @returns a JSON response with the following properties:
 * - "ok": a boolean value indicating whether the operation was successful or not.
 * - "invoices": an array of invoice objects that match the query parameters.
 * - "total": the total number of invoices that match the query parameters.
 */
const getInvoice = async(req, res) => {

    try {

        const { desde, hasta, sort, ...query } = req.body;

        const [invoices, total] = await Promise.all([
            Invoice.find(query)
            .populate('create')
            .populate('client')
            .sort(sort)
            .limit(hasta)
            .skip(desde),
            Invoice.countDocuments()
        ]);

        res.json({
            ok: true,
            invoices,
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

/**
 * The function `getInvoiceId` is an asynchronous function that retrieves an invoice from a database
 * based on its ID and returns it as a response.
 * @param req - The `req` parameter is the request object that contains information about the HTTP
 * request made by the client. It includes properties such as the request method, request headers,
 * request body, and request parameters.
 * @param [res] - The `res` parameter is the response object that is used to send the response back to
 * the client. It is an instance of the `response` object from the Express framework.
 * @returns The function `getInvoiceId` returns a JSON response. If the invoice is found in the
 * database, it returns a JSON object with the property `ok` set to `true` and the `invoice` property
 * containing the invoice data. If the invoice is not found, it returns a JSON object with the property
 * `ok` set to `false` and the `msg` property containing an error
 */
const getInvoiceId = async(req, res = response) => {

    try {
        const id = req.params.id;

        const invoiceDB = await Invoice.findById(id)
            .populate('create')
            .populate('client');
        if (!invoiceDB) {
            return res.status(400).json({
                ok: false,
                msg: 'No hemos encontrado esta factura, porfavor intente nuevamente.'
            });
        }

        res.json({
            ok: true,
            invoice: invoiceDB
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error inesperado, porfavor intente nuevamente'
        });
    }

};

/**
 * The function `createInvoice` is an asynchronous function that creates and saves an invoice in a
 * database.
 * @param req - The `req` parameter is the request object that contains information about the HTTP
 * request made by the client. It includes properties such as the request headers, request body,
 * request method, request URL, etc.
 * @param [res] - The `res` parameter is the response object that is used to send the response back to
 * the client. It is an optional parameter and has a default value of `response`, which is an object
 * that represents the HTTP response.
 */
const createInvoice = async(req, res = response) => {

    try {

        const uid = req.uid;

        // SAVE INVOICE
        const invoice = new Invoice(req.body);
        invoice.create = uid;

        await invoice.save();

        // UPDATE PRODUCTS
        await soldProduct(invoice);

        res.json({
            ok: true,
            invoice
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error Inesperado'
        });
    }
};


/**
 * The function `updateCategory` updates a category in a database based on the provided category ID and
 * request body.
 * @param req - The `req` parameter is the request object that contains information about the HTTP
 * request made by the client. It includes details such as the request method, headers, URL, and any
 * data sent in the request body.
 * @param [res] - The `res` parameter is the response object that is used to send the response back to
 * the client. It is an optional parameter and has a default value of `response`.
 * @returns a JSON response with the updated category object if the category is found and updated
 * successfully. If the category is not found, it returns a JSON response with an error message
 * indicating that no category exists with the provided ID. If there is an error during the process, it
 * returns a JSON response with an error message indicating an unexpected error.
 */
const updateInvoice = async(req, res = response) => {

    const iid = req.params.id;

    try {

        // SEARCH INVOICE
        const invoiceDB = await Invoice.findById(iid);
        if (!invoiceDB) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe ninguna factura con este ID'
            });
        }
        // SEARCH INVOICE

        let {...campos } = req.body;

        // UPDATE
        const invoiceUpdate = await Invoice.findByIdAndUpdate(iid, campos, { new: true, useFindAndModify: false });

        res.json({
            ok: true,
            invoice: invoiceUpdate
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
    getInvoice,
    getInvoiceId,
    createInvoice,
    updateInvoice
};