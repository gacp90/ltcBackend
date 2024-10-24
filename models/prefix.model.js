const { Schema, model } = require('mongoose');

const PrefixSchema = Schema({

    name: {
        type: String,
        require: true,
        unique: true
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

PrefixSchema.method('toJSON', function() {

    const { __v, _id, ...object } = this.toObject();
    object.prefid = _id;
    return object;

});

module.exports = model('prefixes', PrefixSchema);