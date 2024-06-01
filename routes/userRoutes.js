const userController=require('../Controllers/userController')
const cartController=require('../Controllers/cartController.js')
const orderController=require('../Controllers/orderController.js')
const express = require('express');
const router = express.Router();
const auth=require('../middleware/auth.js')



router.get('/',userController.getHome)

router.get('/shop', userController.getShop)

router.get('/login',userController. getLoginPage)

router.get('/signup',userController.getSignupPage)

router.post('/signup',userController.signupController)

router.post('/login',userController. handleLogin)

router.post("/logout", userController. handleLogout);

router.post('/forgot-password',userController. forgotPassword);

router.post('/reset/:token', userController.resetPassword);

router.get('/product-details/:id',auth.userAuth, userController.getProductdetails)

router.post('/add-to-cart/:id',auth.userAuth, cartController.addToCart)

router.get('/cart-list',auth.userAuth, cartController.getCart)

router.patch('/change-product-quantity',auth.userAuth, cartController.updateQuantity)

router.delete('/delete-product-cart', cartController.deleteProduct)

router.route('/add-address').post(auth.userAuth, orderController.postAddress)

router.get('/edit-address/:id', auth.userAuth, orderController.getEditAddress);

router.patch('/edit-address/:id', auth.userAuth, orderController.patchEditAddress);

router.route('/delete-address/:id').delete(auth.userAuth, orderController.deleteAddress)

router.get('/check-out', auth.userAuth, orderController.getcheckOut);

router.get('/check-out', auth.userAuth, orderController.getcheckOut)

router.post('/check-out', auth.userAuth, orderController.postCheckout)

router.get('/get-profile',auth.userAuth,orderController.getProfile);

router.post('/add-to-wishlist/:id',auth.userAuth,userController.addWishList);

router.get('/wishlist',auth.userAuth,userController.getWishlist)

router.route('/remove-product-wishlist').delete(auth.userAuth, userController.removeProductWishlist)

router.route('/change-user-data/:id').post(auth.userAuth, userController.changeUserData)











module.exports = router;
