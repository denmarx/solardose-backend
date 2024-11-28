require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const converUtcToLocalTime = (utcTime, timeZoneOffsetSeconds) => {
    const utcDate = new Date(utcTime);
    console.log("timezoneoffset in sec", timeZoneOffsetSeconds);
    const offsetMs = timeZoneOffsetSeconds * 1000; // Convert offset to milliseconds
    console.log("offsetinMs", offsetMs);
    console.log("local time:",utcDate.getTime() + offsetMs)
    return new Date(utcDate.getTime() + offsetMs)
};

const getLocalDateFromCoordinates = async (latitude, longitude) => {
    const apiKey = "KEN3Z36N6RQ9";
    const url = `http://api.timezonedb.com/v2.1/get-time-zone?key=${apiKey}&format=json&by=position&lat=${latitude}&lng=${longitude}`;

    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === "OK") {
        return data.timestamp;  
    } else {
        throw new Error("Zeitzone konnte nicht ermittelt werden.");
    }
};

module.exports = { converUtcToLocalTime, getLocalDateFromCoordinates };