const bcrypt = require('bcrypt');

const { AdminModel, ProductModel, CategoryModel,UserModel } = require('../models/Schema');
const { Promise } = require('mongoose');
const { response } = require('express');

//Performs login for admin users.

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

// Retrieves all users from the database.


const getAllUsers = async () => {
    try {
        const usersData = await UserModel.find({}).exec();
      
        return usersData;
      
    } catch (error) {
        console.log(error.message);
        throw new Error('Error fetching users');
    }
};

//Adds a new product to the database.

const postAddproduct = async (data) => {
    try {
        const product = new ProductModel(data);
        await product.save();
    } catch (error) {
        console.error(error.message);
        throw new Error('Error saving the product');
    }
};


//Retrieves product details for editing.

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

//Retrieves previous images of a product.

const getPreviousImage = async (proId) => {
    try {
      const response = await ProductModel.findOne({ _id: proId });
      return response.img;
    } catch (error) {
      console.log(error.message);
      throw error;
    }
};
  
//Updates product details.

const updateProduct = async (proId, product, image) => {

 
    try {
        const response = await ProductModel.updateOne(
            { _id: proId },
            {
                $set: {
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    category: product.category,
                    inventoryId: product.inventoryId,
                    img: image
                }
            }
        );
          
        if (response) {
            return response;
        } else {
            throw new Error('Product update failed');
        }
    } catch (error) {
        throw error;
    }
};


//Deletes a product.


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

// Adds a new category.

const getAddCategory = async (data) => {
    try {
      
      
        const category = await CategoryModel.findOne({ name: data.name });
        
        if (!category) {
            const newCategory = new CategoryModel(data);
           await newCategory.save();
            return { status: true, message: "Category added successfully" };
        } else {
           
            return { status: false, message: "Category already exists" };
        }
    } catch (error) {
        console.error(error); 
        throw { status: false, message: "An error occurred", error: error };
    }
};

//Fetches category details for editing.

const getEditcategory=async(categoryId)=>{

    try {
        
        return await CategoryModel.findById(categoryId)
    } catch (error) {
        console.log(error.message);
    }

};

// Updates category details.

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


//Deletes a category by its ID.

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
     getAllUsers,
     postAddproduct,
     geteditproduct,
     postEditCategory, 
     getEditcategory,
     deleteProduct,
     getPreviousImage,
     getAddCategory,
     deleteCategory,
     updateProduct };
