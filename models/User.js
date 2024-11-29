const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    expoPushToken: {type: String, required: true},
    location: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
    },
    localDate: { type: Number, required: true },
    timezone: { type: String, required: true},
    lastReminderDate: {type: Number, default: 0},
});

module.exports = mongoose.model('User', userSchema);