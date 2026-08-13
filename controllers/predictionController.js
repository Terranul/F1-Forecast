const oddsGenerator = require("../prediction-engine/race-odds")
const appService = require('../appService');
const validate = require('../validation-cron/validation')

// IMPORTANT SCHEMA INFO
// Each prediction has a primary key that consists of: TRACKNAME, SEASON, DRIVERID
// This is meant to point to the RACE_RESULT table

/*
    Format for req body: 
    {
        categoryid: string
        prediction_value: string, 
        wager: number
        season: number,
        trackname: string
    }
*/

async function putPrediction(req, res) {
    // Note: comment out the != null part if you want to manually block predictions for testing purposes
    if (process.env.ALLOW_PREDICTION != null && !process.env.ALLOW_PREDICTION) {
        return res.status(403).json({"message": "Making predictions is disabled between Saturday and Monday"})
    }
    const predictionInfo = req.body
    // populate the remaining fields
    predictionInfo["app_userid"] = req.params.user + "!userid"
    try {
        const odds = await oddsGenerator.getOddsForCategoryEntry(
                        predictionInfo.categoryid, 
                        predictionInfo.trackname, 
                        predictionInfo.season, 
                        predictionInfo.prediction_value)
        predictionInfo["date_filed"] = new Date()
        predictionInfo["time_filed"] = new Date // TODO becuase idk how to deal with timestamps
        predictionInfo["predictionid"] = new Date().toISOString() + req.params.user + predictionInfo.prediction_value
        predictionInfo["odds_value"] = odds.odds
        predictionInfo["status"] = "O"
        await appService.insertToTable("PREDICTION", predictionInfo)
        await editUserAmount(req.params.user, predictionInfo.wager)
        res.status(202).send()
    } catch(err) {
        console.log(err)
        res.status(400).json({error: "Invalid prediction target"})
    }
}

async function editUserAmount(user, wager) {
    const result = console.log(JSON.stringify(await appService.executeSql(`SELECT AMOUNT FROM SCORE WHERE ACC='${user}acc'`)))
    const userAmount = await appService.executeSql(`SELECT AMOUNT FROM SCORE WHERE ACC='${user}acc'`)
    const updatedAmount = userAmount.rows[0].AMOUNT - wager
    await appService.updateTable("SCORE", {"amount": updatedAmount}, {"acc": user+"acc"})

}

async function getPredictions(req, res) {
    const app_userid = req.params.user  + "!userid" ;
    const sql = `SELECT *
                 FROM PREDICTION a 
                 WHERE app_userid = :app_userid`;

    try { 
        const userPredictions = await appService.executeSqlBinding(sql, {app_userid: app_userid});
        res.status(200).json(userPredictions.rows)
    } catch {
        res.status(500).json({error: "internal server error"})
    }

}

async function deletePrediction(req, res) {
    const app_userid = req.params.user  + "!userid";
    const predictionid = req.params.prediction;
    const currentDate = new Date()
    const sql = `
        DELETE FROM PREDICTION
        WHERE app_userid = :appid
        AND predictionid = :predictionid
        AND (p.season, p.trackname) IN (
        SELECT season, trackname
        FROM RACE_SESSION
        WHERE sessiondate > :currentDate
    )
`;
    

    try {
        const result = await appService.executeSqlBinding(sql, {
            app_userid: app_userid,
            predictionid: predictionid,
            currentDate: currentDate
        });

        res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "internal server error" });
    }
}




async function updatePrediction(req, res) {
    const app_userid = req.params.user  + "!userid";
    const predictionid = req.params.prediction;
    const { prediction_value } = req.body;
    const currentDate = new Date()
    const sql = `
       UPDATE PREDICTION
        SET prediction_value = :value
        WHERE app_userid = :appid
        AND predictionid = :predictionid
        AND (p.season, p.trackname) IN (
        SELECT season, trackname
        FROM RACE_SESSION
        WHERE sessiondate > :currentDate
    )
`;
    

    try {
        const result = await appService.executeSqlBinding(sql, {
           value: prediction_value,
            app_userid: app_userid,
            predictionid: predictionid,
            currentDate: currentDate
        });

        res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "internal server error" });
    }
}

async function getPerfectPredictors(req, res) {
    try {
        const users = await validation.getPerfectPredictors();

        res.status(200).json({
            count: users.length,
            users: users
        });

    } catch (err) {
        console.log("Error fetching perfect predictors:", err);
        res.status(500).json({ error: "internal server error" });
    }
}

async function validatePredictions(req, res) {
    await validate.updateAllPredictions()
    res.status(200).send()
}



module.exports = {
    getPredictions,
    putPrediction,
    deletePrediction,
    updatePrediction,
    getPerfectPredictors,
    validatePredictions
}