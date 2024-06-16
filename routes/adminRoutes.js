const express =require("express");
const router=express.Router();
const adminController=require('../Controllers/adminController')
const multer=require('../multer/multer')
const auth=require('../middleware/auth.js')

//Route handler for rendering the login page.
router.get('/',adminController.getLogin)

//Route handler for processing login form submission.
router.post('/login',adminController.postLogin)

//Route handler for handling user logout.
router.post('/logout',adminController.getLogout)

// Route handler for retrieving the list of users (admin access required).
router.get('/userlist', adminController.getUserList);

//Route handler for rendering the add product page (admin access required).
router.get('/addproducts',adminController.getAddproduct)

//Route handler for adding a new product (admin access required).
router.post('/addproducts', multer.uploads, adminController.postAddproduct)

//Route handler for rendering the product edit page (admin access required).
router.get('/editproduct/:id',auth.adminAuth,adminController.getEditproduct)

//Route handler for handling the submission of product edit page (admin access required).
router.post('/editproduct/:id',auth.adminAuth, multer.editeduploads, adminController.postEditProduct);

//Route handler for fetching the list of products (admin access required).
router.get('/productlist',auth.adminAuth,adminController.getProductList)

//Route handler for deleting a product (admin access required).
router.delete('/deleteproduct/:id',auth.adminAuth,adminController.deleteProduct)

//Route handler for rendering the page to add a new category (admin access required).
router.get('/addcategory',auth.adminAuth,adminController.getAddcategory)

//Route handler for adding a new category (admin access required).
router.post('/addcategory',auth.adminAuth,adminController.postAddcategory)

//Route handler for getting the edit category page (admin access required).
router.get('/edit-category/:id',auth.adminAuth, adminController.getEditcategory)

//Route handler for edit category (admin access required)
router.patch('/edit-category/:id',auth.adminAuth, adminController.postEditcategory);

//Route handling for delete category (admin access required)
router.delete('/delete-category/:id',auth.adminAuth,adminController.deleteCategory)

//Route handling for fetching order list (admin access required)
router.get('/order-list/:id',auth.adminAuth,adminController.getOrderList)

//Route handling  for fetching order details (admin access required)
router.route('/order-details').get(auth.adminAuth, adminController.getOrderDetails);






module.exports=router;