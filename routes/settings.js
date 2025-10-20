var express = require('express');
var router = express.Router();

//controller require
const settingsController = require('../controller/settings');

router.get('/', settingsController.getSetting);
router.get('/getScheduleData', settingsController.getSchedule);
router.get('/getDeliveryData', settingsController.getDelivery);
router.post('/', settingsController.profileUpdate);
  
router.post('/deleteSchedule', settingsController.deleteSchedule);
router.post('/deleteMailDelivery', settingsController.deleteMailDelivery);

router.post('/getEditSchedule', settingsController.getEditSchedule);
router.post('/updateSchedule', settingsController.updateSchedule);
router.post('/smptpDetailsCreate', settingsController.smptpDetailsCreate);
router.post('/smptpDetailsUpdate', settingsController.smptpDetailsUpdate);

module.exports = router;