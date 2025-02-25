import mongoose from "mongoose";

const productSchema=new mongoose.Schema({
    description:{
        required:true,
        type:String
    },
    name:{
        required:true,
        type:String
    },
    productImage:{
        type:String //we can upload the image in some 3rd party app and save its url here like in cloudinary
    },
    price:{
        type:Number,
        default:0
    },
    stock:{
        default:0,
        type:Number,
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        required:true,
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:User
    }
},{timestamps:true})

export const Product=mongoose.model("Product,productSchema")