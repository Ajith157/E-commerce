const express = require('express');
const cartHelper = require('../Helper/cartHelper');
const orderHelper=require('../Helper/orderHelper');


//Handles the POST request to add an item to the cart.

const addToCart = (req, res) => {
  try {
    let userId = req.session.user._id;

    cartHelper.addToCart(req.params.id, userId).then((response) => {
      res.json({ success: true, message: "Item successfully added to cart", data: response });
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


//Handles the GET request to retrieve cart data.

const getCart = async (req, res) => {
  try {
    let userId = req.session.user._id;
    let user = req.session.user;
    let count = await cartHelper.getCartCount(userId);
    let total = await orderHelper.totalCheckOutAmount(userId);
    let subTotal = await orderHelper.getSubTotal(userId);
    let cartItems = await cartHelper.getCartItems(userId);

    if (cartItems.length === 0) {
      return res.json({
        message: "No items in the cart",
        user: user,
        cartItems: [],
        count: count,
        total: total,
        subTotal: subTotal
      });
    }

    res.json({
      message: "Cart data retrieved successfully",
      user: user,
      cartItems: cartItems,
      count: count,
      total: total,
      subTotal: subTotal
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//Handles the POST request to update item quantity in the cart

const updateQuantity= (req, res) => {

  let userId = req.session.user._id;
  cartHelper.updateQuantity(req.body).then(async (response) => {
    response.total = await orderHelper.totalCheckOutAmount(userId)
    response.subTotal = await orderHelper.getSubTotal(userId)
    res.json(response)
  })
};

// Handles the POST request to delete a product from the cart.

const deleteProduct= (req, res) => {
  cartHelper.deleteProduct(req.body)
    .then((response) => {
      res.json(response); 
    })
    .catch((error) => {
      res.status(500).json({ error: error.message }); 
    });
}


module.exports={addToCart,getCart,updateQuantity,deleteProduct}














