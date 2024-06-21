const express = require('express');
const { ObjectId } = require('mongoose').Types;
const mongoose = require('mongoose');
const adminHelper = require('../Helper/adminHelper');
const orderHelper=require('../Helper/orderHelper');
const userHelper=require('../Helper/userHelper')
const userController=require('../Controllers/userController')
const { ProductModel, CategoryModel } = require('../models/Schema');
const {getPreviousImage}=require('../Helper/adminHelper')



//Sends a JSON response for the login page request.

const getLogin = (req, res) => {
    try {
        res.status(200).json({ message: 'Login page rendered successfully' });
    } catch (error) {
        console.error("Error in Rendering:", error);
        res.status(500).json({ success: false, message: "Failed in rendering." });
    }
}

//Handles the POST request for the login process.

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

// Handles the GET request for the logout process.

const getLogout = (req, res) => {
    try {
        req.session.admin = null;
        res.status(200).json({ success: true, message: "Admin logged out successfully." });
    } catch (error) {
        console.error("Error in logout :", error);
        res.status(500).json({ success: false, message: "Failed to logout admin." });
    }
};

//Handles the GET request to retrieve the list of all users.

const getUserList = async (req, res) => {
    
    try {
        const admin = req.session.admin;
      

        const userData = await adminHelper.getAllUsers();
        res.json(userData);
        
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

//Handles the GET request to render the add product page.



const getAddproduct = (req, res) => {
    const admin = req.session.admin;
   
   
    if (admin) {
        res.json({ admin });
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

//Handles the POST request to add a new product.

const postAddproduct = async (req, res) => {
    try {
        const files = req.files;

        if (!files) {
            return res.status(400).json({ success: false, message: "No files uploaded" });
        }

        const fileNames = [];
        ['image1', 'image2', 'image3', 'image4'].forEach(field => {
            if (files[field]) {
                fileNames.push(files[field][0].filename);
            }
        });

        const product = req.body;

        product.img = fileNames;

        // Ensure sizes are provided in the request body
        if (!product.sizes || !Array.isArray(product.sizes) || product.sizes.length === 0) {
            return res.status(400).json({ success: false, message: "Sizes are required" });
        }

        await adminHelper.postAddproduct(product);
        res.status(200).json({ success: true, message: "Product added successfully." });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


//Handles the GET request to retrieve a product for editing


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

 //Handles the POST request to update a product.

 const postEditProduct = async (req, res) => {
    try {
        
        const proId = req.params.id;
        const files = req.files;
        const image = [];

   
        if (!proId) {
            throw new Error('Product ID is undefined');
        }

        const previousImage = await getPreviousImage(proId);

        for (let i = 0; i < 4; i++) {
            if (files && files[`image${i+1}`]) { 
                image.push(files[`image${i+1}`][0].filename);
            } else {
                image.push(previousImage[i]);
            }
        }

        await adminHelper.updateProduct(proId, req.body, image);
      
        res.status(200).json({ message: 'Product updated successfully' });
    } catch (error) {
        console.error('Error in postEditProduct:', error);
        res.status(500).json({ message: 'Failed to update product', error: error.message });
    }
};

// Handles the GET request to retrieve the list of products.

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

// Handles the DELETE request to delete a product.

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

//Handles the GET request to retrieve categories for adding a new category.

const getAddcategory=async(req,res)=>{
    const admin=req.session.admin;
    const categories=await CategoryModel.find()

    res.json(categories)

};

// Handles the POST request to add a new category.

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

//Handles the GET request to retrieve category details for editing.

const getEditcategory=async(req,res)=>{
       
    const categoryId=req.params.id

    const response=await adminHelper.getEditcategory(categoryId)

    res.json(response)
}

// Handles the POST request to update a category.

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

// Handles the DELETE request to delete a category.

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

//Handles the GET request to retrieve the list of orders for a user.

const getOrderList = async (req, res) => {
    try {
      const userId = req.params.id;
      const admin = req.session.admin;

      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
  
      const user = await userHelper.getUser(userId);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const { success, user: foundUser, orders } = await orderHelper.getOrders(userId);
  
      if (!success) {
        
        return res.status(500).json({ error: 'Failed to fetch orders', details: orders });
      }
  
      if (!orders || orders.length === 0) {
       
        return res.status(404).json({ error: 'No orders found for this user' });
      }
  
      res.json({ user, userId, orders});
    } catch (error) {
      console.error('Unexpected error:', error);
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  };
  
//Handles the GET request to retrieve order details.

const getOrderDetails= async (req, res) => {
    try {
        let admin = req.session.admin;
       
        let orderId = req.query.orderId
      
        let userId = req.query.userId
     
     

        if (!orderId || !userId) {
            return res.status(400).json({ error: "orderId and userId are required" });
        }

        let userDetails = await userController.getDetails(userId);
     

        let address = await orderHelper.getOrderAddress(userId, orderId);
     
        let orderDetails = await orderHelper.getSubOrders(orderId, userId);
  
        let product = await orderHelper.getOrderedProducts(orderId, userId);
     
        let productTotalPrice = await orderHelper.getTotal(orderId, userId);
  
        let orderTotalPrice = await orderHelper.getOrderTotal(orderId, userId);
     

        res.json({
            
            userDetails,
            address,
            product,
            admin,
            orderId,
            orderDetails,
            productTotalPrice,
            orderTotalPrice
        });

    } catch (error) {
        console.error("Error fetching order details:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


















module.exports = {
    getLogin,
    postLogin,
    getLogout,
    getUserList,
    getAddproduct,
    postAddproduct,
    getEditproduct,
    postEditProduct,
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