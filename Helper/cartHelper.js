const { response } = require('express');
const { ObjectId } = require("mongodb")
const {cartModel,ProductModel}=require('../models/Schema')

const addToCart= (proId, userId) => {
  const proObj = {
    productId: proId,
    quantity: 1,
  };

  return new Promise(async (resolve, reject) => {
    try {
      const cart = await cartModel.findOne({ user: userId });

      if (cart) {
        const productExist = cart.cartItems.findIndex(cartItem => cartItem.productId == proId);

        if (productExist !== -1) {
          const response = await cartModel.updateOne(
            { user: userId, "cartItems.productId": proId },
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

const getCartItems= (userId) => {
  return new Promise((resolve, reject) => {
    cartModel.aggregate([
      { $match: { user: new ObjectId(userId) } },
      { $unwind: "$cartItems" },
      {
        $project: {
          item: "$cartItems.productId",
          quantity: "$cartItems.quantity"
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
          carted: { $arrayElemAt: ["$carted", 0] }
        }
      },
    ]).then((cartItems) => {
      resolve(cartItems);
    }).catch(error => {
      reject({ message: error.message });
    });
  });
};

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
    // Handle error
    return { status: false, message: error.message };
  }
};

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