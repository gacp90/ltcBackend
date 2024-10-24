const { Schema, model, connection } = require('mongoose');

const autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(connection);

const ItemsSchema = Schema({
    sku: {
        type: String
    },
    quantity: {
        type: Number
    },
    description: {
        type: String
    },
    logproduct: {
        type: Schema.Types.ObjectId,
        ref: 'LogProducts'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const ImgSchema = Schema({
    img: {
        type: String
    },

    date: {
        type: Date,
        default: Date.now
    }

});

const VideoSchema = Schema({
    video: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }

});

const NotesSchema = Schema({

    note: {
        type: String
    },

    date: {
        type: Date,
        default: Date.now
    },

    staff: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }

});

const CorrectivesSchema = Schema({

    control: {
        type: Number,
    },

    create: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    },

    staff: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    client: {
        type: Schema.Types.ObjectId,
        ref: 'Clients'
    },

    description: {
        type: String
    },

    solicitante: {
        type: String
    },

    recibe: {
        type: String
    },

    red: {
        type: Boolean,
        default: false
    },

    operativa: {
        type: Boolean,
        default: false
    },

    notes: [NotesSchema],

    items: [ItemsSchema],

    imgBef: [ImgSchema],

    imgAft: [ImgSchema],

    video: [VideoSchema],

    checkin: {
        type: Date
    },

    checkout: {
        type: Date
    },

    status: {
        type: Boolean,
        default: true
    },

    estado: {
        type: String,
        default: 'Pendiente'
    },

    date: {
        type: Date,
        default: Date.now
    },

});

CorrectivesSchema.method('toJSON', function() {

    const { __v, _id, ...object } = this.toObject();
    object.coid = _id;
    return object;

});

CorrectivesSchema.plugin(autoIncrement.plugin, {
    model: 'Correctives',
    field: 'control',
    startAt: process.env.AUTOINCREMENT_INIT
});

module.exports = model('Correctives', CorrectivesSchema);