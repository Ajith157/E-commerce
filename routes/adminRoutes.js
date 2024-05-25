const express =require("express");
const router=express.Router();
const adminController=require('../Controllers/adminController')
const multer=require('../multer/multer')


router.get('/',adminController.getLogin)

router.post('/login',adminController.postLogin)

router.post('/logout',adminController.getLogout)

router.get('/userlist',adminController.getUserList)

router.get('/addproducts',adminController.getAddproduct)

router.post('/addproducts', multer.uploads, adminController.postAddproduct)


router.get('/editproduct/:id',adminController.getEditproduct)

// router.post('/editproduct/:id', multer.editeduploads, adminController.postEditproduct);

router.get('/productlist',adminController.getProductList)

router.delete('/deleteproduct/:id',adminController.deleteProduct)


router.get('/addcategory',adminController.getAddcategory)

router.post('/addcategory',adminController.postAddcategory)

router.get('/edit-category/:id', adminController.getEditcategory)

// router.patch('/edit-category/:id', adminController.postEditcategory)

router.delete('/delete-category/:id',adminController.deleteCategory)












module.exports=router;