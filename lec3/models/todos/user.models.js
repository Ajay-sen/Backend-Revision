import mongoose from "mongoose"

//create schemas
// ONE WAY==>
// const userSchema=new mongoose.Schema(
//     {
//         username:String,
//         email:String,
//         isActive:Boolean
//     }
// )

// SECOND WAY==>more standard way
const userSchema=new mongoose.Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true
            //so you can add whatever you need in validation here
        },

        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true
        },

        password:{
            type:String,
            required:true,
            //required:[true,"this field is required"]->you can add customised mesages like this too
        }
    },
    {
        timestamps:true
    }
)
//so each schema contains 2 objects, first one containes all the fileds are their validations, while the second object contains the property timestamps which on being true, add two additional things that you can use  which are: createdAt, updatedAt

export const User=mongoose.model("User",userSchema)