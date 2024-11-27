const SunCalc = require('suncalc');

const calculateSunPosition = (latitude, longitude) => {
    const sunPosition = SunCalc.getPosition(new Date(), latitude, longitude);
    const sunAltitudeinDegrees = sunPosition.altitude * (180 / Math.PI);
    return sunAltitudeinDegrees;
}

const hasNotificationBeenSentToday = (lastNotificationDate, userTimeZoneOffset) => {
    if (!lastNotificationDate) return false;

    const now = new Date();
         const todayStartLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    console.log("todayStart Local Time:", todayStartLocal.toLocaleString());   
    // Adjust "todayStart" to UTC based on the user’s time zone offset
    const todayStartUTC = new Date(todayStartLocal.getTime() - userTimeZoneOffset * 1000);  // Offset is in seconds, so multiply by 1000
    console.log("todayStart (UTC):", todayStartUTC.toISOString());
    const lastNotification = new Date(lastNotificationDate);
    console.log("last notification:", lastNotification);
    console.log("is last notification later than today start?", lastNotification >= todayStartUTC);
    return lastNotification >= todayStartUTC;
} 


module.exports = { calculateSunPosition, hasNotificationBeenSentToday};
