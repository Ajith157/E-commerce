const {response }=require("express");
const orderHelper=require('../Helper/orderHelper')
const cartHelper=require('../Helper/cartHelper')
const userHelper =require('../Helper/userHelper')




//Handles the POST request to save user address.

const postAddress = (req, res) => {
    let data = req.body;
    let userId = req.session.user._id;

    orderHelper.postAddress(data, userId)
        .then((result) => {
            res.status(200).json(result);
        })
        .catch((error) => {
            res.status(500).json({ message: error.message });
        });
};

// Handles the GET request to retrieve the address details for editing.

const getEditAddress = (req, res) => {
    try {
        let userId = req.session.user._id;
        let addressId = req.params.id;

    orderHelper.getEditAddress(addressId, userId).then((currentAddress) => {
            res.json(currentAddress);
          
        }).catch((error) => {
            res.status(500).json({ message: error.message }); 
        });
    } catch (error) {
        res.status(500).json({ message: error.message }); 
    }
};

//Handles the PATCH request to update user address.

const patchEditAddress = (req, res) => {
    try {
        let addressId = req.params.id;
        let userId = req.session.user._id;
        let userData = req.body;

        orderHelper.patchEditAddress(userId, addressId, userData).then((response) => {
            res.json(response);
        }).catch((error) => {
            res.status(500).json({ message: error.message }); 
        });
    } catch (error) {
        res.status(500).json({ message: error.message }); 
    }
};

//Handles the DELETE request to delete a user address.

const deleteAddress = (req, res) => {
    let userId = req.session.user._id;
    let addressId = req.params.id;

    orderHelper.deleteAddress(userId, addressId)
        .then((response) => {
            res.send(response);
        })
        .catch((error) => {
            res.status(500).json({ message: error.message });
        });
};

// Handles the GET request to retrieve checkout details.

const getcheckOut= async (req, res) => {
    try {
        let userId = req.session.user._id;
        let user = req.session.user;
        let total = await orderHelper.totalCheckOutAmount(userId)
        let count = await cartHelper.getCartCount(userId)
        let address = await orderHelper.getAddress(userId)
        
        cartHelper.getCartItems(userId).then((cartItems) => {
            let responseData = {
                user: user,
                cartItems: cartItems,
                total: total,
                count: count,
                address: address
            };
            res.json(responseData);
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Handles the POST request to place an order.

const postCheckout = async (req, res) => {
    try {
        let userId = req.session.user._id;
        let data = req.body;
        let total = data.total;

        try {
            const response = await orderHelper.placeOrder(data);

            if (data.payment_option === "COD") {
                res.json({ codStatus: true, message: 'Order placed successfully with COD' });
            } else if (data.payment_option === "razorpay") {
                const order = await orderHelper.generateRazorpay(userId, total);
                
                res.json(order);
            } else {
                res.json({ orderStatus: true, message: 'Order placed successfully' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


//Handles the GET request to retrieve user profile data.

const getProfile= async (req, res) => {
    try {
        var count = null;
        let user = req.session.user;
        let userId = req.session.user._id;

        if (user) {
            var count = await cartHelper.getCartCount(userId);
            let userData = await userHelper.getUser(userId);
            let address = await orderHelper.getAddress(userId);
            let orders = await orderHelper.getOrders(userId);

            res.json({ user, count, userData, address, orders });
        }
    } catch (error) {
        console.log('catch');
        res.status(500).json({ error: error.message });
    }
};

const verifyPayment = (req, res) => {
      console.log(req.body,'22222222');
    orderHelper.verifyPayment(req.body)
  
        .then(() => {
            return orderHelper.changePaymentStatus(req.body["order{receipt}"]);
        })
        .then(() => {
            res.json({
                status: true,
                orderId: req.body["order[receipt]"],
                addressId: req.body["order[notes][address]"], 
            });
        })
        .catch((error) => {
            
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
            } else {
             
                res.status(500).json({ error: 'An error occurred.' });
            }
        });
};


const changeOrderStatus = async (req, res) => {
    try {
        let orderId = req.body.orderId;
        let status = req.body.status;

      
        let response = await orderHelper.changeOrderStatus(orderId, status);

     
        res.send(response);
    } catch (error) {
   
        console.error('Error occurred while changing order status:', error);
        res.status(500).send({
            success: false,
            message: 'Failed to update order status',
            error: error.message
        });
    }
};

const cancelOrder = (req, res) => {
    let orderId = req.query.orderId; 
    let total = parseInt(req.query.total);
    let userId = req.session.user._id;
  

    orderHelper.cancelOrder(orderId)
        .then((canceled) => {
            res.send(canceled);
        })
        .catch((error) => {
            res.status(500).send({ error: error.message });
        });
};












module.exports={postAddress,
    getEditAddress,
    patchEditAddress,
    deleteAddress,
    getcheckOut,
    postCheckout,
    getProfile,
    verifyPayment,
    changeOrderStatus,
    cancelOrder}