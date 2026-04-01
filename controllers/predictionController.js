const express = require('express');
const appService = require('../appService');

/*
    Format for req body:
    {
        categoryid: string,
        app_userid: string,
        driverid: string,
        season: number,
        trackname: string,
        date_filed: string in YYYY-MM-DD form
        prediction_value: string
        time_filed: string in HH:MM:SS form
    }
*/
async function putPrediction(req, res) {
    const values = req.body;
    // the req.body already has everything except the prediction id
    values.predictionid = req.params.prediction;
    // quick check to make sure there are no missing fields
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
    const app_userid = req.params.user;
    const sql = `SELECT *
                 FROM APP_USER NATURAL JOIN PREDICTION
                 WHERE APP_USERID=${app_userid}`
    try {
        const userPredictions = await appService.executeSql(sql);
        res.status(200).json(userPredictions.rows)
    } catch {
        res.status(500).json({error: "internal server error"})
    }

}

module.exports = {
    getPredictions,
    putPrediction
}
