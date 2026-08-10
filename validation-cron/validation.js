const cron = require('node-cron');
const appService = require('../appService');
const jolpiApi = require("../JolpiApi")
const validation = require("./validationScript")

// string means "run at minute 0, at hour 6, days and years are irrelevant, on day of the week 1 (Monday)"
cron.schedule("0 6 * * 1", async () => {
    await jolpiApi.loadCurSessionResults()

})

async function updateAllPredictions() {
    const predictions = appService.executeSql("SELECT * FROM PREDICTION WHERE ")
}

function getMonday() {
    const currentNumber = new Date().getDay()
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date()
    monday.setDate(currentNumber + diff)
    monday.setHours(6, 5, 0, 0)
    return monday
}

function getSunday() {
    const currentNumber = new Date().getDay()
    const diff = day === 0 ? 0 : 1 - day;
}


