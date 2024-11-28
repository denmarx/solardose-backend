const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    expoPushToken: String,
    location: {
        latitude: Number,
        longitude: Number,
    },
    localDate: { type: String },
    lastReminderDate: {type: Date},
});

module.exports = mongoose.model('User', userSchema);