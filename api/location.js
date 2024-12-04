const express = require('express');
const router = express.Router();
const User = require('../models/User');
const SunCalc = require('suncalc');
const { DateTime } = require('luxon');
const { find } = require('geo-tz');
const sendPushNotification = require('../utils/sendPushNotification'); 
const { getLocalDateFromCoordinates, hasNotificationBeenSentToday} = require('../utils/timeUtils');
const { calculateSunPosition, doesSunReach45Degrees} = require('../utils/sunService');

// Endpoint to update location and push token
router.post('/update-location', async (req, res) => {
    const { token, location } = req.body;
    
    if (!token || !location) {
        return res.status(400).send({ error: 'Token and location are required' });
    }
    
    const { latitude, longitude } = location;
    
    try {
        const { localDate, timezone } = await getLocalDateFromCoordinates(latitude, longitude);

        const result = doesSunReach45Degrees(latitude, longitude);
        
        let user = await User.findOne({ expoPushToken: token });
        
        if (!user) {
            // If user does not exist, create a new one 
            user = new User({
                expoPushToken: token, 
                location: { latitude, longitude },
                localDate,
                timezone,
                nextPossibleDate
            });
        } else {
            // Update existing user's location and token and timezone
            user.expoPushToken = token;
            user.location = {
                latitude, longitude
            };
            user.localDate = localDate;
            user.timezone = timezone;
            user.nextPossibleDate = result.nextPossibleDate;
        }
      
        // Save updated user information
        await user.save();

        res.send({ message: 'Location and timezone updated successfully.' });
    } catch (error) {
        console.error('Error in /update-location:', error);
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
            const sunAltitudeinDegrees = calculateSunPosition(latitude, longitude);
            let localDate = user.localDate;

            const userTimeZone = user.timezone;
            
            if (sunAltitudeinDegrees >= 1 && !hasNotificationBeenSentToday(localDate, userTimeZone)) {
                const message = "The sun is at a great angle! Perfect time for some Vitamin D!";
                
                await sendPushNotification(user.expoPushToken, message);
                localDate = Math.floor(DateTime.now().setZone(userTimeZone).toSeconds());
                
                // Update user's last notification date in UTC
                user.localDate = localDate;
                await user.save();

                notificationsSent.push({
                    user: user.expoPushToken,
                    message,
                });
            }
        }

        res.status(200).send('Checked sun position for all users.');
    } catch (error) {
        console.error("Error in /check-sun-position:", error);
        res.status(500).send('An error occured while checking the sun position');
    }
});

// Endpoint to send weekly reminders
// router.post('/send-weekly-reminder', async (req, res) => {
//     try {
//         const users = await User.find({});
//         // const today = new Date();
//         const remindersSent = [];

//         for (const user of users) {
//             const userTimeZone = user.timezone;
//             const today = DateTime.now().setZone(userTimeZone);

//             const lastReminderDate = user.lastReminderDate ? DateTime.fromISO(user.lastReminderDate).setZone(timezone) : null;

//             // Check if it's been a week since the last reminder
//             if (!lastReminderDate || today.diff(lastReminderDate, 'days').days >= 7) {
//                 const message = "Don't forget to open the app to update your location for accurate sun advice!"
//                 try {
//                     await sendPushNotification(user.expoPushToken, message);
                    
//                     // Update the last reminder date
//                     user.lastReminderDate = today.toISO();
//                     await user.save();
                    
//                     remindersSent.push({
//                         user: user.expoPushToken,
//                         message,
//                     });
//                 } catch (notificationError) {
//                     console.error(`Failed to send notification to user ${user.expoPushToken}:`, notificationError);
//                 }
//             }
//         }
        
//         res.status(200).send('Weekly reminders sent successfully.');
//     } catch (error) {
//         console.error("Error in /send-weekly-reminder:", error);
//         res.status(500).send('An error occured while sending weekly reminders');
//     }
// });

