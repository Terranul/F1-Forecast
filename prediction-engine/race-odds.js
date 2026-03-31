const appService = require('../appService');

// generate odds for whether or not a specific driver will win the race -------------------------------------------------------------

const TOP_FINISHES_TO_CONSIDER = 5
const POSITION_WEIGHT = 1000

// finishes_to_consider details how many of the most recent overall and track specific finishes to consider when calculating
// position_weight details how much to multiply position values in the final equation
async function calculateRaceOdd(Driver_id, track_name) {
    let sql = `SELECT ACCUMULATEDPOINTS FROM DRIVER WHERE DRIVERID=${Driver_id}`
    const accumulatedPoints = await appService.executeSql(sql);

    sql = `SELECT SUM(POSITION) AS TOTAL_TRACK_POSITION
           FROM DRIVER NATURAL JOIN RACE_RESULT r
           WHERE DRIVERID=${Driver_id} AND r.TRACKNAME=${track_name}
           ORDER BY r.SESSIONDATE DESC
           FETCH FIRST ${MAX_RACES_TO_CONSIDER} ROWS ONLY`
    const recentFinishesOnTrack = await appService.executeSql(sql)

    sql = `SELECT SUM(POSITION) AS TOTAL_POSITION 
           FROM DRIVER NATURAL JOIN RACE_RESULT r
           WHERE DRIVERID=${Driver_id}
           ORDER BY r.SESSIONDATE DESC
           FETCH FIRST ${MAX_RACES_TO_CONSIDER} ROWS ONLY`
    const recentFinishes = await appService.executeSql(sql)

    if (recentFinishesOnTrack.rows.length === 0 || recentFinishes.rows.length === 0) {
        return 0;
    }
    
    // larger position scores mean a driver did worse, so we'll fix this by taking the recipricol and multiplying by a constant
    return transformPosition(accumulatedPoints.rows[0].ACCUMULATEDPOINTS)
           + transformPosition(recentFinishesOnTrack.rows[0].TOTAL_TRACK_POSITION)
           + transformPosition(ecentFinishes.rows[0].TOTAL_POSITION)
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
// this one is a simple calculation, just looking at the total points for every team

async function getTeamsForSeason(season) {
    const sql = `SELECT t.NAME AS NAME, t.POINTS AS POINTS
                 FROM TAKEPART NATURAL JOIN DRIVER d NATURAL JOIN TEAM t
                 WHERE SEASON=${season}
                 GROUP BY t.NAME, t.POINTS`
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
    // we cannot output a pure DAY TO SECOND interval, becuase node.js cannot handle it
    // we will avg over the interval as seconds, and then convert back to DAY TO SECOND, then convert back to hour:minute:second
    // I think average over an interval is illegal, or I just wasted my time
    const sql = `
       SELECT
            FLOOR(EXTRACT(DAY FROM avg_time)*24 + EXTRACT(HOUR FROM avg_time)) AS AVG_HOURS,
            EXTRACT(MINUTE FROM avg_time) AS AVG_MINUTES,
            EXTRACT(SECOND FROM avg_time) AS AVG_SECONDS
       FROM (
            SELECT
                NUMTODSINTERVAL(
                AVG(
                    EXTRACT(DAY FROM TOTALTIME)*86400 +
                    EXTRACT(HOUR FROM TOTALTIME)*3600 +
                    EXTRACT(MINUTE FROM TOTALTIME)*60 +
                    EXTRACT(SECOND FROM TOTALTIME)
                ),
                'SECOND'
            ) AS avg_time
            FROM RACE_RESULTS NATURAL JOIN RACE_SESSION
            WHERE SEASON = ${season} AND TRACKNAME = ${trackName}
      )
)`;
    const result = await appService.executeSql(sql);
    return result.rows[0]
}

/**
 * Gets the minimum total circuit time for a specific season and track
 */
async function getLowestCircuitTime(season, trackName) {
    const sql = `
        SELECT
            FLOOR(EXTRACT(DAY FROM MIN_TIME)*24 + EXTRACT(HOUR FROM avg_time)) AS MIN_HOURS,
            EXTRACT(MINUTE FROM MIN_TIME) AS AVG_MINUTES,
            EXTRACT(SECOND FROM MIN_TIME) AS AVG_SECONDS
        FROM (
            SELECT MIN(TOTALTIME) AS MIN_TIME
            FROM RACE_RESULTS NATURAL JOIN RACE_SESSION
            WHERE SEASON = ${season} AND TRACKNAME = ${trackName}
        )
    `;
    const result = await appService.executeSql(sql);
    return result.rows[0]
}

// Gets the maximum total circuit time for a specific season and track
async function getHighestCircuitTime(season, trackName) {
    const sql = `
        SELECT
            FLOOR(EXTRACT(DAY FROM MAX_TIME)*24 + EXTRACT(HOUR FROM avg_time)) AS MAX_HOURS,
            EXTRACT(MINUTE FROM MAX_TIME) AS AVG_MINUTES,
            EXTRACT(SECOND FROM MAX_TIME) AS AVG_SECONDS
        FROM (
            SELECT MAX(TOTALTIME) AS MAX_TIME
            FROM RACE_RESULTS NATURAL JOIN RACE_SESSION
            WHERE SEASON = ${season} AND TRACKNAME = ${trackName}
        )
    `;
    const result = await appService.executeSql(sql);
    return result.rows[0]
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
            hours: fastestCircuitTime.MAX_HOURS,
            minutes: fastestCircuitTime.MAX_MINUTES,
            seconds: fastestCircuitTime.MAX_SECONDS,
            over: BASE_BET_VALUE * extremityRatio,
        },
        slowestCircuit: {
            hours: slowestCircuitTime.MIN_HOURS,
            minutes: slowestCircuitTime.MIN_MINUTES,
            seconds: slowestCircuitTime.MIN_SECONDS,
            under: BASE_BET_VALUE * extremityRatio,
        },
        avgCircuit: {
            hours: avgCircuitTime.AVG_HOURS,
            minutes: avgCircuitTime.AVG_MINUTES,
            seconds: avgCircuitTime.AVG_SECONDS,
            over: BASE_BET_VALUE,
            under: BASE_BET_VALUE,
        }
    };
}

// generate odds for whether a player will finish off of the podium ----------------------------------------------------------------

async function getPodiumDrivers(season) {
    const sql = `SELECT FIRSTNAME || ' ' || LASTNAME AS FULLNAME, COUNT(*) AS PODIUMS
                 FROM RESULT NATURAL JOIN DRIVER
                 WHERE SEASON=${season} AND POSITION <= 3
                 GROUP BY DRIVERID
                 HAVING COUNT(*) >= 5
                 ORDER BY PODIUMS DESC`
    const frequentPodiums = await appService.executeSql(sql);
    return frequentPodiums.rows;
}

// odds represent the odds for a driver finishing off of the podium.
async function getOddsForPodiums(season) {
    const returnData = []
    const podiumData = await getPodiumDrivers(season);
    for (driver of podiumData) {
        returnData.push({
            name: DRIVER.FULLNAME,
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
