const express = require('express');
const fileController = require('./fileController')

const router = express.Router();

router.get('/dashboard/f1-info', fileController.getF1Info)

module.exports = router;