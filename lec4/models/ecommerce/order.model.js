import mongoose from "mongoose"

//mini schema for the use i orderItems count
//this mini schema will be used by the orderSchenma and no one else hence need not to kept in a separate file, but could be kept
const orderItemSchema=new mongoose.Schema({
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product"
    },
    quantity:{
        type:Number,
        required:true
    }
})

const orderSchema=new mongoose.Schema(
    {
        orderPrice:{
            type:Number,
            required:true
        },
        customer:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        orderItems:{
            type: [orderItemSchema]
        },
        address:{
            type:String,
            required:true,
        },
        status:{
            type:String,
            enum:["PENDING","CANCELLED","DELIVERED"],
            default:"PENDIND"
        }

    },{timestamps:true}
)

export const Order=mongoose.model("Order",orderSchema);