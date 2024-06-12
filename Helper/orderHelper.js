const express = require('express')
const { ObjectId } = require('mongodb')
const {cartModel,addressModel,orderModel,ProductModel,UserModel} = require('../models/Schema')
const mongoose = require('mongoose'); 

//Calculates the total checkout amount for a user's cart.

const totalCheckOutAmount= (userId) => {
    return new Promise((resolve, reject) => {
      cartModel.aggregate([
        {
          $match: { user: new ObjectId(userId) }
        },
        {
          $unwind: "$cartItems"
        },
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
            product: { $arrayElemAt: ["$carted", 0] }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ["$quantity", "$product.price"] } }
          }
        }
      ]).then((total) => {
        resolve({ total: total[0]?.total });
      }).catch(error => {
        reject({ message: error.message });
      });
    });
  };

  //Calculates the subtotal for the items in the user's cart.

  const getSubTotal= (userId) => {
    return new Promise((resolve, reject) => {
      cartModel.aggregate([
        {
          $match: { user: new ObjectId(userId) }
        },
        {
          $unwind: "$cartItems"
        },
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
            price: {
              $arrayElemAt: ["$carted.price", 0]
            }
          }
        },
        {
          $project: {
            total: { $multiply: ["$quantity", "$price"] }
          }
        }
      ]).then((total) => {
        const totals = total.map(obj => obj.total);
        resolve({ total: total, totals: totals });
      }).catch(error => {
        reject({ message: error.message });
      });
    });
  };

  // Saves or updates the user's address information.

  const postAddress= (data, userId) => {
    return new Promise((resolve, reject) => {
        try {
            let addressInfo = {
                fname: data.fname,
                lname: data.lname,
                street: data.street,
                appartment: data.appartment,
                city: data.city,
                state: data.state,
                zipcode: data.zipcode,
                phone: data.phone,
                email: data.email
            }
            addressModel.findOne({ user: userId }).then(async (ifAddress) => {
                if (ifAddress) {
                    addressModel.updateOne(
                        { user: userId },
                        {
                            $push: { Address: addressInfo }
                        }
                    ).then((response) => {
                        resolve(response)
                    }).catch((error) => {
                        reject({ message: error.message });
                    });
                } else {
                    let newAddress = addressModel({ user: userId, Address: addressInfo });
                    await newAddress.save().then((response) => {
                        resolve(response)
                    }).catch((error) => {
                        reject({ message: error.message });
                    });
                }
            }).catch((error) => {
                reject({ message: error.message });
            });
        } catch (error) {
            reject({ message: error.message });
        }
    });
};

//Retrieves the details of the specified address for a user.

const getEditAddress = (addressId, userId) => {

  return new Promise((resolve, reject) => {
      addressModel.aggregate([
          {
              $match: {
                  user: new ObjectId(userId)
              }
          },
          {
              $project: {
                  address: {
                      $filter: {
                          input: "$Address",
                          as: "item",
                          cond: { $eq: ["$$item._id", new ObjectId(addressId)] }
                      }
                  }
              }
          }
      ])
      .then(result => {
        
          if (result.length === 0) {
              resolve(null); 
          } else {
              resolve(result[0].address[0]); 
          }
      })
      .catch(error => {
          reject(error);
      });
  });
};

//Updates the specified address for a user.

const patchEditAddress = (userId, addressId, userData) => {
  return new Promise(async (resolve, reject) => {
      try {
          const response = await addressModel.updateOne(
              {
                  user: new ObjectId(userId),
                  "Address._id": new ObjectId(addressId),
              },
              {
                  $set: {
                      "Address.$": userData,
                  },
              }
          );
          resolve(response);
      } catch (error) {
          reject(error);
      }
  });
};

// Deletes the specified address for a user.

const deleteAddress = (userId, addressId) => {
  return new Promise((resolve, reject) => {
      addressModel.updateOne(
          { user: new ObjectId(userId) },
          { $pull: { Address: { _id: new ObjectId(addressId) } } }
      )
      .then((response) => {
          resolve(response);
      })
      .catch((error) => {
          reject(error);
      });
  });
};

//Retrieves the address of the specified user.

const getAddress= (userId) => {

  return new Promise((resolve, reject) => {
      addressModel.findOne({ user: userId }).then((response) => {

          resolve(response)
      })
  })
};

// Places an order for the specified user.

const  placeOrder= (data) => {

  return new Promise(async (resolve, reject) => {
      try {
          const productDetails = await cartModel.aggregate([
              {
                  $match: {
                      user: new ObjectId(data.user)
                  }
              },
              {
                  $unwind: '$cartItems'
              },
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
                      as: "productDetails"
                  }
              },
              {
                  $unwind: "$productDetails"
              },
              {
                  $project: {
                      productId: "$productDetails._id",
                      productName: "$productDetails.name",
                      productPrice: "$productDetails.price",
                      brand: "$productDetails.brand",
                      quantity: "$quantity",
                      category: "$productDetails.category",
                      image: "$productDetails.img"
                  }
              }
          ]);

          const Address = await addressModel.aggregate([
              {
                  $match: { user: new ObjectId(data.user) }
              },
              {
                  $unwind: "$Address"
              },
              {
                  $match: { "Address._id": new ObjectId(data.address) }
              },
              {
                  $project: { item: "$Address" }
              }
          ]);

          let orderStatus, paymentStatus;

          if (data.payment_option === "COD") {
              paymentStatus = "Placed";
              orderStatus = "Success";
          } else {
              reject(new Error("Invalid payment option"));
              return;
          }

          const orderData = {
              name: Address[0].item.fname,
              paymentStatus,
              paymentMethod: data.payment_option,
              productDetails,
              shippingAddress: Address,
              orderStatus,
              totalPrice: data.totalPrice 
          };

          const existingOrder = await orderModel.findOne({ user: data.user });

          if (existingOrder) {
              await orderModel.updateOne(
                  { user: data.user },
                  { $push: { orders: orderData } }
              );
          } else {
              const newOrder = new orderModel({
                  user: data.user,
                  orders: [orderData]
              });
              await newOrder.save();
          }

          for (const purchasedProduct of productDetails) {
              const originalProduct = await ProductModel.findById(purchasedProduct.productId);
              originalProduct.quantity -= purchasedProduct.quantity;
              await originalProduct.save();
          }

          await cartModel.deleteMany({ user: data.user });

          resolve("Order placed successfully");
      } catch (error) {
          reject(error);
      }
  });
};

