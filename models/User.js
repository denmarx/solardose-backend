const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    expoPushToken: String,
    location: {
        latitude: Number,
        longitude: Number,
    },
    nextNotificationTime: Date,
});

module.exports = mongoose.model('User', userSchema);