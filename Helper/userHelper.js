const { UserModel } = require("../models/Schema");
const bcrypt = require("bcrypt");
const sendEmail = require('../utils/sendEmail')
const nodemailer=require('nodemailer')



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
   
    const user = await UserModel.findOne({ email });

    
    if (!user) {
      return { success: false, message: "Invalid username or password." };
    }

    
   const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      return { success: true, message: "Authentication successfull." };
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





module.exports = { signupUser, loginUser,sendResetEmail };
