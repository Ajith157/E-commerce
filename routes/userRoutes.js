const userController=require('../Controllers/userController')
const cartController=require('../Controllers/cartController.js')
const orderController=require('../Controllers/orderController.js')
const express = require('express');
const router = express.Router();
const auth=require('../middleware/auth.js')


//Route handler for rendering the home page.
router.get('/',userController.getHome)

//Route handling for rendering the shoping page.
router.get('/shop', userController.getShop)

//Route handler for rendering the login page.
router.get('/login',userController. getLoginPage)

//Route handler for rendering the signup page.
router.get('/signup',userController.getSignupPage)

//Route handler for post user data.
router.post('/signup',userController.signupController)

//Route handler for post user login data.
router.post('/login',userController. handleLogin)

//Route handler for hadling user logout.
router.post("/logout", userController. handleLogout);

//Route handler for handling forgot password.
router.post('/forgot-password',userController. forgotPassword);

//Route handler for handling reset password.
router.post('/reset/:token', userController.resetPassword);

//Route handler for fetching product details (user access required)
router.get('/product-details/:id', userController.getProductdetails)

//Route handler for handling add to cart funtionality (use access required)
router.post('/add-to-cart/:id', cartController.addToCart)

//Route handler for fetching cart product list (user access required)
router.get('/cart-list',auth.userAuth, cartController.getCart)

//Route handler for change the product quantity from the cart (user access required)
router.patch('/change-product-quantity',auth.userAuth, cartController.updateQuantity)

//Route handler for delete product from the cart (user access required)
router.delete('/delete-product-cart', cartController.deleteProduct)

//Route handler for add address of the user (user access required)
router.route('/add-address').post(auth.userAuth, orderController.postAddress)

//Route handler for fetching address page to edit address (user access required)
router.get('/edit-address/:id', auth.userAuth, orderController.getEditAddress);

//Route handler for edit user address (user access required)
router.patch('/edit-address/:id', auth.userAuth, orderController.patchEditAddress);

//Route handler for delete address of user (user access required)
router.route('/delete-address/:id').delete(auth.userAuth, orderController.deleteAddress)

//Route handler for fetching checkout (user access required)
router.get('/check-out', auth.userAuth, orderController.getcheckOut);

//Route handler for post checkout (user access required)
router.post('/check-out', auth.userAuth, orderController.postCheckout)


router.route('/verify_payment').post(auth.userAuth, orderController.verifyPayment)


//Route handler for get profile details (user access required)
router.get('/get-profile',auth.userAuth,orderController.getProfile);

//Route handler for wishlist product (user access required)
router.post('/add-to-wishlist/:id',auth.userAuth,userController.addWishList);

//Route handler for fetching wishlist products (user access required)
router.get('/wishlist',auth.userAuth,userController.getWishlist)

//Route handler for delete wishlist product (user access required)
router.route('/remove-product-wishlist').delete(auth.userAuth, userController.removeProductWishlist)

//Route handler for change user data (user access required)
router.route('/change-user-data/:id').post(auth.userAuth, userController.changeUserData)

//Route handler for sorting products (user access required)
router.get("/sort/:id", auth.userAuth, userController.sort)

router.route('/cancel-order/').post( orderController.cancelOrder)

router.route('/return-order/').post(orderController.returnOrder)















module.exports = router;
