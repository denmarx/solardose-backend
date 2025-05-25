require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { DateTime } = require('luxon');

const getLocalDateFromCoordinates = async (latitude, longitude) => {
    const apiKey = "KEN3Z36N6RQ9";
    const url = `http://api.timezonedb.com/v2.1/get-time-zone?key=${apiKey}&format=json&by=position&lat=${latitude}&lng=${longitude}`;

    try { 
        
        const response = await fetch(url);
        
        const contentType = response.headers.get("content-type");
        if (!response.ok || !contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            throw new Error(`Unexpected response from TimeZoneDB: ${response.status} ${text.slice(0, 100)}`);
        }
        
        const data = await response.json();
        
        if (data.status === "OK") {
            return {
                localDate: data.timestamp,
                timezone: data.zoneName
            };  
        } else {
            throw new Error("API error: " + data.message);
        }
    } catch (err) {
        console.error("getLocalDateFromCoordinates failed:", err.message);
        throw err;
    }
};

// Get the start of the day in the user's time zone
const getStartOfDayTimestamp = (date, userTimeZone) => {
    return DateTime.fromJSDate(date, { zone: userTimeZone })
        .startOf('day')
        .toMillis(); // Returns timestamp in milliseconds
};

const hasNotificationBeenSentToday = (lastNotificationDate, userTimeZone) => {
    if (!lastNotificationDate) return false;

    const now = new Date();
    const todayStartTimestamp = getStartOfDayTimestamp(now, userTimeZone);
    const lastNotificationTimestamp = lastNotificationDate * 1000; // Convert to milliseconds
    // Zeige timestamp in ms an
    console.log("todayStartTimestamp:", todayStartTimestamp);
    console.log("lastNotificationTimestamp:", lastNotificationTimestamp);
    // Zeige timestamp in lesbarer Form, in UTC (Serverzeit) an (oder auch GMT)	
    console.log("todayStart", (new Date(todayStartTimestamp)).toLocaleString());
    console.log("lastNotification:", (new Date(lastNotificationTimestamp)).toLocaleString());

    return lastNotificationTimestamp >= todayStartTimestamp;
} 


module.exports = { hasNotificationBeenSentToday, getLocalDateFromCoordinates };