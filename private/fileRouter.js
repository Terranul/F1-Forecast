const express = require('express');
const fileController = require('./fileController')

const router = express.Router();

router.get(['/file/prediction.html', '/file/prediction'], fileController.getPredictionPage)

router.get('/file/:file', fileController.getFile)

router.get('', fileController.getLandingPage)

module.exports = router;