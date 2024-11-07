const Expo = require('expo-server-sdk').default;
const expo = new Expo();

const sendPushNotification = async (expoPushToken, message) => {
    if (!Expo.isExpoPushToken(expoPushToken)) {
        throw new Error('Invalid Expo push token');
    }

    const messages = [
        {
            to: expoPushToken,
            sound: 'default',
            body: message,
            data: { someData: 'goes here'},
        },
    ];

    const chunks = expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
        try {
            const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            console.log('Push notification ticket:', ticketChunk);
        } catch (error) {
            console.error('Error sending push notification:', error);
        }
    }
};

// const fetch = require('node-fetch');

// async function sendPushNotification(token, message) {
//     const payload = {
//         to: token,
//         sound: 'default',
//         title: 'Test Notification',
//         body: message,
//         data: { someData: 'goes here' },
//     };

//     try {
//         const response = await fetch('https://exp.host/--/api/v2/push/send', {
//             method: 'POST',
//             headers: {
//                 Accept: 'application/json',
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(payload),
//         });

//         if (!response.ok) {
//             throw new Error(`Failed to send push notification: ${response.statusText}`);
//         }

//         const responseData = await response.json();
//         console.log("Push notification response:", responseData);
//     } catch (error) {
//         console.error("Error in sendPushNotification:", error);
//     }
// }

module.exports = sendPushNotification;
