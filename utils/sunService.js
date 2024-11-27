const SunCalc = require('suncalc');

const calculateSunPosition = (latitude, longitude) => {
    const sunPosition = SunCalc.getPosition(new Date(), latitude, longitude);
    const sunAltitudeinDegrees = sunPosition.altitude * (180 / Math.PI);
    return sunAltitudeinDegrees;
}

const hasNotificationBeenSentToday = (lastNotificationDate, userTimeZoneOffset) => {
    if (!lastNotificationDate) return false;

    const now = new Date();
    let todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    todayStart = todayStart + userTimeZoneOffset;
    console.log("today start:", todayStart);
    const lastNotification = new Date(lastNotificationDate);
    console.log("last notification:", lastNotification);
    return lastNotification >= todayStart;
} 


module.exports = { calculateSunPosition, hasNotificationBeenSentToday};
