const SunCalc = require('suncalc');

const calculateSunPosition = (latitude, longitude) => {
    const sunPosition = SunCalc.getPosition(new Date(), latitude, longitude);
    const sunAltitudeinDegrees = sunPosition.altitude * (180 / Math.PI);
    return sunAltitudeinDegrees;
}

const getStartOfDayTimestamp = (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).getTime();
};

const hasNotificationBeenSentToday = (lastNotificationDate) => {
    if (!lastNotificationDate) return false;

    const now = new Date();
    // const todayStartLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayStartTimestamp = getStartOfDayTimestamp(now);
    console.log("todayStartTimestamp:", todayStartTimestamp);
    console.log("lastNotificationTimestamp:", lastNotificationDate);

    return lastNotificationDate >= todayStartTimestamp;
} 


module.exports = { calculateSunPosition, hasNotificationBeenSentToday};
