const bcrypt = require('bcrypt');

const { AdminModel, ProductModel, CategoryModel } = require('../models/Schema');
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


const getUser = async (req, res) => {
    try {
        return new Promise(async (resolve, reject) => {
            let userData = [];
            await db.UserModel.find().exec().then((result) => {
                userData = result;
            });
            resolve(userData);

        });
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

const geteditproduct = (proId) => {
    return new Promise((resolve, reject) => {
        try {
            ProductModel.findById(proId).then((product) => {
                if (product) {
                    resolve(product);
                } else {
                    console.log('Product not found');
                }
            });
        } catch (error) {
            throw error;
        }
    });
};

// const getPreviousImage = (proId) => {
//     console.log(proId,'5555555555555');
//     return new Promise((resolve, reject) => {
//         ProductModel.findOne({ _id: proId })
//             .then((response) => {
//                 console.log(response,'rrrrrrrrrrrr');
//                 if (response) {
//                     resolve(response.img);
//                 } else {
//                     reject(new Error('Product not found'));
//                 }
//             })
//             .catch((error) => {
//                 reject(error);
//             });
//     });
// };

// const postEditproduct = (proId, product, image) => {
//     return new Promise((resolve, reject) => {
//         ProductModel.updateOne(
//             { _id: proId },
//             {
//                 $set: {
//                     name: product.name,
//                     description: product.description,
//                     price: product.price,
//                     category: product.category,
//                     img: image
//                 }
//             }
//         )
//         .then((response) => {
//             if (response) {
//                 resolve(response);
//             } else {
//                 reject(new Error('Product update failed'));
//             }
//         })
//         .catch((error) => {
//             reject(error);
//         });
//     });
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

// const postEditcategory = (data) => {
//     return new Promise((resolve, reject) => {
//         try {
//             ProductModel.findByIdAndUpdate(
//                 data._id,
//                 { category: data.category },
//                 { new: true }
//             ).then((updatedProduct) => {
//                 if (updatedProduct) {
//                     resolve(updatedProduct);
//                 } else {
//                     reject(new Error("Product not found"));
//                 }
//             }).catch((err) => {
//                 reject(err);
//             });
//         } catch (error) {
//             reject(error);
//         }
//     });
// };

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




module.exports = { doLogin, getUser,postAddproduct,geteditproduct,deleteProduct,getAddCategory,deleteCategory };
