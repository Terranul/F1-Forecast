const express = require('express');
const appService = require('./appService');
const f1apiService = require('./JolpiApi');
const predictionController = require('./controllers/predictionController');
const userController = require('./controllers/userController');
const sessionController = require('./controllers/sessionController');
const validationController = require('./controllers/validationController');
const oddsController = require('./controllers/oddsCategoryController')

const router = express.Router();

// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.
router.get('/check-db-connection', async (req, res) => {
    const isConnect = await appService.testOracleConnection();
    if (isConnect) {
        res.send('connected');
    } else {
        res.send('unable to connect');
    }
});

router.get('/demotable', async (req, res) => {-
    // return nothing becuase we don't have anything to fetch yet
    res.json({});
});

router.post("/initiate-demotable", async (req, res) => {
    //console.log('going to insert demotables')
    //const initiateResult = await appService.initiateDemotable();
    //console.log('finished inserting demotables')
    if (true) {
       //await appService.insertDemoData()
        //now test the db by inserting data after the fact
        await appService.testSqlStatements()
    //      await f1apiService.loadAllData(2026);
    //    await f1apiService.loadAllData(2025);
    //    await f1apiService.loadAllData(2024);
    //    await f1apiService.loadAllData(2023);
    //    await f1apiService.loadAllData(2022);
    //    await f1apiService.loadAllData(2021);
    //    await f1apiService.loadAllData(2020);
        //await appService.insertToTable("CATEGORY", {id: "c03", name: "testing"});
        //await appService.executeSql(`INSERT INTO TEAM (points, name, teamid, nationality) VALUES (150, 'Red Racers', 't01', 'USA')`)
        //const result = await appService.executeSql("SELECT * FROM SPRINT")
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/insert-demotable", async (req, res) => {
    const { id, name } = req.body;
    const insertResult = await appService.insertDemotable(id, name);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/update-name-demotable", async (req, res) => {
    const { oldName, newName } = req.body;
    const updateResult = await appService.updateNameDemotable(oldName, newName);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/count-demotable', async (req, res) => {
    const tableCount = await appService.countDemotable();
    if (tableCount >= 0) {
        res.json({ 
            success: true,  
            count: tableCount
        });
    } else {
        res.status(500).json({ 
            success: false, 
            count: tableCount
        });
    }
});

// new endpoints below

router.get('/users', userController.getUsers)
router.get('/users/:user', userController.getUser)
router.put('/users/:user', userController.putUser)
router.get('/users/:user/friends', userController.getUserFriends)
router.put('/users/:user/friends/:friend', userController.putFriend)

router.get('/users/:user/predictions', predictionController.getPredictions)
router.put('/users/:user/predictions/:prediction', predictionController.putPrediction)
router.get('/users/:user/predictions/:prediction/validate')

router.post('/users/:user/login', userController.loginUser)

// ones that work below

router.post('/category/:categoryid/odds', oddsController.getOdds)
router.get('/sessions/current', sessionController.getCurrentSession)


module.exports = router;