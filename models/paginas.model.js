const { Schema, model } = require('mongoose');

const PaginasSchema = Schema({

    scaner: {
        type: Number,
    },
    copia: {
        type: Number,
    },
    total: {
        type: Number,
    },
    qty: {
        type: Number,
    },
    qtyc: {
        type: Number,
    },
    qtys: {
        type: Number,
    },
    img: {
        type: String,
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    },
    staff: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    fecha: {
        type: Date,
        default: Date.now
    }

});

PaginasSchema.method('toJSON', function() {

    const { __v, _id, ...object } = this.toObject();
    object.paid = _id;
    return object;

});

module.exports = model('Paginas', PaginasSchema);