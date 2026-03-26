const appService = require('../appService');
const master = require('./odds-calculator')


const TOP_FINISHES_TO_CONSIDER = 5
const POSITION_WEIGHT = 1000

// finishes_to_consider details how many of the most recent overall and track specific finishes to consider when calculating
// position_weight details how much to multiply position values in the final equation
async function calculateRaceOdd(Driver_id, track_name) {
    const accumulatedPoints = await appService.executeSql(`SELECT ACCUMULATED_POINTS FROM DRIVER WHERE DRIVER_ID=${Driver_id}`);

    const sqlGetRecentFinishes = `SELECT POSITION 
                                  FROM RESULTS r NATURAL JOIN RACE_SESSION s
                                  WHERE r.DRIVER_ID=${Driver_id}
                                  ORDER BY s.SESSIONDATE DESC
                                  LIMIT ${TOP_FINISHES_TO_CONSIDER}`
    const recentFinishes = await appService.executeSql(sqlGetRecentFinishes);

    const sqlRecentFinishesOnTrack = `SELECT POSITION
                                      FROM RESULTS r NATURAL JOIN RACE_SESSION s
                                      WHERE r.DRIVER_ID=${Driver_id} AND s.TRACKNAME=${track_name}
                                      ORDER BY s.SESSIONDATE DESC
                                      LIMIT ${TOP_FINISHES_TO_CONSIDER}`
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
    const sqlActiveDrivers = `SELECT DRIVER_ID
                              FROM RESULTS r NATURAL JOIN RACE_SESSION s
                              WHERE SEASON=${season} AND TRACKNAME=${track_name}`
    const activeDrivers = await appService.executeSql(sqlActiveDrivers);
    for (const driver_info of activeDrivers.rows) {
        const odds = await calculateRaceOdd(driver_info.DRIVER_ID, track_name);
        oddsData.push({id: driver_info.DRIVER_ID, odd: odds})
    }
    return master.formatOdds(oddsData)
}
