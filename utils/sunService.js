const SunCalc = require('suncalc');

const calculateSunPosition = (latitude, longitude) => {
    const sunPosition = SunCalc.getPosition(new Date(), latitude, longitude);
    const sunAltitudeinDegrees = sunPosition.altitude * (180 / Math.PI);
    return sunAltitudeinDegrees;
}

const hasNotificationBeenSentToday = (lastNotificationDate, userTimeZoneOffset) => {
    if (!lastNotificationDate) return false;

    const now = new Date();
    console.log("now", now)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    console.log("todayStart", todayStart)
    todayStart.setMinutes(todayStart.getMinutes() + userTimeZoneOffset);
    console.log("todayStart adjusted", todayStart)
    const lastNotification = new Date(lastNotificationDate);
    console.log("lastnoti", lastNotification)
    return lastNotification >= todayStart;
} 


module.exports = { calculateSunPosition, hasNotificationBeenSentToday};
