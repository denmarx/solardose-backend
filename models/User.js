const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    expoPushToken: String,
    location: {
        latitude: Number,
        longitude: Number,
    },
    lastNotificationDate: { type: Date },
    lastReminderDate: {type: Date},
});

module.exports = mongoose.model('User', userSchema);