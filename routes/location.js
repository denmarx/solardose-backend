const express = require('express');
const router = express.Router();
const User = require('../models/User');
const SunCalc = require('suncalc');
const sendPushNotification = require('../utils/sendPushNotification'); 

// Endpoint to update location and push token
router.post('/update-location', async (req, res) => {
    const { token, location } = req.body;

    console.log('Received token:', token);
    console.log('Received location:', location);  // Log the location to check its structure

    if (!token || !location) {
        return res.status(400).send({ error: 'Token and location are required' });
    }

    const { latitude, longitude } = location;

    try {
        let user = await User.findOne({ expoPushToken: token });
        
        if (!user) {
            // If user does not exist, create a new one 
            user = new User({
                expoPushToken: token, 
                location: {latitude, longitude}
            });
        } else {
            // Update existing user's location and token
            user.expoPushToken = token;
            user.location = {
                latitude, longitude
            };
        }

       // Calculate the current sun position
        const sunPosition = SunCalc.getPosition(new Date(), latitude, longitude);
        const sunAltitude = sunPosition.altitude; // Sun's altitude in radians

        // Check if the sun's altitude is greater than 45 degrees (convert 45 degrees to radians)
        const sunAltitudeInDegrees = sunAltitude * (180 / Math.PI); // Convert altitude to degrees
        if (sunAltitudeInDegrees < 45) {
            // Send the push notification if the altitude is greater than 45 degrees
            await sendPushNotification(user.expoPushToken, "The sun is high in the sky! Enjoy the day!" );
        }

        // Save user information with updated location
        user.nextNotificationTime = new Date(); // For simplicity, using current time; you can adjust as needed.
        await user.save();

        res.send({ message: 'Location updated and notification scheduled.' });
    } catch (error) {
        res.status(500).send({ error: 'An error occurred while updating location' });
    }
});

// Endpoint to send a notification to the user
router.post('/send-notification', async (req, res) => {
    const { expoPushToken, message } = req.body;

    try {
        // Send a push notification using the helper function
        await sendPushNotification(expoPushToken, message);
        res.status(200).send({ message: 'Notification sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Error sending notification' });
    }
});

// Endpoint to test sending a push notification
router.post('/test-push', async (req, res) => {
    const { token, message } = req.body;

    if (!token || !message) {
        return res.status(400).send({ error: 'Token and message are required' });
    }

    try {
        // Call the helper function to send the push notification
        await sendPushNotification(token, message);
        res.send({ message: 'Test push notification sent successfully' });
    } catch (error) {
        console.error("Error sending test push notification:", error);
        res.status(500).send({ error: 'Error sending test push notification' });
    }
});

module.exports = router;