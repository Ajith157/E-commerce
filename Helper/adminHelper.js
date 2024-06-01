const bcrypt = require('bcrypt');

const { AdminModel, ProductModel, CategoryModel,UserModel } = require('../models/Schema');
const { Promise } = require('mongoose');
const { response } = require('express');


const doLogin = async (data) => {
    try {
        

        let username = data.username;

        let admin = await AdminModel.findOne({ username: username });

        if (admin) {
            let loginTrue = await bcrypt.compare(data.password, admin.password);

            if (loginTrue) {
                return admin;
            } else {
                return false;
            }
        } else {
            return false;
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};


const getUser = async (req, res, userId) => {
    try {
        const userData = await UserModel.findOne({ userId }).exec();
        return userData;
      
    } catch (error) {
        console.log(error.message);
    }
};



const postAddproduct = async (data) => {
    try {
       
        const product = new ProductModel(data);
        await product.save();
    } catch (error) {
        console.error(error.message);
        throw new Error('Error saving the product');
    }
};

const geteditproduct = async (proId) => {
    try {
      
        const product = await ProductModel.findById(proId);
      
        if (product) {
            return product;
        } else {
            console.log('Product not found');
            return null; 
        }
    } catch (error) {
        console.error(error);
        throw new Error('Error retrieving the product');
    }
};


// const getPreviousImage = async (proId) => {
//     console.log(proId, '5555555555555');
//     try {
//         const response = await ProductModel.findOne({ _id: proId });
//         console.log(response, 'rrrrrrrrrrrr');
//         if (response) {
//             return response.img;
//         } else {
//             throw new Error('Product not found');
//         }
//     } catch (error) {
//         throw error;
//     }
// };


// const postEditproduct = async (proId, product, image) => {
//     try {
//         const response = await ProductModel.updateOne(
//             { _id: proId },
//             {
//                 $set: {
//                     name: product.name,
//                     description: product.description,
//                     price: product.price,
//                     category: product.category,
//                     inventoryId: product.inventoryId,
//                     img: image
//                 }
//             }
//         );

//         if (response.nModified > 0) {
//             return response;
//         } else {
//             throw new Error('Product update failed');
//         }
//     } catch (error) {
//         throw error;
//     }
// };




const deleteProduct = async (proId) => {
    try {
        const response = await ProductModel.findByIdAndDelete(proId);
        if (response) {

            return(response)
        } else {
            return { status: false, error: 'Product not found' };
        }
    } catch (error) {
        throw error;
    }
};

const getAddCategory = async (data) => {
    try {
      
      
        const category = await CategoryModel.findOne({ name: data.name });
        
        if (!category) {
            const newCategory = new CategoryModel(data);
           await newCategory.save();
            return { status: true, message: "Category added successfully" };
        } else {
            console.log('Category already exists');
            return { status: false, message: "Category already exists" };
        }
    } catch (error) {
        console.error(error); 
        throw { status: false, message: "An error occurred", error: error };
    }
};

const getEditcategory=async(categoryId)=>{

    try {
        
        return await CategoryModel.findById(categoryId)
    } catch (error) {
        console.log(error.message);
    }

};

const postEditCategory = async (id, name, description) => {
    try {
        const updatedCategory = await CategoryModel.findByIdAndUpdate(
            id,
            { name: name, description: description },
            { new: true }
        );

        if (updatedCategory) {
            return updatedCategory;
        } else {
            throw new Error("Category not found");
        }
    } catch (error) {
        throw error;
    }
};




const deleteCategory = async (catId) => {
    try {
        const res = await CategoryModel.findByIdAndDelete(catId);
        if (res) {
            return { status: true };
        } else {
            return { status: false };
        }
    } catch (error) {
        console.log(error.message);
        throw error; 
    }
};




module.exports = { doLogin,
     getUser,
     postAddproduct,
     geteditproduct,
     postEditCategory, 
     getEditcategory,
     deleteProduct,
     getAddCategory,
     deleteCategory };
