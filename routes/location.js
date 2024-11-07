const express = require('express');
const router = express.Router();
const User = require('../models/User');
const SunCalc = require('suncalc');

// Endpoint to update location and push token
router.post('/update-location', async (req, res) => {
    const { token, location } = req.body;

    if (!token || !location) {
        return res.status(400).send({ error: 'Token and location are required' });
    }

    const { latitude, longitude } = location;

    try {
        let user = await User.findOne({ expoPushToken: token });
        
        if (!user) {
            // If user does not exist, create a new one 
            user = new User({ expoPushToken: token, latitude, longitude });
        } else {
            // Update existing user's location and token
            user.expoPushToken = token;
            user.latitude = latitude;
            user.longitude = longitude;
        }

        // Calculate the next notification time based on sun position
        const times = SunCalc.getTimes(new Date(), latitude, longitude);
        user.nextNotificationTime = times.sunset; // Example: sunset time

        await user.save();
        res.send({ message: 'Location updated and notification scheduled.' });
    } catch (error) {
        res.status(500).send({ error: 'An error occurred while updating location' });
    }
});

module.exports = router;