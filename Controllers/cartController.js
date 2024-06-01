const express = require('express');
const cartHelper = require('../Helper/cartHelper');
const orderHelper=require('../Helper/orderHelper');




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



const getCart=async (req, res) => {


  try {
    let userId = req.session.user._id;
    let user = req.session.user;
    let count = await cartHelper.getCartCount(userId);
    let total = await orderHelper.totalCheckOutAmount(userId);
    let subTotal = await orderHelper.getSubTotal(userId);
    let cartItems = await cartHelper.getCartItems(userId);

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

const updateQuantity= (req, res) => {

  let userId = req.session.user._id;
  cartHelper.updateQuantity(req.body).then(async (response) => {
    response.total = await orderHelper.totalCheckOutAmount(userId)
    response.subTotal = await orderHelper.getSubTotal(userId)
    res.json(response)
  })
};

const deleteProduct= (req, res) => {
  cartHelper.deleteProduct(req.body)
    .then((response) => {
      res.json(response); // Sending response as JSON
    })
    .catch((error) => {
      res.status(500).json({ error: error.message }); // Sending error response as JSON
    });
}


module.exports={addToCart,getCart,updateQuantity,deleteProduct}














