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

module.exports = sendPushNotification;
