const express = require('express');
const appService = require('./appService');
const f1apiService = require('./JolpiApi');

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
    console.log('going to insert demotables')
    const initiateResult = await appService.initiateDemotable();
    console.log('finished inserting demotables')
    if (true) {
       await appService.insertDemoData()
        // now test the db by inserting data after the fac
        // awt
        await appService.testSqlStatements()
        await f1apiService.loadAllData(2026);
        await appService.insertToTable("CATEGORY", {id: "c03", name: "testing"});
        const result = await appService.executeSql("SELECT * FROM SPRINT")
        console.log(result)
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


module.exports = router;