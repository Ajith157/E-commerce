const express = require('express');
const { ObjectId } = require('mongoose').Types;
const mongoose = require('mongoose');
const adminHelper = require('../Helper/adminHelper');
const { ProductModel, CategoryModel } = require('../models/Schema');





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

//   const postEditproduct = async (req, res) => {
//     console.log(req.params, 'pppppppppp');
//     console.log(req.files, 'fffffffffffff');

//     const proId = req.params.id;
//     const file = req.files;
//     const image = [];
//     console.log(image, 'iiiiiiiiiiiii');

//     try {
//         const previousImage = await adminHelper.getPreviousImage(proId);
//         console.log(previousImage, 'sssssssssssss');

//         if (req.files.image1) {
//             image.push(req.files.image1[0].filename);
//         } else {
//             image.push(previousImage[0]);
//         }
//         if (req.files.image2) {
//             image.push(req.files.image2[0].filename);
//         } else {
//             image.push(previousImage[1]);
//         }
//         if (req.files.image3) {
//             image.push(req.files.image3[0].filename);
//         } else {
//             image.push(previousImage[2]);
//         }
//         if (req.files.image4) {
//             image.push(req.files.image4[0].filename);
//         } else {
//             image.push(previousImage[3]);
//         }

//         await adminHelper.postEditproduct(proId, req.body, image);
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

// const postEditcategory=async(req,res)=>{

//     const response=adminHelper.postEditcategory(data).then((response)=>{})
        
//     res.json(response)
    
// };

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
    deleteCategory
    


}