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
    const now = new Date()
    // the req.body already has everything except the prediction id
    values.predictionid = req.params.prediction;
    values.app_userid = req.params.user + "!userid";
    values.time_filed = now;
    values.date_filed = now;
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
                 WHERE APP_USERID='${app_userid}!userid'`
    try {
        const userPredictions = await appService.executeSql(sql);
        res.status(200).json(userPredictions.rows)
    } catch {
        res.status(500).json({error: "internal server error"})
    }

}
// user can delete prediction before race DELETE

// async function deletePrediction(req, res) {
//     const app_userid = req.params.user;
//     const sql = `DELETE
//                  FROM PREDICTION
//                  WHERE APP_USERID='${app_userid}!userid' AND TRACKname =  // find a way to know when the next race is.`
//     try {
//         const removedPredictions = await appService.executeSql(sql);
//         res.status(200).json(removedPredictions.rows)
//     } catch {
//         res.status(500).json({error: "internal server error"})
//     }





// async function updatePrediction(req, res) {
//     const app_userid = req.params.user;
//     const sql = `UPDATE  PREDICTION
//                  SET  prediction_value = string,
//                  WHERE APP_USERID='${app_userid}!userid' 
// before allowing , will ask whether can update. 
//     try {
//         const removedPredictions = await appService.executeSql(sql);
//         res.status(200).json(removedPredictions.rows)
//     } catch {
//         res.status(500).json({error: "internal server error"})
//     }



module.exports = {
    getPredictions,
    putPrediction
}
