const express = require('express')
const { ObjectId } = require('mongodb')
const { cartModel, addressModel, orderModel, ProductModel, UserModel } = require('../models/Schema')
const mongoose = require('mongoose');
const Razorpay = require('razorpay')

const keyId = process.env.key_id
const keySecret = process.env.key_secret

var instance = new Razorpay({
  key_id: "rzp_test_IostXCStKNvzBp",
  key_secret: "9BK2QTC6UWC1QsV2YNmIuRAL",
});
//Calculates the total checkout amount for a user's cart.

const totalCheckOutAmount = (userId) => {
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

const getSubTotal = (userId) => {
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

const postAddress = (data, userId) => {
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

const getAddress = (userId) => {

  return new Promise((resolve, reject) => {
    addressModel.findOne({ user: userId }).then((response) => {

      resolve(response)
    })
  })
};

// Places an order for the specified user.



const placeOrder = async (data) => {
  try {
    console.log("Input data:", data);

    const productDetails = await cartModel.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(data.user) } },
      { $unwind: '$cartItems' },
      {
        $project: {
          item: "$cartItems.productId",
          quantity: "$cartItems.quantity",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "item",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          productId: "$productDetails._id",
          productName: "$productDetails.name",
          productPrice: "$productDetails.price",
          brand: "$productDetails.brand",
          quantity: "$quantity",
          category: "$productDetails.category",
          image: "$productDetails.img",
        },
      },
    ]);

    console.log("Product details:", productDetails);

    if (!productDetails.length) {
      throw new Error("No products found in the cart for the given user.");
    }

    const address = await addressModel.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(data.user) } },
      { $unwind: "$Address" },
      { $match: { "Address._id": new mongoose.Types.ObjectId(data.address) } },
      { $project: { item: "$Address" } },
    ]);

    console.log("Address details:", address);

    if (!address.length) {
      throw new Error("Address not found for the given user and address ID.");
    }

    let status, orderStatus;
    if (data.payment_option === "COD") {
      status = "Placed";
      orderStatus = "Success";
    } else {
      status = "Pending";
      orderStatus = "Pending";
    }

    const orderData = {
      name: address[0].item.fname,
      paymentStatus: status,
      paymentMethod: data.payment_option,
      productDetails: productDetails,
      shippingAddress: address[0].item,
      orderStatus: orderStatus,
      totalPrice: data.totalAmount,
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
        orders: [orderData],
      });
      await newOrder.save();
    }

    await cartModel.deleteMany({ user: data.user });

    return { message: 'Order placed successfully' };
  } catch (error) {
    console.error("Error in placeOrder function:", error);
    throw new Error(error.message);
  }
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

