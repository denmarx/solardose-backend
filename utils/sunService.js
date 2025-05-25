const SunCalc = require('suncalc');

const calculateSunPosition = (latitude, longitude) => {
    const sunPosition = SunCalc.getPosition(new Date(), latitude, longitude);
    const sunAltitudeinDegrees = sunPosition.altitude * (180 / Math.PI);
    return sunAltitudeinDegrees;
}

// cicles through the next 365 days to find the next date when the sun reaches 45 degrees altitude
// by checking the solar noon time for each day
const doesSunReach45Degrees = (latitude, longitude) => {
    const currentDate = new Date();
    const endDate = new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate());
    let dateToCheck = new Date(currentDate);
    let nextPossibleDate = null;

    while (dateToCheck <= endDate) {
        const sunPosition = SunCalc.getTimes(dateToCheck, latitude, longitude);
        const noonTime = new Date(sunPosition.solarNoon); // Solar noon for the day
        const sunAltitude = SunCalc.getPosition(noonTime, latitude, longitude).altitude * (180 / Math.PI); // In degrees
        // if the sun altitude is greater than or equal to 45 degrees, we found the next possible date
        if (sunAltitude >= 45) {
            nextPossibleDate = dateToCheck;
            break;
        }
        // Increment by 1 day
        dateToCheck.setDate(dateToCheck.getDate() + 1);
    }
    console.log("nextpossible date", nextPossibleDate);

    return {    
        sunReaches45Degrees: !!nextPossibleDate,
        nextPossibleDate
    };
};

module.exports = { calculateSunPosition, doesSunReach45Degrees};
