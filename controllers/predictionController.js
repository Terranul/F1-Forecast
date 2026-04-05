const express = require('express');
const appService = require('../appService');

/*
    Format for req body:
    {
        categoryid: string,
        driverid: string,
        season: number,
        trackname: string,
        prediction_value: string,
        odds_value: number,
    }
*/
async function putPrediction(req, res) {
    const values = req.body;
     values.app_userid = req.params.user + "!userid";
     if (Object.keys(values).length !== 10) {
        res.status(422).json({error: "missing a required field"});
        return;
    }
    try {
        await appService.insertToTable("PREDICTION", values)
        res.status(200).json(values);
    } catch (err) {
        console.log("error when putting prediction:" + err)
        res.status(500).json({error: "internal server error"})
        return
    }
}

async function getPredictions(req, res) {
    const app_userid = req.params.user  + "!userid" ;
    const sql = `SELECT *
                 FROM APP_USER a 
                JOIN PREDICTION p
                ON a.app_userid = p.app_userid
                WHERE APP_USERID= :app_userid`;

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
module.exports = {
    getPredictions,
    putPrediction,
    deletePrediction,
    updatePrediction,
    getPerfectPredictors
}