var express = require('express');
var router = express.Router();
const validate = require('../middlewares/validation.js')
const importSchema = require('../validation/import.js')

//controller require
const contactController = require('../controller/contacts');

router.get('/', contactController.getContacts);
router.get('/getContacts', contactController.getDesiredContacts);
router.post('/', contactController.postContacts);
router.post('/importContacts', contactController.postImportedContacts);

router.post('/deleteContact', contactController.deleteContacts);
router.post('/groupCreate', contactController.groupCreate);
router.post('/deleteGroup', contactController.deleteGroup);
router.post('/groupUpdate', contactController.groupUpdate);
router.post('/updateContact', contactController.updateContact);

router.get('/viewPage', contactController.viewPage);

module.exports = router;