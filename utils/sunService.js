const SunCalc = require('suncalc');

const calculateSunPosition = (latitude, longitude) => {
    const sunPosition = SunCalc.getPosition(new Date(), latitude, longitude);
    const sunAltitudeinDegrees = sunPosition.altitude * (180 / Math.PI);
    return sunAltitudeinDegrees;
}

const hasNotificationBeenSentToday = (lastNotificationDate) => {
    if (!lastNotificationDate) return false;

    const now = new Date();
    const todayStartLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    console.log("todayStart Local Time:", todayStartLocal.toLocaleString());   
    console.log("lastNotificationDate:", lastNotificationDate);

    return lastNotificationDate >= todayStartLocal;
} 


module.exports = { calculateSunPosition, hasNotificationBeenSentToday};
