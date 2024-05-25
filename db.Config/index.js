const mongoose = require("mongoose");

const dbConnection = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URL, {});
        console.log("DB connected successfully");
    } catch (error) {
        console.log("DB Error" + error);
    }
}

module.exports = dbConnection;
