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

const PreventivesSchema = Schema({

    control: {
        type: String,
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

    notes: [NotesSchema],

    items: [ItemsSchema],

    imgBef: [ImgSchema],

    imgAft: [ImgSchema],

    video: [VideoSchema],

    status: {
        type: Boolean,
        default: true
    },

    estado: {
        type: String,
        default: 'Pendiente'
    },

    checkin: {
        type: Date
    },

    checkout: {
        type: Date
    },

    date: {
        type: Date,
        default: Date.now
    },

});

PreventivesSchema.method('toJSON', function() {

    const { __v, _id, ...object } = this.toObject();
    object.preid = _id;
    return object;

});

PreventivesSchema.plugin(autoIncrement.plugin, {
    model: 'Preventives',
    field: 'control',
    startAt: process.env.AUTOINCREMENT_INIT
});

module.exports = model('Preventives', PreventivesSchema);