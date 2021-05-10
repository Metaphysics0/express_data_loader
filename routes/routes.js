const express = require('express');
const router = express.Router();
const { sendDataDB, query, sendToAws } = require('../controllers/dataCtrl');

router.put('/load-data', sendDataDB);
router.get('/query', query);
router.put('/store', sendToAws);

module.exports = router;
