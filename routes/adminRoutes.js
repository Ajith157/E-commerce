const express =require("express");
const router=express.Router();
const adminController=require('../Controllers/adminController')
const multer=require('../multer/multer')
const auth=require('../middleware/auth.js')

router.get('/',adminController.getLogin)

router.post('/login',adminController.postLogin)

router.post('/logout',adminController.getLogout)

router.get('/userlist',adminController.getUserList)

router.get('/addproducts',adminController.getAddproduct)

router.post('/addproducts', multer.uploads, adminController.postAddproduct)


router.get('/editproduct/:id',adminController.getEditproduct)

// router.post('/editproduct/:id', multer.editeduploads, adminController.postEditproduct);


router.get('/productlist',auth.adminAuth,adminController.getProductList)

router.delete('/deleteproduct/:id',auth.adminAuth,adminController.deleteProduct)


router.get('/addcategory',auth.adminAuth,adminController.getAddcategory)

router.post('/addcategory',auth.adminAuth,adminController.postAddcategory)

router.get('/edit-category/:id',auth.adminAuth, adminController.getEditcategory)

router.patch('/edit-category/:id',auth.adminAuth, adminController.postEditcategory);


router.delete('/delete-category/:id',auth.adminAuth,adminController.deleteCategory)

router.get('/order-list/:id',auth.adminAuth,adminController.getOrderList)

router.route('/order-details').get(auth.adminAuth, adminController.getOrderDetails);













module.exports=router;