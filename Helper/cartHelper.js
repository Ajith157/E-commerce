const { response } = require('express');
const { ObjectId } = require("mongodb")
const {cartModel,ProductModel}=require('../models/Schema')


//Adds a product to the user's cart.

const addToCart = (proId, userId, size) => {
  const proObj = {
    productId: proId,
    quantity: 1,
    size: size, // Add size to the cart item
  };

  return new Promise(async (resolve, reject) => {
    try {
      const cart = await cartModel.findOne({ user: userId });

      if (cart) {
        const productExist = cart.cartItems.findIndex(cartItem => cartItem.productId == proId && cartItem.size == size);

        if (productExist !== -1) {
          const response = await cartModel.updateOne(
            { user: userId, "cartItems.productId": proId, "cartItems.size": size },
            { $inc: { "cartItems.$.quantity": 1 } }
          );
          resolve({ response, status: false });
        } else {
          const response = await cartModel.updateOne(
            { user: userId },
            { $push: { cartItems: proObj } }
          );
          resolve({ status: true });
        }
      } else {
        const newCart = new cartModel({
          user: userId,
          cartItems: [proObj]
        });
        const response = await newCart.save();
        resolve({ status: true });
      }
    } catch (error) {
      reject(error);
    }
  });
};


// Retrieves the count of items in the user's cart.

const getCartCount= (userId) => {
  return new Promise((resolve, reject) => {
    let count = 0;
    cartModel.findOne({ user: userId }).then((cart) => {
      if (cart) {
        count = cart.cartItems.length;
      }
      resolve({ count: count });
    }).catch(error => {
      reject({ message: error.message });
    });
  });
};

//Retrieves the items in the user's cart with details.

const getCartItems = (userId) => {
  return new Promise((resolve, reject) => {
    cartModel.aggregate([
      { $match: { user: new ObjectId(userId) } },
      { $unwind: "$cartItems" },
      {
        $project: {
          item: "$cartItems.productId",
          quantity: "$cartItems.quantity",
          size: "$cartItems.size" // Include size
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "item",
          foreignField: "_id",
          as: "carted"
        }
      },
      {
        $project: {
          item: 1,
          quantity: 1,
          size: 1, // Include size
          carted: { $arrayElemAt: ["$carted", 0] }
        }
      },
      {
        $project: {
          _id: 1,
          item: 1,
          quantity: 1,
          size: 1, // Include size
          "carted._id": 1,
          "carted.name": 1,
          "carted.description": 1,
          "carted.price": 1,
          "carted.category": 1,
          "carted.inventoryId": 1,
          "carted.deletedAt": 1,
          "carted.img": 1,
          "carted.createdAt": 1,
          "carted.modifiedAt": 1
        }
      }
    ]).then((cartItems) => {
      resolve(cartItems);
    }).catch(error => {
      reject({ message: error.message });
    });
  });
};



//Updates the quantity of a product in the user's cart.

const updateQuantity = async (data) => {
  try {
    const { cartId, proId, count, quantity } = data;

    if (count === -1 && quantity === 1) {
      await cartModel.updateOne(
        { _id: cartId },
        { $pull: { cartItems: { productId: proId } } }
      );
      return { status: true };
    } else {
      await cartModel.updateOne(
        { _id: cartId, "cartItems.productId": proId },
        { $inc: { "cartItems.$.quantity": count } }
      );

      const cart = await cartModel.findOne(
        { _id: cartId, "cartItems.productId": proId },
        { "cartItems.$": 1 }
      );

      if (!cart) {
        return { status: false, message: "Cart item not found" };
      }

      const newQuantity = cart.cartItems[0].quantity;
      return { status: true, newQuantity: newQuantity };
    }
  } catch (error) {
 
    return { status: false, message: error.message };
  }
};

//Deletes a product from the user's cart.

const deleteProduct= (data) => {
  let cartId = data.cartId
  let proId = data.proId

  return new Promise((resolve, reject) => {
    cartModel.updateOne(
      { _id: cartId },
      {
        $pull: { cartItems: { productId: proId } }
      })
      .then(() => {
        resolve({ status: true });
      })
      .catch((error) => {
        reject(error);
      });
  });
}


module.exports={addToCart,getCartCount,getCartItems,updateQuantity,deleteProduct}