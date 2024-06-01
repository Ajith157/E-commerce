const { UserModel } = require("../models/Schema");
const bcrypt = require("bcrypt");
const sendEmail = require('../utils/sendEmail')
const nodemailer=require('nodemailer')
const {ProductModel}=require('../models/Schema')



const signupUser = async (userData) => {
  try {
    const { username,email,password,first_name,last_name,phonenumber } = userData;

    // Check if user already exists
    const existingUser = await UserModel.findOne({ username });

    if (existingUser) {
      // User with this username already exists
      return { success: false, message: "User is already exist." };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance
    const newUser = new UserModel({
      username,
      password: hashedPassword,
      email,
      first_name,
      last_name,
      phonenumber,
    });

    // Save the new user to the database
    await newUser.save();




    await sendEmail(email)

    return { success: true, message: "User signed successfully." };
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      
      return { success: false, message: "Email is already taken." };
    }
    console.error("Error during signup:", error);
    throw new Error("Failed to sign up user.");
  }
};

const loginUser = async (email, password) => {
  try {
    // Find user by email
    const user = await UserModel.findOne({ email });

    // If user is not found, return error message
    if (!user) {
      return { success: false, message: "Invalid username or password." };
    }

    // Compare the provided password with the hashed password stored in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    // If passwords match, return success status along with the user object
    if (passwordMatch) {
      return { success: true, user }; // Return user object along with success status
    } else {
      return { success: false, message: "Invalid username or password." };
    }
  } catch (error) {
    console.error("Error during login:", error);
    throw new Error("Failed to login user.");
  }
};



const sendResetEmail = async (email,host,token) => {
 
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });
 

  const mailOptions = {
    to: email,
    from: process.env.NODEMAILER_EMAIL,
    subject: 'Password Reset',
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
           Please click on the following link, or paste this into your browser to complete the process:\n\n
           http://${host}/reset/${token}\n\n
           If you did not request this, please ignore this email and your password will remain unchanged.\n`,
  };

  await transporter.sendMail(mailOptions);
};


const getNewlyAddedProducts = async () => {
  try {
      
      const newlyAdded = await ProductModel.find().sort({ createdAt: -1 });
      return newlyAdded;
  } catch (error) {
      throw error;
  }
};

 const getQueriesOnShop= async (query) => {
  const search = query?.search;
  const sort = query?.sort;
  const filter = query?.filter;
  const page = parseInt(query?.page) || 1;
  const perPage = 10;

  try {
      let filterObj = {};

      if (filter === 'category=MEN') {
          filterObj = { category: 'MEN' };
      } else if (filter === 'category=WOMEN') {
          filterObj = { category: 'WOMEN' };
      } else if (filter === 'category=KIDS') {
          filterObj = { category: 'KIDS' };
      }

      // Building search query
      let searchQuery = {};

      if (search) {
          searchQuery = {
              $or: [
                  { name: { $regex: search, $options: 'i' } },
                  { description: { $regex: search, $options: 'i' } }
              ]
          };
      }

      // Building object based on query parameter
      let sortObj = {};

      if (sort === '-price') {
          sortObj = { price: -1 };
      } else if (sort === 'price') {
          sortObj = { price: 1 };
      }

      const skip = (page - 1) * perPage;
      const product = await productShema.product.find({
          ...searchQuery,
          ...filterObj,
      })
          .sort(sortObj)
          .skip(skip)
          .limit(perPage);

      const totalProducts = await productShema.product.countDocuments({
          ...searchQuery,
          ...filterObj,
      });

      const totalPages = Math.ceil(totalProducts / perPage);

      if (product.length === 0) {
          return {
              noProductFound: true,
              Message: "No results found."
          };
      }

      return {
          product,
          noProductFound: false,
          currentPage: page,
          totalPages,
      };
  } catch (error) {
      console.error("Error fetching products:", error);
      throw error; 
  }
};

const getShop = () => {
  try {
    return new Promise((resolve, reject) => {
      ProductModel.find().then((product) => {
        if (product) {
          resolve({ product }); 
        } else {
          console.log('Product not found');
          resolve({ product: [] }); 
        }
      }).catch(error => {
        reject(error); 
      });
    });
  } catch (error) {

    console.error("Error fetching products:", error);
    throw error;
  }
};

const getProductDetail= (proId) => {
  return new Promise((resolve, reject) => {
    ProductModel.findById({ _id: proId }).then((response) => {
      resolve(response);
    }).catch(error => {
      reject(error);
    });
  });
};

const getUser = (userId) => {
  return new Promise((resolve, reject) => {
    UserModel.findById({ _id: userId }).then((response) => {
      if (response) {
        resolve(response); 
      } else {
        reject({ message: "User not found" }); 
      }
    }).catch((error) => {
      reject(error); 
    });
  });
};

const changeUserData = (userId, data) => {
  return new Promise((resolve, reject) => {
    UserModel.updateOne(
      { _id: userId },
      {
        $set: {
          username: data.username,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          phonenumber: data.phonenumber
        }
      }
    ).then((response) => {
      if (response) {
        resolve({ message: 'User data updated successfully', data: response });
      } else {
        resolve({ message: 'No changes made to user data', data: response });
      }
    }).catch((error) => {
      reject(error);
    });
  });
};



module.exports = { signupUser,
   loginUser,
   sendResetEmail
   ,getNewlyAddedProducts,
   getShop,
   getProductDetail,
   getUser,
   changeUserData
   };
