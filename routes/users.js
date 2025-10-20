var express = require('express');
var router = express.Router();

//require controllers
const userController = require('../controller/users');

/* GET home page. */
router.get('/', userController.getLogin);
router.post('/', userController.loginUser);

router.get('/register', userController.getRegister);
router.post('/register', userController.registerUser);

router.get('/forgot-password', userController.getForgotPassword);
router.post('/forgot-password', userController.postForgotPassword);

router.get('/logout', (req, res)=>{
  res.redirect('/')
})

module.exports = router;
