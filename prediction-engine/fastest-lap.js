const appService = require('../appService');
const master = require('./odds-calculator');

const MAX_RACES_TO_CONSIDER = 5;

// base bet value for over/under on total circuit time
const BASE_BET_VALUE = 1.5;

// Gets the average total circuit time for a specific season and track
async function getAverageCircuitTime(season, trackName) {
    const sql = `
        SELECT AVG(TOTALTIME) AS avg_total_time
        FROM RESULTS r 
        NATURAL JOIN RACE_SESSION s
        WHERE s.SEASON=${season} AND s.TRACKNAME='${trackName}'
        ORDER BY s.SEASON DESC
        FETCH FIRST ${MAX_RACES_TO_CONSIDER} ROWS ONLY
    `;
    const result = await appService.executeSql(sql);
    return result.rows[0]['AVG_TOTAL_TIME'];
}

/**
 * Gets the minimum total circuit time for a specific season and track
 */
async function getLowestCircuitTime(season, trackName) {
    const sql = `
        SELECT MIN(TOTALTIME) AS min_total_time
        FROM RESULTS r 
        NATURAL JOIN RACE_SESSION s
        WHERE s.SEASON=${season} AND s.TRACKNAME='${trackName}'
        ORDER BY s.SEASON DESC
        FETCH FIRST ${MAX_RACES_TO_CONSIDER} ROWS ONLY
    `;
    const result = await appService.executeSql(sql);
    return result.rows[0]['MIN_TOTAL_TIME'];
}

// Gets the maximum total circuit time for a specific season and track
async function getHighestCircuitTime(season, trackName) {
    const sql = `
        SELECT MAX(TOTALTIME) AS max_total_time
        FROM RESULTS r 
        NATURAL JOIN RACE_SESSION s
        WHERE s.SEASON=${season} AND s.TRACKNAME='${trackName}'
        ORDER BY s.SEASON DESC
        FETCH FIRST ${MAX_RACES_TO_CONSIDER} ROWS ONLY
    `;
    const result = await appService.executeSql(sql);
    return result.rows[0]['MAX_TOTAL_TIME'];
}

/**
 * Generates over/under odds based on total circuit times
 * extremityRatio: multiplier for extreme bets (fastest/slowest)
 */
async function generateCircuitTimeOdds(extremityRatio, season, trackName) {
    const fastestCircuitTime = await getHighestCircuitTime(season, trackName);
    const avgCircuitTime = await getAverageCircuitTime(season, trackName);
    const slowestCircuitTime = await getLowestCircuitTime(season, trackName);

    return {
        fastestCircuit: {
            value: fastestCircuitTime,
            over: BASE_BET_VALUE * extremityRatio,
        },
        slowestCircuit: {
            value: slowestCircuitTime,
            under: BASE_BET_VALUE * extremityRatio,
        },
        avgCircuit: {
            value: avgCircuitTime,
            over: BASE_BET_VALUE,
            under: BASE_BET_VALUE,
        }
    };
}

module.exports = {
    generateCircuitTimeOdds
};
