const { Schema, model } = require('mongoose');

const ClientsSchema = Schema({

    client: {
        type: Schema.Types.ObjectId,
        ref: 'Clients',
    },

});

const AbonadoSchema = Schema({

    usuario: {
        type: String,
        require: true,
        unique: true
    },

    name: {
        type: String,
        require: true
    },

    password: {
        type: String,
        require: true
    },

    clients: [ClientsSchema],

    valid: {
        type: Boolean,
        default: true
    },

    status: {
        type: Boolean,
        default: true
    },

    fecha: {
        type: Date,
        default: Date.now
    }

});

AbonadoSchema.method('toJSON', function() {

    const { __v, _id, password, ...object } = this.toObject();
    object.aid = _id;
    return object;

});

module.exports = model('Abonado', AbonadoSchema);