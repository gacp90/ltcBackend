const { Schema, model } = require('mongoose');

const TaskSchema = Schema({

    para: {
        type: String,
        require: true,
    },

    description: {
        type: String
    },

    address: {
        type: String
    },

    create: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    staff: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    status: {
        type: Boolean,
        default: false
    },

    end: {
        type: Boolean,
        default: false
    },

    fecha: {
        type: Date,
        default: Date.now
    },

    fechaend: {
        type: Date,
    }

});

TaskSchema.method('toJSON', function() {

    const { __v, _id, ...object } = this.toObject();
    object.taskid = _id;
    return object;

});

module.exports = model('tasks', TaskSchema);