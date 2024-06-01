const express = require('express');
const { ObjectId } = require('mongoose').Types;
const mongoose = require('mongoose');
const adminHelper = require('../Helper/adminHelper');
const orderHelper=require('../Helper/orderHelper');
const userController=require('../Controllers/userController')
const { ProductModel, CategoryModel } = require('../models/Schema');
const {getPreviousImage}=require('../Helper/adminHelper')





const getLogin = (req, res) => {
    try {
        res.status(200).json({ message: 'Login page rendered successfully' });
    } catch (error) {
        console.error("Error in Rendering:", error);
        res.status(500).json({ success: false, message: "Failed in rendering." });
    }
}


const postLogin = (req, res) => {
    let data = req.body;
    adminHelper.doLogin(data).then((response) => {
        if (response) {
            req.session.admin = response;
            res.status(200).json({ message: 'Login successfully' });
        } else {
            console.error("Error in login :");
            res.status(500).json({ success: false, message: "Failed to login admin." });
        }
    });
};


const getLogout = (req, res) => {
    try {
        req.session.admin = null;
        res.status(200).json({ success: true, message: "Admin logged out successfully." });
    } catch (error) {
        console.error("Error in logout :", error);
        res.status(500).json({ success: false, message: "Failed to logout admin." });
    }
};


const getUserList = async (req, res) => {
    try {
        const admin = req.session.admin;

        const userData = await adminHelper.getUser();
        res.json(userData);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getAddproduct = (req, res) => {
    const admin = req.session.admin;

    if (admin) {
        res.json({ admin });
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
};



const postAddproduct = async (req, res) => {
    try {
        const files = req.files;

        if (!files) {
            return res.status(400).json({ success: false, message: "No files uploaded" });
        }

        const fileNames = files.map(file => file.filename);
        console.log(req.body, 'bbbbbbbbbbbb');
        const product = req.body;



        product.img = fileNames;

        await adminHelper.postAddproduct(product);
        res.status(200).json({ success: true, message: "Product added successfully." });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const getEditproduct = (req, res) => {
    const admin = req.session.admin;
    const proId = req.params.id;

     
    adminHelper.geteditproduct(proId)
        .then((product) => {
            if (product) {
                res.json(product);
            } else {
                res.status(404).json({ error: 'Product not found' });
            }
        })
        .catch((error) => {
            console.error('Error fetching product:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
};

// const postEditproduct = async (req, res) => {
  
//     console.log(req.params,'pppppppppppp');
//     console.log(req.files,'ffffffffffff');
//     const proId = req.params.id;
//     const files = req.files; 
//     const image = [];



//     try {
//         const previousImage = await getPreviousImage(proId);
      

//         // Ensure to loop through and replace only the existing images
//         for (let i = 0; i < 4; i++) {
//             if (files[i]) {
//                 image.push(files[i].filename);
//             } else {
//                 image.push(previousImage[i]);
//             }
//         }

//         await postEditproduct(proId, req.body, image);
//         res.status(200).json({ message: 'Product updated successfully' });
//     } catch (error) {
//         console.error('Error in postEditproduct:', error); // More detailed logging
//         res.status(500).json({ message: 'Failed to update product', error: error.message });
//     }
// };


const getProductList = async (req, res) => {
    try {

        if (!req.session || !req.session.admin) {
            return res.status(401).json({ error: 'Unauthorized admin' });
        }

        const products = await ProductModel.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const deleteProduct = (req, res) => {
    const proId = req.params.id;

    adminHelper.deleteProduct(proId)
        .then((response) => {
            res.status(200).json({ success: true, message: "Product deleted succefully" });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        });
};

const getAddcategory=async(req,res)=>{
    const admin=req.session.admin;
    const categories=await CategoryModel.category.find()

    res.json(categories)

}

const postAddcategory = (req, res) => {
    
    adminHelper.getAddCategory(req.body)
        .then((response) => {
            res.json(response);
        })
        .catch((error) => {
            console.error(error); 
            res.status(500).json({ status: false, message: "An error occurred", error: error });
        });
};

const getEditcategory=async(req,res)=>{
       
    const categoryId=req.params.id

    const response=await adminHelper.getEditcategory(categoryId)

    res.json(response)
}

const postEditcategory = async (req, res) => {
    const id = req.params.id;
    const { name, description } = req.body; 

    try {
        const updatedCategory = await adminHelper.postEditCategory(id, name, description);
        res.json(updatedCategory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const deleteCategory = async (req, res) => {
    const catId = req.params.id;

    try {
        const response = await adminHelper.deleteCategory(catId);
        if (response.status) {
            res.status(200).json({ success: true, message: "Category deleted successfully" });
        } else {
            res.status(404).json({ success: false, message: "Category not found" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "An error occurred while deleting the category", error: error.message });
    }
};

const getOrderList = async (req, res) => {
    try {
      const userId = req.params.id;
      const admin = req.session.admin;
  
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
  
      const user = await adminHelper.getUser(userId);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const { success, user: foundUser, orders } = await orderHelper.getOrders(userId);
  
      if (!success) {
        // If getOrders failed for some reason
        return res.status(500).json({ error: 'Failed to fetch orders', details: orders });
      }
  
      if (!orders || orders.length === 0) {
        // If user found but no orders
        return res.status(404).json({ error: 'No orders found for this user' });
      }
  
      res.json({ user, userId, admin, orders});
    } catch (error) {
      console.error('Unexpected error:', error);
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  };
  
  

const getOrderDetails= async (req, res) => {
    try {
        let admin = req.session.admin;
       
        let orderId = req.query.orderId
      
        let userId = req.query.userId
        console.log(orderId,userId,'qqqqqqqqqqqqqqqqqqqqq');
     

        if (!orderId || !userId) {
            return res.status(400).json({ error: "orderId and userId are required" });
        }

        let userDetails = await userController.getDetails(userId);
        console.log(userDetails,'ddddddddddddddd');

        let address = await orderHelper.getOrderAddress(userId, orderId);
        console.log(address,'aaaa');
        let orderDetails = await orderHelper.getSubOrders(orderId, userId);
        console.log(orderDetails,'rrrrrrrr');
        let product = await orderHelper.getOrderedProducts(orderId, userId);
        console.log(product,'ppppp');
        let productTotalPrice = await orderHelper.getTotal(orderId, userId);
        console.log(productTotalPrice,'tttttt');
        let orderTotalPrice = await orderHelper.getOrderTotal(orderId, userId);
        console.log(orderTotalPrice,'ooo');

        res.json({
            admin,
            userDetails,
            address,
            product,
            orderId,
            orderDetails,
            productTotalPrice,
            orderTotalPrice
        });

    } catch (error) {
        console.error("Error fetching order details:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}















module.exports = {
    getLogin,
    postLogin,
    getLogout,
    getUserList,
    getAddproduct,
    postAddproduct,
    getEditproduct,
   
    getProductList,
    deleteProduct,
    getAddcategory,
    postAddcategory,
    getEditcategory,
    postEditcategory,
    deleteCategory,
    getOrderList,
    getOrderDetails
    


}