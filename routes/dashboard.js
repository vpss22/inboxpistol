var express = require('express');
var router = express.Router();

//controller require
const dashboardController = require('../controller/dashboard')

router.get('/', dashboardController.getDashboard);
router.get('/linkCount', dashboardController.chartData);

module.exports = router;