// Sample POST endpoint for sending weekly reminders
router.post('/send-weekly-reminder', async (req, res) => {
    try {
        const now = Date.now(); // Current timestamp
        const oneWeekInMs = 7 * 24 * 60 * 60 * 1000; // One week in milliseconds

        // Find users who need to be reminded (no reminder sent or older than 7 days)
        const usersToRemind = await User.find({
            $or: [
                { lastReminderDate: { $exists: false } },
                { lastReminderDate: { $lt: now - oneWeekInMs } }
            ]
        });

        for (const user of usersToRemind) {
            const message = "Don't forget to open the app to update your location for accurate sun advice!"
            // Send the push notification
            await sendPushNotification(user.expoPushToken, message);

            // Update the last reminder sent timestamp
            user.lastReminderDate = now;
            await user.save();
        }

        res.send({ message: 'Weekly reminder sent successfully.' });
    } catch (error) {
        console.error('Error sending weekly reminders:', error);
        res.status(500).send({ error: 'An error occurred while sending the weekly reminders.' });
    }
});

router.get('/get-sun-info', async (req, res) => {
    const { token } = req.headers;

    if (!token) {
        return res.status(400).send({ error: 'Token is required' });
    }

    try {
        let user = await User.findOne({ expoPushToken: token });
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        res.send({
            nextPossibleDate: user.nextPossibleDate
        });


    } catch (error) {
        console.error('Error in /get-sun-info:', error);
        res.status(500).send({ error: 'An error occurred while retrieving sun info' });
    }
});


// Endpoint to get sun position for a specific user
router.get('/get-sun-position', async (req, res) => {
    const { token } = req.headers; // Receive the token from the client
    
    if (!token) {
        return res.status(400).send({ error: 'Token is required' });
    }

    try {
        // Find the user by token
        let user = await User.findOne({ expoPushToken: token });
       
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        const { latitude, longitude } = user.location;
        const sunPosition = SunCalc.getPosition(new Date(), latitude, longitude);
        const sunAltitudeInDegrees = sunPosition.altitude * (180 / Math.PI);

        // Return sun position data to the client
        res.status(200).send({
            latitude,
            longitude,
            sunAltitude: sunAltitudeInDegrees,
            isVitaminDSynthesisPossible: sunAltitudeInDegrees >= 1,
        });
    } catch (error) {
        console.error("Error in /get-sun-position:", error);
        res.status(500).send({ error: 'Error fetching sun position' });
    }
});

router.get('/get-sun-altitude-data', async (req, res) => {
    const { token } = req.headers;

    if (!token) {
        return res.status(400).send({ error: 'Token is required' });
    }

    try {
        const user = await User.findOne({ expoPushToken: token });
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        const { latitude, longitude } = user.location;
        const userTimeZone = user.timezone;
        const now = new Date();
        const sunData = [];

        // Calculate sunrise and sunset
        const sunTimes = SunCalc.getTimes(now, latitude, longitude);

             // Use Luxon to convert UTC to local time
        const formatTime = (date) => {
            return DateTime.fromJSDate(date)
                .setZone(userTimeZone)  // Convert to the local time zone of the user
                .toFormat('HH:mm');  // Format as HH:mm
        };

        // Add sunrise and sunset times to the response
        const sunriseTime = formatTime(sunTimes.sunrise);
        const sunsetTime = formatTime(sunTimes.sunset);

        // Calculate sun altitude every hour
        for (let hour = 0; hour < 24; hour++) {
            const time = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour);
            const sunPosition = SunCalc.getPosition(time, latitude, longitude);
            sunData.push({
                time: `${hour}:00`,
                altitude: sunPosition.altitude * (180 / Math.PI), // Convert radians to degrees
            });
        }

        res.status(200).send({
            sunrise: sunriseTime,
            sunset: sunsetTime,
            sunAltitudes: sunData,
        });
    } catch (error) {
        console.error('Error fetching sun altitude data:', error);
        res.status(500).send({ error: 'Error fetching sun altitude data' });
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