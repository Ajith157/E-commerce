const userController=require('../Controllers/userController')
const express = require('express');
const router = express.Router();
const auth=require('../middleware/auth.js')



router.get('/login',userController. getLoginPage)

router.get('/signup',userController.getSignupPage)

router.post('/signup',userController.signupController)

router.post('/login',userController. handleLogin)

router.post("/logout", userController. handleLogout);

router.post('/forgot-password',userController. forgotPassword);

router.post('/reset/:token', userController.resetPassword);






module.exports = router;
