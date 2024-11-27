const SunCalc = require('suncalc');

const calculateSunPosition = (latitude, longitude) => {
    const sunPosition = SunCalc.getPosition(new Date(), latitude, longitude);
    const sunAltitudeinDegrees = sunPosition.altitude * (180 / Math.PI);
    return sunAltitudeinDegrees;
}

const hasNotificationBeenSentToday = (lastNotificationDate, userTimeZoneOffset) => {
    if (!lastNotificationDate) return false;

    const now = new Date();
        let todayStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    todayStart.setTime(todayStart.getTime() - userTimeZoneOffset * 1000);
       console.log("todayStart (Adjusted):", todayStart);
    console.log("todayStart (Local Time):", todayStart.toLocaleString());
    console.log("todayStart (UTC):", todayStart.toISOString());
    const lastNotification = new Date(lastNotificationDate);
    console.log("last notification:", lastNotification);
    console.log("is last notification later than today start?", lastNotification >= todayStart);
    return lastNotification >= todayStart;
} 


module.exports = { calculateSunPosition, hasNotificationBeenSentToday};