const getOrderAddress = (userId, orderId) => {
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

const getOrderedProducts = (orderId, userId) => {
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

const getTotal = (orderId, userId) => {
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


const generateRazorpay = async (userId, total) => {
  try {
    let orders = await orderModel.find({ user: userId });

    if (orders.length === 0 || orders[0].orders.length === 0) {
      
      throw new Error("No orders found for user.");
    }

    let order = orders[0].orders.slice().reverse();
    let orderId = order[0]._id;

    let options = {
      amount: total * 100,
      currency: "INR",
      receipt: "" + orderId
    };

    return new Promise((resolve, reject) => {
      instance.orders.create(options, (err, order) => {
        if (err) {
          reject(err);
        } else {
          resolve(order);
        }
      });
    });
  } catch (error) {
    throw error;
  }
};




// Helper function in orderHelper.js

const verifyPayment = (details) => {


  return new Promise((resolve, reject) => {
      const crypto = require("crypto");
      const secret = "9BK2QTC6UWC1QsV2YNmIuRAL"; 

      const generatedSignature = crypto.createHmac("sha256", secret)
          .update(details["payment[razorpay_order_id]"] + "|" + details["payment[razorpay_payment_id]"])
          .digest("hex");

      const actualSignature = details["payment[razorpay_signature]"];

      if (generatedSignature === actualSignature) {
          resolve();
      } else {
          reject(new Error("Payment verification failed")); 
      }
  });
};


const changePaymentStatus = (orderId) => {
 
  return new Promise(async (resolve, reject) => {
    try {
      await orderModel.updateOne(
        { "orders._id": orderId },
        {
          $set: {
            "orders.$.orderConfirm": "Success",
            "orders.$.paymentStatus": "Paid",
            "orders.$.paymentId": paymentId
          }
        }
      );

      await cartModel.deleteMany({ user: req.user.id });

      resolve({ status: true, message: "Payment status updated and cart cleared successfully." });
    } catch (error) {
      reject({ status: false, message: error.message });
    }
  });
};



const changeOrderStatus = (orderId, status) => {

  return new Promise((resolve, reject) => {
    try {
      orderModel.updateOne(
        { 'orders._id': orderId },
        { $set: { 'orders.$.orderConfirm': status } }
      ).then((response) => {
        resolve({ success: true, message: 'Order status updated successfully', response });
      }).catch((error) => {
        reject({ success: false, message: 'Failed to update order status', error });
      });
    } catch (error) {
      reject({ success: false, message: 'Error occurred while updating order status', error: error.message });
    }
  });
};


// const cancelOrder = (orderId) => {
//   return new Promise((resolve, reject) => {
//     orderModel.findOne({ 'orders._id': orderId })
//       .then((orderDoc) => {
//         if (!orderDoc) {
//           reject(new Error('Order not found'));
//           return;
//         }

//         let orderIndex = orderDoc.orders.findIndex(order => order._id.toString() === orderId.toString());
//         let order = orderDoc.orders[orderIndex];

//         if (!order) {
//           reject(new Error('Order details not found'));
//           return;
//         }

//         let updateQuery = {
//           $set: {
//             ['orders.' + orderIndex + '.orderConfirm']: 'Canceled'
//           }
//         };

//         if (order.paymentMethod === 'razorpay' && order.paymentStatus === 'Pending' && order.paymentId) {
//           // Calculate refund amount (if needed)
//           let refundAmount = order.totalPrice * 100; // Amount in smallest currency unit (e.g., paisa in India)

//           // Initiate Razorpay refund
//           instance.payments.refund(order.paymentId, {
//             amount: refundAmount,
//             speed: 'optimum'
//           }).then((response) => {
//             // Handle Razorpay refund success
//             console.log('Razorpay refund response:', response);

//             // Update order status after successful refund
//             updateQuery.$set['orders.' + orderIndex + '.paymentStatus'] = 'Refunded';

//             orderModel.updateOne({ 'orders._id': orderId }, updateQuery)
//               .then(() => {
//                 resolve({ message: 'Order canceled and refunded' });
//               })
//               .catch((error) => {
//                 reject(error);
//               });

//           }).catch((error) => {
//             // Handle Razorpay refund failure
//             console.error('Razorpay refund error:', error);
//             reject(error);
//           });

//         } else {
//           // Update order status without refund for other payment methods or statuses
//           orderModel.updateOne({ 'orders._id': orderId }, updateQuery)
//             .then(() => {
//               resolve({ message: 'Order canceled' });
//             })
//             .catch((error) => {
//               reject(error);
//             });
//         }

//       }).catch((error) => {
//         reject(error);
//       });
//   });
// };

const cancelOrder= (orderId) => {
  try {
      return new Promise((resolve, reject) => {
          orderModel.find({ 'orders._id': orderId }).then((orders) => {
              let orderIndex = orders[0].orders.findIndex((orders) => orders._id == orderId);
              let order = orders[0].orders.find((order) => order._id == orderId);

              if (order.paymentMethod === 'razorpay' && order.paymentStatus === 'Paid') {
                  // Fetch payment details from Razorpay API
                  instance.payments.fetch(order.paymentId).then((payment) => {
                      if (payment.status === 'captured') {
                          // Initiate refund using the payment ID and refund amount
                          instance.payments.refund(order.paymentId, { amount: order.totalPrice * 100 }).then((refund) => {
                              // Update order status in the database
                              orderModel.updateOne(
                                  { 'orders._id': orderId },
                                  {
                                      $set: {
                                          ['orders.' + orderIndex + '.orderConfirm']: 'Canceled by User',
                                          ['orders.' + orderIndex + '.paymentStatus']: 'Refunded'
                                      }
                                  }
                              ).then((orders) => {
                                  resolve(orders)
                              });
                          }).catch((error) => {
                              console.log(error);
                              reject(error);
                          });
                      } else {
                          console.log('Payment not captured');
                          reject('Payment not captured');
                      }
                  }).catch((error) => {
                      console.log(error);
                      reject(error);
                  });
              } else if (order.paymentMethod === 'COD' && order.orderConfirm === 'Delivered' && order.paymentStatus === 'paid') {
                  // Update order status in the database
                  orderModel.updateOne(
                      { 'orders._id': orderId },
                      {
                          $set: {
                              ['orders.' + orderIndex + '.orderConfirm']: 'Canceled',
                              ['orders.' + orderIndex + '.paymentStatus']: 'Refunded'
                          }
                      }
                  ).then((orders) => {
                      resolve(orders)
                  });
              } else {
                  // Update order status in the database
                  orderModel.updateOne(
                      { 'orders._id': orderId },
                      {
                          $set: {
                              ['orders.' + orderIndex + '.orderConfirm']: 'Canceled'
                          }
                      }
                  ).then((orders) => {
                      resolve(orders)
                  });
              }
          });
      });
  } catch (error) {
      console.log(error.message);
  }
};

const returnOrder = (orderId, userId, returnReason) => {
  console.log(orderId, userId, returnReason,'5555555');
  return new Promise((resolve, reject) => {
      orderModel.find({ 'orders._id': orderId }).then((orders) => {
          let orderIndex = orders[0].orders.findIndex(
              (orders) => orders._id == orderId
          );
          let order = orders[0].orders.find((order) => order._id == orderId);

          if (order.paymentMethod === 'razorpay' && order.paymentStatus === 'Paid') {
              // Fetch payment details from Razorpay API
              instance.payments.fetch(order.paymentId).then((payment) => {
                  if (payment.status === 'captured') {
                      // Initiate refund using the payment ID and refund amount
                      instance.payments.refund(order.paymentId, { amount: order.totalPrice * 100 }).then((refund) => {
                          // Update order status in the database
                          orderModel.updateOne(
                              { 'orders._id': orderId },
                              {
                                  $set: {
                                      ['orders.' + orderIndex + '.orderConfirm']: 'Returned',
                                      ['orders.' + orderIndex + '.paymentStatus']: 'Refunded',
                                      ['orders.' + orderIndex + '.returnReason']: returnReason 
                                  }
                              }
                          ).then((orders) => {
                              resolve({ message: 'Product returned successfully', orders });
                          }).catch((error) => {
                              reject(new Error('Failed to update order status'));
                          });
                      }).catch((error) => {
                          reject(new Error('Failed to process refund'));
                      });
                  } else {
                      reject(new Error('Payment not captured'));
                  }
              }).catch((error) => {
                  reject(new Error('Failed to fetch payment details'));
              });
          } else if (order.paymentMethod === 'COD') {
              // Update order status in the database
              orderModel.updateOne(
                  { 'orders._id': orderId },
                  {
                      $set: {
                          ['orders.' + orderIndex + '.orderConfirm']: 'Returned',
                          ['orders.' + orderIndex + '.paymentStatus']: 'Refunded',
                          ['orders.' + orderIndex + '.returnReason']: returnReason // Save the return reason
                      }
                  }
              ).then((orders) => {
                  resolve({ message: 'Product returned successfully', orders });
              }).catch((error) => {
                  reject(new Error('Failed to update order status'));
              });
          } else {
              reject(new Error('Invalid payment method'));
          }
      }).catch((error) => {
          reject(new Error('Failed to find order'));
      });
  });
}






















module.exports = {
  totalCheckOutAmount,
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
  getOrderTotal,
  generateRazorpay,
  verifyPayment,
  changePaymentStatus,
  changeOrderStatus,
  cancelOrder,
  returnOrder
}
