const appService = require('../appService');

// generate odds for whether or not a specific driver will win the race -------------------------------------------------------------

const TOP_FINISHES_TO_CONSIDER = 5
const POSITION_WEIGHT = 1000

// finishes_to_consider details how many of the most recent overall and track specific finishes to consider when calculating
// position_weight details how much to multiply position values in the final equation
async function calculateRaceOdd(Driver_id, track_name) {
    const accumulatedPoints = await appService.executeSql(`SELECT ACCUMULATED_POINTS FROM DRIVER WHERE DRIVER_ID=${Driver_id}`);

    const sqlGetRecentFinishes = `SELECT POSITION 
                                  FROM RESULT r NATURAL JOIN RACE_SESSION s
                                  WHERE r.DRIVERID=${Driver_id}
                                  ORDER BY s.SESSIONDATE DESC
                                  FETCH FIRST ${TOP_FINISHES_TO_CONSIDER} ROWS ONLY`
    const recentFinishes = await appService.executeSql(sqlGetRecentFinishes);

    const sqlRecentFinishesOnTrack = `SELECT POSITION
                                      FROM RESULT r NATURAL JOIN RACE_SESSION s
                                      WHERE r.DRIVERID=${Driver_id} AND TRACKNAME=${track_name}
                                      ORDER BY s.SESSIONDATE DESC
                                      FETCH FIRST ${TOP_FINISHES_TO_CONSIDER} ROWS ONLY`
    const recentFinishesOnTrack = await appService.executeSql(sqlRecentFinishesOnTrack);

    // we want 1st place positions to be valued more, so we'll take the recipricol of each position 
    const pointsTotal = accumulatedPoints.reduce((acc, x) => {
        return acc + x.ACCUMULATED_POINTS
    }, 0)
    const recentFinishesTotal = recentFinishes.reduce((acc, x) => {
        return acc + transformPosition(x.POSITION)
    }, 0)
    const recentFinishesOnTrackTotal = recentFinishesOnTrack.reduce((acc, x) => {
        return acc + transformPosition(x.POSITION)
    }, 0)
    return pointsTotal + recentFinishesOnTrackTotal + recentFinishesTotal   
}

function transformPosition(value) {
    return 1/value * POSITION_WEIGHT
}

async function calculateDriverOddsForRace(track_name, season) {
    const oddsData = []
    const sqlActiveDrivers = `SELECT DRIVERID
                              FROM RESULT r NATURAL JOIN RACE_SESSION s
                              WHERE SEASON=${season} AND TRACKNAME=${track_name}`
    const activeDrivers = await appService.executeSql(sqlActiveDrivers);
    for (const driver_info of activeDrivers.rows) {
        const odds = await calculateRaceOdd(driver_info.DRIVER_ID, track_name);
        oddsData.push({id: driver_info.DRIVER_ID, odd: odds})
    }
    return formatOdds(oddsData)
}

// generate odds to for each team to win the most points in a given race ----------------------------------------------------------------

async function getTeamsForSeason(season) {
    const sql = `SELECT d.NAME, d.POINTS
                 FROM TAKEPART t NATURAL JOIN DRIVER d NATURAL JOIN RACE_SESSION s
                 WHERE s.SEASON=${season}
                 ORDER BY d.POINTS DESC`
    // NOTE: we don't need to worry about grouping by name, since each team should only appear once after filtering for season
    const dataResult = await appService.executeSql(sql)
    return dataResult.rows
}

// generate points for who will get the most points in a given race based on how many current points the have
async function getOddsForTopPoints(season) {
    const returnData = []
    const data = await getTeamsForSeason(season)
    const totalPointOverall = calculatePointsForAllTeams(data);
    for (const team of data) {
        const odds = team.POINTS/totalPointOverall;
        returnData.push({
            teamName: team.NAME,
            totalPoints: team.POINTS,
            odds: odds
        })
    }
    return returnData
}

function calculatePointsForAllTeams(data) {
    return data.reduce((acc, value) => {
        return acc  + value.POINTS
    })
}

// mentally prepare yourself before reading how I'm calculating odds
function formatOdds(data) {
    // the input is a list of numbers, that don't represent odds at all (they just rank who our model thinks will do well)
    // our odds format will be a number that represents your return for 1 point bet. (about to say dollar there...)
    // approach:
    // find the highest value (highest chance of winning) and set it's odds to 1.1
    // for each value after the highest value, find the multiplication factor and multiply this with the 1.1

    const sortedData = data.sort((a, b) => {
        return b.odd - a.odd;
    })

    const baseFactor = sortedData[0].odd

    sortedData.forEach((value) => {
        const factor = baseFactor / value.odd;
        value.odd = factor * 1.1
    })

    return sortedData
}

// generate odds for a driver to beat specific race time milestones ------------------------------------------------------------

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

// generate odds for whether a player will finish off of the podium ----------------------------------------------------------------

async function getPodiumDrivers(season) {
    const sql = `SELECT d.name, COUNT(*) AS podiums
                 FROM RESULT r NATURAL JOIN DRIVER d NATURAL JOIN RACE_SESSION s
                 WHERE r.position <= 3 AND s.season=${season}
                 GROUP BY d.name
                 HAVING COUNT(*) >= 5
                 ORDER BY podiums DESC`
    const frequentPodiums = await appService.executeSql(sql);
    return frequentPodiums.rows;
}

// odds represent the odds for a driver finishing off of the podium.
async function getOddsForPodiums(season) {
    const returnData = []
    const podiumData = await getPodiumDrivers(season);
    for (driver of podiumData) {
        returnData.push({
            name: DRIVER.NAME,
            careerPodiumFinishes: driver.PODIUMS,
            odds: driver.PODIUMS // potentially unbalanced but what the heck
        })
    }
    return podiumData
}


module.exports = {
    calculateDriverOddsForRace,
    getOddsForTopPoints,
    generateCircuitTimeOdds,
    getOddsForPodiums
}
