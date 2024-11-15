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

        // Save updated user information
        await user.save();

        res.send({ message: 'Location updated successfully.' });
    } catch (error) {
        res.status(500).send({ error: 'An error occurred while updating location' });
    }
});

// Endpoint to check the sun's position for all users
router.post('/check-sun-position', async (req, res) => {
    try {
        // Fetch all users from database
        const users = await User.find({});
        const notificationsSent = [];

        // Iterate over all users and calculate the sun's position
        for (const user of users) {
            const { latitude, longitude } = user.location;
            const sunPosition = SunCalc.getPosition(new Date(), latitude, longitude);
            const sunAltitudeinDegrees = sunPosition.altitude * (180 / Math.PI);

            console.log(`User: ${user.expoPushToken}, Sun Altitude: ${sunAltitudeinDegrees}°`);
            
            if (sunAltitudeinDegrees >= 1) {
                const today = new Date();
                today.setHours(0, 0, 0, 0); //Start of today's date (midnight)

                // Check if a notification has been sent today
                if (!user.lastNotificationDate || new Date(user.lastNotificationDate).getTime() < today.getTime()) {
                    // Send notification
                    const message = "The sun is at a great angle! Perfect time for some Vitamin D!";
                    await sendPushNotification(user.expoPushToken, message);
                   
                    // Update the last notification date
                    user.lastNotificationDate = new Date();
                    await user.save();

                    notificationsSent.push({
                        user: user.expoPushToken,
                        message,
                    });
                }
            }
        }

        res.status(200).send({
            message: 'Checked sun position for all users.',
            notificationsSent,
        });
    } catch (error) {
        console.error("Error in /check-sun-position:", error);
        res.status(500).send({ error: 'An error occured while checking the sun position' });
    }
});

// Endpoint to send weekly reminders
router.post('/send-weekly-reminder', async (req, res) => {
    try {
        const users = await User.find({});
        const today = new Date();

        const remindersSent = [];

        for (const user of users) {
            const lastReminderDate = user.lastReminderDate ? new Date(user.lastReminderDate) : null;

            // Check if it's been a week since the last reminder
            if (!lastReminderDate || (today - lastReminderDate) >= 7 * 24 * 60 * 60 * 1000) {
                const message = "Don't forget to open the app to update your location for accurate sun advice!"
                await sendPushNotification(user.expoPushToken, message);

                // Update the last reminder date
                user.lastReminderDate = today;
                await user.save();

                remindersSent.push({
                    user: user.expoPushToken,
                    message,
                });
            }
        }
        res.status(200).send({
            message: 'Weekly reminders sent successfully.',
            remindersSent
        });
    } catch (error) {
        console.error("Error in /send-weekly-reminder:", error);
        res.status(500).send({ error: 'An error occured while sending weekly reminders' });
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