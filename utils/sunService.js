const SunCalc = require('suncalc');
const {DateTime} = require('luxon');

const calculateSunPosition = (latitude, longitude) => {
    const sunPosition = SunCalc.getPosition(new Date(), latitude, longitude);
    const sunAltitudeinDegrees = sunPosition.altitude * (180 / Math.PI);
    return sunAltitudeinDegrees;
}

// Get the start of the day in the user's time zone
const getStartOfDayTimestamp = (date, userTimeZone) => {
    return DateTime.fromJSDate(date, { zone: userTimeZone })
        .startOf('day')
        .toMillis(); // Returns timestamp in milliseconds
};

// const getStartOfDayTimestamp = (date) => {
//     const d = new Date(date);
//     return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).getTime();
// };

const hasNotificationBeenSentToday = (lastNotificationDate) => {
    if (!lastNotificationDate) return false;

    const now = new Date();
    // const todayStartLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayStartTimestamp = getStartOfDayTimestamp(now, 'America/Los_Angeles');
    const lastNotificationTimestamp = lastNotificationDate * 1000; // Convert to milliseconds
    console.log("todayStartTimestamp:", todayStartTimestamp);
    console.log("lastNotificationTimestamp:", lastNotificationTimestamp);

    return lastNotificationTimestamp >= todayStartTimestamp;
} 


module.exports = { calculateSunPosition, hasNotificationBeenSentToday};
