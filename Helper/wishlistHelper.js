const {wishlistModel} = require('../models/Schema')
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');



const addWishList = async (userId, proId) => {
    try {
        const userWishList = await wishlistModel.findOne({ user: new ObjectId(userId) });

      
        
        if (userWishList) {
           
            const productExist = userWishList.find(wishListItem => wishListItem.productId.equals(new ObjectId(proId)));

            if (productExist) {
               
                return { status: false, message: "Product already exists in wishlist" };
            } else {
                
                await wishlistModel.updateOne(
                    { user: new ObjectId(userId) },
                    { $push: { wishList: { productId: new ObjectId(proId) } } }
                );
                return { status: true, message: "Product added to wishlist successfully" };
            }
        } else {
           
            const wishListData = {
                user: new ObjectId(userId),
                wishList: [{ productId: new ObjectId(proId) }]
            };
            const newWishList = new wishlistModel(wishListData);
            await newWishList.save();
            return { status: true, message: "Product added to wishlist successfully" };
        }
    } catch (error) {
        return { error: error.message };
    }
};

const getWishlistcount = (userId) => {
    return new Promise((resolve, reject) => {
        wishlistModel.findOne({ user: userId })
            .then((userWishlist) => {
                let count = 0;
                if (userWishlist) {
                    count = userWishlist.wishList.length;
                }
                resolve({ wishlistCount: count });
            })
            .catch((error) => {
                reject({ error: error.message });
            });
    });
};

const getWishlistProducts = (userId) => {
    return new Promise((resolve, reject) => {
        wishlistModel.aggregate([
            {
                $match: {
                    "user": new ObjectId(userId)
                }
            },
            {
                $unwind: "$wishList"
            },
            {
                $project: {
                    productId: "$wishList.productId",
                    createdAt: "$wishList.createdAt"
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "wishListed"
                }
            },
            {
                $project: {
                    productId: 1,
                    createdAt: 1,
                    wishListed: { $arrayElemAt: ["$wishListed", 0] }
                }
            }
        ])
        .then((wishListed) => {
            resolve(wishListed);
        })
        .catch((error) => {
            reject(error);
        });
    });
};

const removeProductWishlist = (proId, wishListId) => {
    return new Promise((resolve, reject) => {
        try {
            wishlistModel.updateOne(
                { _id: wishListId },
                {
                    $pull: { wishList: { productId: proId } }
                }
            )
            .then((response) => {
                if (response.nModified === 0) {
                    console.warn(`Product with ID ${proId} not found in wishlist ${wishListId}`);
                }
                resolve(response);
            })
            .catch((error) => {
                console.error('Error updating wishlist:', error);
                reject(new Error('Failed to update wishlist'));
            });
        } catch (error) {
            console.error('Unexpected error:', error);
            reject(new Error('An unexpected error occurred'));
        }
    });
};








module.exports={addWishList,
    getWishlistcount,
    getWishlistProducts,
    removeProductWishlist
    
}
