const appService = require('../appService');


async function getPodiumDrivers() {
    const sql = `SELECT d.name, COUNT(*) AS podiums
                 FROM RESULT r NATURAL JOIN DRIVER d
                 WHERE r.position <= 3
                 GROUP BY d.name
                 HAVING COUNT(*) >= 5
                 ORDER BY podiums DESC`
    const frequentPodiums = await appService.executeSql(sql);
    return frequentPodiums.rows;
}

// odds represent the odds for a driver finishing off of the podium.
async function getOddsForPodiums() {
    const returnData = []
    const podiumData = await getPodiumDrivers();
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
    getOddsForPodiums
}