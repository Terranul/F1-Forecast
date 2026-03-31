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
    const sql = `SELECT r.POSITION 
                 FROM PREDICTION p NATURAL JOIN RACE_SESSION s NATURAL JOIN DRIVER d NATURAL JOIN RESULT r
                 WHERE p.PREDICTIONID=${predictionid}`
    // since each result is unique to it's driver and session, we will only get one tuple in return
    const positionResult = await appService.executeSql(sql);
    // check if racer finished first
    return 1 === positionResult[0].POSITION
}

async function validateTotalTime(predictionid) {
    let sql = `SELECT p.VALUE
                 FROM PREDICTION p
                 WHERE p.PREDICTIONID=${predictionid}`
    const targetDescription = await appService.executeSql(sql);
    sql = `SELECT TO_CHAR(r.TOTALTIME) AS TIME
           FROM PREDICTION p NATURAL JOIN RACE_SESSION s NATURAL JOIN DRIVER d NATURAL JOIN RESULT r
           WHERE p.PREDICTIONID=${predictionid}`
    const resultTime = await appService.executeSql(sql)
    // recompute the boundaries so we have access to them
    const raceBoundaries = await oddsGenerator.generateCircuitTimeOdds();
    switch (targetDescription[0].VALUE) {
        case "SLOWESTTIME": 

    }
}

// TODO (once we know the format of the prediction value)
function convertIntervalToString() {

}

