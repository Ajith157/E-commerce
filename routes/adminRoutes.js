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
router.get('/editproduct/:id',adminController.getEditproduct)

//Route handler for handling the submission of product edit page (admin access required).
router.post('/editproduct/:id', multer.editeduploads, adminController.postEditProduct);

//Route handler for fetching the list of products (admin access required).
router.get('/productlist',adminController.getProductList)

//Route handler for deleting a product (admin access required).
router.delete('/deleteproduct/:id',adminController.deleteProduct)

//Route handler for rendering the page to add a new category (admin access required).
router.get('/addcategory',adminController.getAddcategory)

//Route handler for adding a new category (admin access required).
router.post('/addcategory',adminController.postAddcategory)

//Route handler for getting the edit category page (admin access required).
router.get('/edit-category/:id', adminController.getEditcategory)

//Route handler for edit category (admin access required)
router.patch('/edit-category/:id', adminController.postEditcategory);

//Route handling for delete category (admin access required)
router.delete('/delete-category/:id',adminController.deleteCategory)

//Route handling for fetching order list (admin access required)
router.get('/order-list/:id',adminController.getOrderList)

//Route handling  for fetching order details (admin access required)
router.route('/order-details').get(adminController.getOrderDetails);






module.exports=router;