const appService = require('../appService');
const master = require('./odds-calculator')

const MAX_RACES_TO_CONSIDER = 5

// the odds for betting the over/under on the avg lap time
const BASE_BET_VALUE_ = 1.5

// takes the average of all lap times for a specific course
//
async function getAverageLapTime(season, trackName) {
    const sqlAverageTime = `SELECT AVG(TOTALTIME)
                            FROM RESULTS r NATURAL JOIN RACE_SESSION s
                            WHERE s.SEASON=${season} AND s.TRACKNAME=${trackName}
                            ORDER BY s.SEASON DESC
                            LIMIT ${MAX_RACES_TO_CONSIDER}`
    const result = await appService.executeSql(sqlAverageTime)
    return results.rows[0][AVG(TOTALTIME)]
}   

async function getLowestLapTime(season, trackName) {
    const sqlLowestTime = `SELECT MIN(TOTALTIME)
                            FROM RESULTS r NATURAL JOIN RACE_SESSION s
                            WHERE s.SEASON=${season} AND s.TRACKNAME=${trackName}
                            ORDER BY s.SEASON DESC
                            LIMIT ${MAX_RACES_TO_CONSIDER}`
    const result = await appService.executeSql(sqlLowestTime)
    return results.rows[0][MIN(TOTALTIME)]
}

async function getFastestLapTime(season, trackName) {
    const sqlFastestTime = `SELECT MAX(TOTALTIME)
                            FROM RESULTS r NATURAL JOIN RACE_SESSION s
                            WHERE s.SEASON=${season} AND s.TRACKNAME=${trackName}
                            ORDER BY s.SEASON DESC
                            LIMIT ${MAX_RACES_TO_CONSIDER}`
    const result = await appService.executeSql(sqlFastestTime)
    return results.rows[0][MIN(TOTALTIME)]
}

// extremityRation represents how much more you will win if you bet under on the slowest lap, or over on the fastest lap
async function generateLapOdds(extremityRatio, season, trackName) {
    // only the avg will have both an over and under, the slowest lap time will have an under, and the fastest will have an over
    const fastestTime = await getFastestLapTime(season, trackName);
    const avgTime = await getAverageLapTime(season, trackName);
    const slowestTime = await getLowestLapTime(season, trackName);
    return {
        fastestLap: {
            value: fastestTime,
            over: BASE_BET_VALUE_*extremityRatio,
        },
        slowestLap: {
            value: slowestTime,
            under: BASE_BET_VALUE_*extremityRatio,
        },
        avgLap: {
            value: avgTime,
            over: BASE_BET_VALUE_,
            under: BASE_BET_VALUE_,
        }
    }

}

