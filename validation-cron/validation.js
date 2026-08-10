const cron = require('node-cron');
const appService = require('../appService');
const jolpiApi = require("../JolpiApi")
const validation = require("./prediction-validation")
const userService = require("../services/userService");

// run at minute 0, hour 0 on Saturdays
cron.schedule("0 0 * * 6", () => {
    process.env.ALLOW_PREDICTIONS = false
})

// string means "run at minute 0, at hour 6, days and years are irrelevant, on day of the week 1 (Monday)"
cron.schedule("0 6 * * 1", async () => {
    await jolpiApi.loadCurSessionResults()
    await updateAllPredictions()
    // tell the server to begin allowing predictions to go through
    process.env.ALLOW_PREDICTIONS = true
})

async function updateAllPredictions() {
    // ensure we only validate predictions for which the race_session has occured already
    const sql = `SELECT *
                 FROM PREDICTION 
                 NATURAL JOIN RACE_SESSION
                 WHERE DATE_FILED >= :monDate AND SESSION_DATE < :curDate AND STATUS='O'`
    const predictions = appService.executeSqlBinding(sql, {monDate: getMonday(), curDate: new Date()})
    for (row of predictions.rows) {
        const categoryCode = row.CATEGORYID
        const validation = await validatePrediction(categoryCode, row.PREDICTIONID)
        const status = validation ? "C" : "F" // reminder C = completed, F = failed
        await appService.executeSql(`UPDATE TABLE PREDICTION SET STATUS='${status}' WHERE PREDICTIONID='${row.PREDICTIONID}'`)
        if (status == "C") {await updateUserScore(row)}
    }
}

// prediction is the actual prediction object from oracle, status is the new updated version
// Ben do not use the status value inside the prediction object, as it is likely labled as "O" (ongoing)
async function updateUserScore(prediction) {
    // immediatly when a user makes the prediction, the amount is already deducted from their account
    // this means we only need to worry about when the status is "C" to compensate the odd*wager value
    const compensatation = prediction.WAGER*prediction.ODDS_VALUE
    const username = userService.convertAppUserIdToUsername(prediction.APP_USERID)
    await userService.updateUserAmount(compensatation, username)
}

async function validatePrediction(categoryCode, predictionid) {
    switch(categoryCode) {
        case "driverodds":
            return (await validation.validateRaceOdds(predictionid)).validation
        case "teamraceodds":
            return (await validation.validateTopTeam(predictionid)).validation
        case "podiumodds":
            return (await validation.validatePodiumDrive(predictionid)).validation
        default:
            console.error("illegal categoryid/category code observed with prediction id: " + predictionid)
            return false
    }
}

function getMonday() {
    const currentNumber = new Date().getDay()
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date()
    monday.setDate(currentNumber + diff)
    monday.setHours(6, 5, 0, 0)
    return monday
}

