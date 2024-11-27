require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const converUtcToLocalTime = (utcTime, timeZoneOffsetMinutes) => {
    const utcDate = new Date(utcTime);
    const offsetMs = timeZoneOffsetMinutes * 60000; // Convert offset to milliseconds
    return new Date(utcDate.getTime() - offsetMs)
};

const getTimezoneFromCoordinates = async (latitude, longitude) => {
    const apiKey = "KEN3Z36N6RQ9";
    const url = `http://api.timezonedb.com/v2.1/get-time-zone?key=${apiKey}&format=json&by=position&lat=${latitude}&lng=${longitude}`;

    const response = await fetch(url);
    const data = await response.json();
    console.log("data", data);
    console.log("data:", data.formatted);
    
    if (data.status === "OK") {
        return data.gmtOffset;  // Hier bekommst du die Zeitzone als string, z.B. "Europe/Berlin"
    } else {
        throw new Error("Zeitzone konnte nicht ermittelt werden.");
    }
};

module.exports = { converUtcToLocalTime, getTimezoneFromCoordinates };