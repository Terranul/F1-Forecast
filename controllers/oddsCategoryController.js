const oddsGenerator = require("../prediction-engine/race-odds")
const appService = require('../appService');

// category id's will be as follows
// - driverodds
// - teamraceodds
// - podiumodds

async function getOdds(req, res) {
    const categoryid = req.params.categoryid;

    console.log(categoryid);
    console.log(JSON.stringify(req.body));

    try {
        const rawData = await oddsGenerator.getOddsForCategory(
            categoryid,
            req.body.trackname ?? null,
            req.body.season
        );

        const response = await formatResponse(rawData, categoryid);

        res.status(200).json(response);
    } catch (error) {
        console.log(error);

        if (error.message.startsWith('Unknown category')) {
            return res.status(400).json({ error: 'invalid category' });
        }

        return res.status(500).json({ error: 'internal server error' });
    }
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