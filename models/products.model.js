const { Schema, model } = require('mongoose');

const ProductSchema = Schema({

    prefix: {
        type: String,
    },

    code: {
        type: String,
        require: true,
        unique: true
    },

    serial: {
        type: String,
        require: true,
        unique: true
    },

    brand: {
        type: String
    },

    model: {
        type: String
    },

    year: {
        type: Number
    },

    status: {
        type: Boolean,
        default: true
    },

    estado: {
        type: String,
        default: 'Disponible'
    },
    cliente: {
        type: Boolean,
        default: false
    },
    client: {
        type: Schema.Types.ObjectId,
        ref: 'Clients',
    },

    ubicacion: {
        type: String
    },

    preventivo: {
        type: Boolean,
        default: false
    },

    frecuencia: {
        type: Number,
        default: 3
    },

    next: {
        type: Date
    },

    img: {
        type: String
    },

    date: {
        type: Date,
        default: Date.now
    }

});

ProductSchema.method('toJSON', function() {

    const { __v, _id, ...object } = this.toObject();
    object.pid = _id;
    return object;

});

module.exports = model('Product', ProductSchema);