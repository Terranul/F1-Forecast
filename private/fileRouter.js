const express = require('express');
const fileController = require('./fileController')

const router = express.Router();

router.get('/file/:file', fileController.getFile)

module.exports = router;