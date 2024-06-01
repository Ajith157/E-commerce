const {response }=require("express");
const orderHelper=require('../Helper/orderHelper')
const cartHelper=require('../Helper/cartHelper')
const userHelper =require('../Helper/userHelper')


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

const postCheckout= async (req, res) => {
    try {
        let userId = req.session.user._id;
        let data = req.body;

      
        const response = await orderHelper.placeOrder(data);

        if (data.payment_option === "COD") {
            res.json({ success: true, message: "Order placed successfully via COD." });
        } else {
            // Handle other payment options here if needed
            res.status(400).json({ error: "Invalid payment option" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

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
}









module.exports={postAddress,
    getEditAddress,
    patchEditAddress,
    deleteAddress,
    getcheckOut,
    postCheckout,
    getProfile}