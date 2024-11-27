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
    todayStart.setMinutes(todayStart.getMinutes() - userTimeZoneOffset / 60);
    console.log("today start:", todayStart);
    const lastNotification = new Date(lastNotificationDate);
    console.log("last notification:", lastNotification);
    console.log("is last notification later than today start?", lastNotification >= todayStart);
    return lastNotification >= todayStart;
} 


module.exports = { calculateSunPosition, hasNotificationBeenSentToday};
