const oddsGenerator = require("../prediction-engine/race-odds")
const appService = require('../appService');

// category id's will be as follows
// - driverodds
// - teamraceodds
// - podiumodds

async function getOdds(req, res) {
    const categoryid = req.params.categoryid;
    console.log(categoryid)
    console.log(JSON.stringify(req.body))
    let response = {};
    try {
        switch (categoryid) {
            case "driverodds":
                const driverData = await oddsGenerator.calculateDriverOddsForRace(req.body.trackname, req.body.season);
                response = await formatResponse(driverData, categoryid);
                break;
            case "teamraceodds":
                const teamData = await oddsGenerator.getOddsForTopPoints(req.body.season);
                response = await formatResponse(teamData, categoryid);
                break;
            case "podiumodds":
                const podiumData = await oddsGenerator.getOddsForPodiums(req.body.season);
                response = await formatResponse(podiumData, categoryid);
                break;
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({error: "internal server error"})
        return;
    }
    res.status(200).json(response);
}

async function formatResponse(data, categoryid) {
    const categoryDesc = await getCategoryDesc(categoryid);
    return {
        description: categoryDesc,
        categoryid: categoryid,
        odds: data
    }
}

async function getCategoryDesc(categoryid) {
    const sql = `SELECT NAME 
                 FROM CATEGORY
                 WHERE CATEGORYID='${categoryid}'`
    const name = await appService.executeSql(sql);
    return name.rows[0].NAME
}

module.exports = {
    getOdds
}