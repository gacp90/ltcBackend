const { Schema, model } = require('mongoose');

const Inventory = Schema({

    sku: {
        type: String,
        require: true,
        unique: true
    },

    name: {
        type: String,
        require: true,
    },

    type: {
        type: String,
        require: true,
        dafult: 'Unidad'
    },

    description: {
        type: String,
        require: true,
    },

    price: {
        type: Number,
        require: true,
    },

    cost: {
        type: Number,
        require: true,
    },

    wholesale: {
        type: Number,
        default: 0
    },

    inventory: {
        type: Number,
    },

    stock: {
        type: Number,
    },

    bought: {
        type: Number,
        default: 0
    },

    sold: {
        type: Number,
        default: 0
    },

    returned: {
        type: Number,
        default: 0
    },

    damaged: {
        type: Number,
        default: 0
    },

    min: {
        type: Number,
    },

    offert: {
        type: Boolean,
        default: false
    },

    offertPrice: {
        type: Number,
    },

    offertPercent: {
        type: Number,
    },

    taxes: {
        type: Boolean,
        default: false
    },

    tax: {
        type: Schema.Types.ObjectId,
        ref: 'Taxes'
    },

    visibility: {
        type: Boolean,
        default: true
    },

    status: {
        type: Boolean,
        default: true
    },

    img: {
        type: String
    },

    date: {
        type: Date,
        default: Date.now
    }

});

Inventory.method('toJSON', function() {

    const { __v, _id, ...object } = this.toObject();
    object.inid = _id;
    return object;

});

module.exports = model('Inventory', Inventory);