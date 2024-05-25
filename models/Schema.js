const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    phonenumber: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'modifiedAt' } });

const adminSchema = new mongoose.Schema({
    email: {
        type: String
    },
    password: {
        type: String
    }
});
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    category:{
        type:String,required:true,
    },
    inventoryId: {
        type:String,required:true,
      
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    modifiedAt: {
        type: Date,
        default: Date.now,
    },
    deletedAt: {
        type: Date,
        default: null,
    },
    img:{
        type:Array,required:true,
    },
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'modifiedAt' }
});

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    deletedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'modifiedAt' } });




const UserModel = mongoose.model('User', UserSchema);
const AdminModel = mongoose.model('admin', adminSchema);
const ProductModel=mongoose.model('product',productSchema);
const CategoryModel=mongoose.model('category',categorySchema)

module.exports = { UserModel, AdminModel,ProductModel,CategoryModel };
