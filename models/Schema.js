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

const adminSchema = new Schema({
    email: { type: String },
    password: { type: String }
}, { timestamps: true });

const productSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    inventoryId: { type: String, required: true },
    deletedAt: { type: Date, default: null },
    img: { type: Array, required: true },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'modifiedAt' } });

const categorySchema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    deletedAt: { type: Date, default: null }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'modifiedAt' } });

const cartSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    cartItems: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
        quantity: { type: Number, default: 1 },
        price: { type: Number }
    }]
}, { timestamps: true });

const addressSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    Address: [{
        fname: { type: String },
        lname: { type: String },
        street: { type: String },
        appartment: { type: String },
        city: { type: String },
        state: { type: String },
        zipcode: { type: String },
        phone: { type: String },
        email: { type: String }
    }]
}, { timestamps: true });

const orderSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    orders: [{
        fname: { type: String },
        lname: { type: String },
        phone: { type: Number },
        paymentMethod: { type: String },
        paymentStatus: { type: String },
        totalPrice: { type: Number },
        totalQuantity: { type: Number },
        productDetails: { type: Array },
        shippingAddress: { type: Object },
        paymentMethod: { type: String },
        status: { type: Boolean, default: true },
        paymentType: { type: String },
        orderConfirm: { type: String, default: "ordered" },
        returnReason: {type:String}
    }]
}, { timestamps: true });

const wishListSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    wishList: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }
    }]
}, { timestamps: true });




const UserModel = mongoose.model('User', UserSchema);
const AdminModel = mongoose.model('admin', adminSchema);
const ProductModel=mongoose.model('product',productSchema);
const CategoryModel=mongoose.model('category',categorySchema)
const cartModel=mongoose.model('cart',cartSchema);
const addressModel=mongoose.model('address',addressSchema);
const orderModel=mongoose.model('order',orderSchema);
const wishlistModel=mongoose.model('wishlist',wishListSchema)

module.exports = { UserModel, AdminModel,ProductModel,CategoryModel,cartModel,addressModel,orderModel,wishlistModel };
