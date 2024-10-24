const { Schema, model, connection } = require('mongoose');

const autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(connection);

const PaymentsSchema = Schema({
    type: {
        type: String
    },
    monto: {
        type: Number
    }
});


const ItemsSchema = Schema({
    sku: {
        type: String
    },
    quantity: {
        type: Number
    },
    price: {
        type: Number
    },
    cost: {
        type: Number
    },
    description: {
        type: String
    },
    taxes: {
        type: Schema.Types.ObjectId,
        ref: 'Taxes'
    },
});

const InvoiceSchema = Schema({


    invoice: {
        type: Number
    },
    create: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    client: {
        type: Schema.Types.ObjectId,
        ref: 'Clients'
    },
    pedido: {
        type: Schema.Types.ObjectId,
        ref: 'Pedidos'
    },
    amount: {
        type: Number
    },
    items: [ItemsSchema],
    payments: [PaymentsSchema],
    status: {
        type: Boolean,
        default: true
    },
    fecha: {
        type: Date,
        default: Date.now
    },
    vueltos: {
        type: Number
    },
    nota: {
        type: String
    },


});

InvoiceSchema.method('toJSON', function() {

    const { __v, _id, ...object } = this.toObject();
    object.iid = _id;
    return object;

});

InvoiceSchema.plugin(autoIncrement.plugin, {
    model: 'Invoice',
    field: 'invoice',
    startAt: process.env.INVOICE_INIT
});

module.exports = model('Invoices', InvoiceSchema);