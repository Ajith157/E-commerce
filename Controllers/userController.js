const { response } = require('express');
const { signupUser } = require('../Helper/userHelper.js')
const { loginUser } = require('../Helper/userHelper.js')
const { UserModel } = require("../models/Schema");
const { sendResetEmail } = require('../Helper/userHelper.js')
const wishListHelper = require('../Helper/wishlistHelper.js')
const cartHelper = require('../Helper/cartHelper.js')
const userHelper = require('../Helper/userHelper.js')
const crypto = require('crypto');
const bcrypt = require('bcrypt')




// Handles the GET request to render the login page.

const getLoginPage = (req, res) => {
  try {
    res.status(200).json({ message: 'Login page rendered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

//Handles the GET request to render the signup page.

const getSignupPage = (req, res) => {
  try {
    res.status(200).json({ message: 'Signup page rendered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

//Controller function to handle user signup.

const signupController = async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, phonenumber } = req.body;

    // Validate input data
    if (!username || !email || !password || !first_name || !last_name || !phonenumber) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    // Prepare user data for signup
    const userData = {
      email,
      username,
      password,
      first_name,
      last_name,
      phonenumber,
    };

    // Call helper function to sign up user
    const result = await signupUser(userData);

    // Check signup result
    if (result.success) {
      res.status(201).json({ success: true, message: "User signed up successfully." });
    } else {
      res.status(400).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error("Error in signup controller:", error);
    res.status(500).json({ success: false, message: "Failed to sign up user." });
  }
};

//Controller function to handle user login.

const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;


    if (!email || !password) {
      return res.status(400).json({ success: false, message: "email and password are required." });
    }

  
    const result = await loginUser(email, password);


    if (result.success) {
     
      req.session.user = {
        _id: result.user._id,
        email: email,
      };

      res.status(200).json({ success: true, message: "User logged in successfully." });
    } else {
      res.status(401).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error("Error in login controller:", error);
    res.status(500).json({ success: false, message: "Failed to login user." });
  }
};

// Controller function to handle user logout.

const handleLogout = (req, res) => {
  try {
    if (req.session.user) {
      req.session.user = null;
      res.status(200).json({ success: true, message: "User logged out successfully." });
    } else {
      res.status(400).json({ success: false, message: "No user session found." });
    }
  } catch (error) {
    console.error("Error in logout controller:", error);
    res.status(500).json({ success: false, message: "Failed to logout user." });
  }
};

// Handles the request to initiate the forgot password process.

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UserModel.findOne({ email });
  
    if (!user) {
      
      return res.status(404).send('User not found');
    }

    const token = crypto.randomBytes(20).toString('hex');


    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; 


    await user.save();

    await sendResetEmail(user.email, req.headers.host, token);

    res.status(200).send('Recovery email sent');
  } catch (error) {
    res.status(500).send('Error in sending email');
  }
};

//Handles the request to reset the user's password.

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;


  try {
    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });


    if (!user) {
      return res.status(400).send('Password reset token is invalid or has expired');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();



    res.status(200).send('Password has been reset');
  } catch (error) {
    res.status(500).send('Error in resetting password');
  }
};

//Retrieves home page data.

const getHome = async (req, res) => {
  try {
    const newlyAdded = await userHelper.getNewlyAddedProducts();

    let user = null;
    if (req.session && req.session.user) {
      user = req.session.user;
    }

    res.json({ user, newlyAdded });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//Retrieves products for the shop page based on query parameters.

const getShop = async (req, res) => {
  let user = req.session.user;

  try {
    if (req.query?.search || req.query?.sort || req.query?.filter) {
      const { product, currentPage, totalPages, noProductFound } = await userHelper. getQueriesOnShop(req.query);
      if (noProductFound) {
        return res.status(200).json({ productResult: "No results found." });
      } else {
        return res.status(200).json({ product, currentPage, totalPages, noProductFound });
      }
    } else {
      const product = await userHelper.getShop();
      const noProductFound = product.length === 0;
      return res.status(200).json({ product, noProductFound });
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

//Retrieves details of a specific product.

const getProductdetails = (req, res) => {
  try {
    let proId = req.params.id;
    let user = req.session.user;

    userHelper.getProductDetail(proId).then((product) => {
      res.json({ product, user });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Adds a product to the user's wishlist.

const addWishList = (req, res) => {
  let proId = req.params.id;
  let userId = req.session.user._id;



  wishListHelper.addWishList(userId, proId)
    .then((response) => {

      if (response.status) {
        res.send({ status: true, message: response.message || "Product added to wishlist successfully" });
      } else {
        res.status(404).send(response.message || "Product not found");
      }
    })
    .catch((error) => {
      console.error("Error adding product to wishlist:", error);
      res.status(500).send("Internal Server Error");
    });
};

//Retrieves user's wishlist and related data.

const getWishlist = async (req, res) => {
  try {
    let user = req.session.user;

    let count = await cartHelper.getCartCount(user._id);
    const wishlistCount = await wishListHelper.getWishlistcount(user._id);
    const wishlistProducts = await wishListHelper.getWishlistProducts(user._id);

    res.json({ user, count, wishlistProducts, wishlistCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Removes a product from the user's wishlist.

const removeProductWishlist = (req, res) => {
  try {
    const { proId, wishListId } = req.body;

    if (!proId || !wishListId) {
      return res.status(400).send({ error: 'Product ID and Wishlist ID are required' });
    }

    wishListHelper.removeProductWishlist(proId, wishListId)
      .then((response) => {
        if (response.nModified === 0) {

          return res.status(404).send({ error: 'Product not found in the wishlist' });
        }
        res.send(response);
      })
      .catch((error) => {
        console.error('Error removing product from wishlist:', error);
        res.status(500).send({ error: 'Failed to remove product from wishlist' });
      });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).send({ error: 'An unexpected error occurred' });
  }
};

// Changes user data.

const changeUserData = async (req, res) => {
  try {
    const userId = req.params.id;
    const data = req.body;

    const updatedUserData = await userHelper.changeUserData(userId, data);
    res.send(updatedUserData);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: 'An error occurred while updating user data.' });
  }
};

//Retrieves user details by user ID.

const getDetails = (userId) => {
  return new Promise((resolve, reject) => {
    UserModel.find({ _id: userId })
      .then((user) => {
        resolve(user);
      })
      .catch((error) => {
        reject(error);
      });
  });
};


const sort = async (req, res) => {
  const { id } = req.params;

  try {
      const products = await userHelper.sorting(id);
      res.send(products);
  } catch (error) {
      console.error('Error sorting products:', error);
      res.status(500).send({ error: 'An error occurred while sorting products.' });
  }
};














module.exports = {
  getLoginPage,
  getSignupPage,
  signupController,
  handleLogin,
  handleLogout,
  forgotPassword,
  resetPassword,
  getHome,
  getShop,
  getProductdetails,
  addWishList,
  getWishlist,
  removeProductWishlist,
  changeUserData,
  getDetails,
  sort

}
