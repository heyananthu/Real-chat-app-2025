const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    recieverId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    text: {
        type: String,
    },
    image: {
        type: String,
    }
},
    { timestamps: true }
);

const Messages = mongoose.model('Message', messageSchema);

module.exports = Messages;

