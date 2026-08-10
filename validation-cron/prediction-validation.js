const appService = require('../appService');
const oddsGenerator = require("./race-odds")

/*
    Whenever a user prediction is created we'll make sure to link it to it's specific category type
    FUTURE BEN THIS SHIT IMPORTANT: make sure name attribute in the category matches the values in the switch below

    The predictionvalue attribute in the Prediciton table will be a code to match the action the user made on the prediction
    Example: 'OVER' for better over on odds, and inversely 'UNDR'
    This is a probably a bad idea...
*/

async function validateRaceOdds(predictionid) {
    const sql = `SELECT POSITION, FIRSTNAME || ' ' || LASTNAME AS FULLNAME, ODDS_VALUE
                 FROM PREDICTION NATURAL JOIN DRIVER NATURAL JOIN RACE_SESSION NATURAL JOIN RACE_RESULT
                 WHERE PREDICTIONID=${predictionid}`
    // since each result is unique to it's driver and session, we will only get one tuple in return
    const positionResult = await appService.executeSql(sql);
    // check if racer finished first
    if (positionResult.rows.length === 0) {throw new Error("no data")}

    if(1 === positionResult.rows[0].POSITION) {
        return {
            validation: true,
            odds: positionResult.rows[0].ODDS_VALUE,
            position: 1,
            name: positionResult.rows[0].FULLNAME
        }
    } else {
        return {
            validation: false,
            odds: positionResult.rows[0].ODDS_VALUE,
            position: positionResult.rows[0].POSITION,
            name: positionResult.rows[0].FULLNAME
        }
    }
}

async function validateTopTeam(predictionid) {
    let sql = `SELECT SUM(POINTS) AS TOTAL_POINTS, NAME
               FROM TEAM NATURAL JOIN DRIVER NATURAL JOIN RACE_SESSION NATURAL JOIN RACE_RESULT NATURAL JOIN PREDICTION
               WHERE PREDICTIONID=${predictionid}
               GROUP BY NAME
               ORDER BY TOTAL_POINTS DESC`
    const teamByPoints = await appService.executeSql(sql);
    // we'll now find the team that the query is about and then check if it matches the top entry
    sql = `SELECT NAME, ODDS_VALUE
           FROM PREDICTION NATURAL JOIN DRIVER NATURAL JOIN TEAM
           WHERE PREDICTIONID=${predictionid}`
    const teamName = await appService.executeSql(sql);
    if (teamByPoints.rows.length === 0 || teamName.rows.length === 0) {throw new Error("no data")}

    if (teamName[0].NAME === teamByPoints[0].NAME) {
        return {
            validation: true,
            odds: teamName.rows[0].ODDS_VALUE,
            teamName: teamName.rows[0].NAME,
            points: teamByPoints.rows[0].TOTAL_POINTS
        }
    } else {
        return {
            validation: false,
            odds: teamName.rows[0].ODDS_VALUE,
            teamName: teamName.rows[0].NAME,
            points: teamByPoints.rows.find((value) => {
                return value.NAME === teamName.rows[0].NAME
            })
        }
    }
}

// TODO: this one is a bit challenging 
async function validateCircuitTimes(predictionid) {
    
}

async function validatePodiumDrive(predictionid) {
    const sql = `SELECT POSITION, FIRSTNAME || ' ' || LASTNAME AS FULLNAME, RACE_ODDS
                 FROM RACE_RESULT NATURAL JOIN DRIVER NATURAL JOIN RACE_SESSION NATURAL JOIN PREDICTION
                 WHERE PREDICTIONID=${predictionid}`
    const driverResult = await appService.executeSql(sql)
    if (driverResult.rows[0].POSITION <= 3) {
        return {
            validation: true,
            odds: driverResult.rows[0].ODDS_VALUE,
            position: driverResult.rows[0].POSITION,
            name: driverResult.rows[0].FULLNAME
        }
    } else {
       return {
            validation: false,
            odds: driverResult.rows[0].ODDS_VALUE,
            position: driverResult.rows[0].POSITION,
            name: driverResult.rows[0].FULLNAME
        } 
    }
}


module.exports = {
    validateCircuitTimes,
    validateRaceOdds,
    validateTopTeam,
    validatePodiumDrive,
}

