const appService = require('../appService');
const master = require('./odds-calculator')

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

module.exports = {
    getOddsForTopPoints
}