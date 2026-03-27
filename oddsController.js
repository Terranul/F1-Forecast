const oddsGenerator = require("./prediction-engine/race-odds")

async function getPodiumOdds(req, res) {
    const oddsData = await oddsGenerator.getOddsForPodiums()
    res.status(200).json(oddsData);
}

// the date format from the jolpi api exactly matches the date format in sql
/*
extremityRatio: how much more do you want predictions that bet a track record will be broken by a player compared to betting that that player
                will beat or fail against the average time overall of the circuit
*/
async function getRaceTimeOdds(req, res) {
    const {extremityRatio, season, trackName} = req.body
    if (extremityRatio == undefined || season === undefined || trackName === undefined) {
        req.status(400).json({errorMsg: "missing a required field"})
        return
    }
    const oddsData = await oddsGenerator.generateCircuitTimeOdds(extremityRatio, season, trackName)
    res.status(200).json(oddsData)
}

async function getTopTeamsPointsOdds(req, res) {
    const season = req.body.season
    if (season === undefined) {
         req.status(400).json({errorMsg: "missing a required field"})
         return
    }
    const oddsData = await oddsGenerator.getOddsForTopPoints(season)
    res.status(200).json(oddsData)
}

async function getRaceWinnerOdds(req, res) {
    const {driverId, season} = req.body
    if (driverId === undefined || trackName === undefined) {
        req.status(400).json({errorMsg: "missing a required field"})
        return
    }
    const oddsData = await oddsGenerator.calculateDriverOddsForRace(trackName, season)
    res.status(200).json(oddsData)
}

module.exports = {
    getPodiumOdds,
    getRaceTimeOdds,
    getRaceWinnerOdds,
    getTopTeamsPointsOdds
}