//Retrieves the count of items in the user's cart.

const getCartCount = (userId) => {
  return new Promise((resolve, reject) => {
    cartModel.findOne({ user: userId }).then((cart) => {
      if (cart) {
        resolve(cart.cartItems.length);
      } else {
        resolve(0); 
      }
    }).catch((err) => {
      reject(err); 
    });
  });
};

//Retrieves the orders for a given user.


const getOrders = (userId) => {
  return new Promise((resolve, reject) => {
    try {
      orderModel.findOne({ user: new ObjectId(userId) }).then((user) => {
        if (!user) {
          resolve({ success: true, user: null, orders: [] });
          return;
        }
        resolve({ success: true, user, orders: user.orders }); 
      }).catch((error) => {
        reject({ error: "Database error", details: error.message });
      });
    } catch (error) {
      reject({ error: "Internal server error", details: error.message });
    }
  });
};

//Retrieves the shipping address for a specific order of a user.

const getOrderAddress= (userId, orderId) => {
  return new Promise((resolve, reject) => {
      orderModel.aggregate([
          {
              $match: {
                  "user": new ObjectId(userId)
              }
          },
          {
              $unwind: "$orders"
          },
          {
              $match: {
                  "orders._id": new ObjectId(orderId)
              }
          },
          {
              $unwind: "$orders.shippingAddress"
          },
          {
              $project: {
                  "shippingAddress": "$orders.shippingAddress"
              }
          }
      ]).then((address) => {
          resolve(address)
      })

  })
}


//Retrieves sub-orders for a specific order of a user.


const getSubOrders = (orderId, userId) => {
  return new Promise((resolve, reject) => {
    try {
      orderModel.aggregate([
        {
          $match: {
            'user': new ObjectId(userId)
          }
        },
        {
          $unwind: '$orders'
        },
        {
          $match: {
            'orders._id': new ObjectId(orderId)
          }
        }
      ])
      .then(order => {
        resolve(order);
      })
      .catch(error => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

//Retrieves ordered products for a specific order of a user.

const getOrderedProducts= (orderId, userId) => {
  return new Promise((resolve, reject) => {
      try {
          orderModel.aggregate([
              {
                  $match: {
                      "user": new ObjectId(userId)
                  }
              },
              {
                  $unwind: "$orders"
              },
              {
                  $match: {
                      "orders._id": new ObjectId(orderId)
                  }
              },
              {
                  $unwind: "$orders.productDetails"
              },
              {
                  $project: {
                      "productDetails": "$orders.productDetails"
                  }
              }
          ]).then((response) => {
              resolve(response);
          }).catch((error) => {
              reject(error);
          });
      } catch (error) {
          reject(error);
      }
  });
};

//Retrieves the total price of products in a specific order of a user.

const getTotal= (orderId, userId) => {
  return new Promise((resolve, reject) => {
      try {
          orderModel.aggregate([
              {
                  $match: {
                      "user": new ObjectId(userId)
                  }
              },
              {
                  $unwind: "$orders"
              },
              {
                  $match: {
                      "orders._id": new ObjectId(orderId)
                  }
              },
              {
                  $unwind: "$orders.productDetails"
              },
              {
                  $project: {
                      "productDetails": "$orders.productDetails",
                      "totalPrice": { $multiply: ["$orders.productDetails.productPrice", "$orders.productDetails.quantity"] }
                  }
              }
          ])
          .then((response) => {
              resolve(response);
          })
          .catch((error) => {
              reject(error);
          });
      } catch (error) {
          reject(error);
      }
  });
};

//Retrieves the total price of products in a specific order of a user.

const getOrderTotal = (orderId, userId) => {
  return new Promise((resolve, reject) => {
      orderModel.aggregate([
          {
              $match: {
                  "user": new ObjectId(userId)
              }
          },
          {
              $unwind: "$orders"
          },
          {
              $match: {
                  "orders._id": new ObjectId(orderId)
              }
          },
          {
              $unwind: "$orders.productDetails"
          },
          {
              $group: {
                  _id: "$orders._id",
                  totalPrice: { $sum: "$orders.productDetails.productPrice" }
              }
          }

      ]).then((response) => {
          if (response && response.length > 0) {
              const orderTotal = response[0].totalPrice;
              resolve(orderTotal);
          } else {
              reject(new Error("Order not found or total price could not be calculated."));
          }
      }).catch((error) => {
          reject(error);
      });
  });
};



















  module.exports={totalCheckOutAmount,
    getSubTotal,
    postAddress,
    getEditAddress,
    patchEditAddress,
    deleteAddress,
    getAddress,
    placeOrder,
    getCartCount,
    getOrderAddress,
    getOrders,
    getSubOrders,
    getOrderedProducts,
    getTotal,
    getOrderTotal}
  