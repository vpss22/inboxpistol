var express = require('express');
var multer = require('multer');
var path = require('path');
var router = express.Router();

//controller require
const campaignController = require('../controller/campaigns')

//multer use
var maxSize = 1*500;
var storageVal = multer.diskStorage(
    {
        destination: 'public/uploads/',
        filename: function ( req, file, cb ) { 
            cb( null,Date.now()+path.extname(file.originalname));
        }
    }
);
var upload = multer( { storage: storageVal, limits:{size : maxSize}});

router.get('/', campaignController.getCampaigns);
router.get('/getFilteredCampaigns', campaignController.getFilteredCampaigns);

router.get('/create-campaign', campaignController.getCreateCampaigns);
router.post('/create-campaign', campaignController.postCreateCampaigns);

router.post('/dataLink', campaignController.dataLink);

router.get('/create-campaign/:id', campaignController.campaignId);
router.post('/image',upload.single('img') , campaignController.imageSave);

router.post('/deleteCampaign', campaignController.campaignDelete);
router.post('/previewTemplate', campaignController.previewTemplate);

router.get('/link/:id', campaignController.getLink);
router.post('/mailSend', campaignController.mailSend);

module.exports = router;