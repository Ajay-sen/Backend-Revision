import mongoose from "mongoose";

const userSchema=new mongoose.Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true
        },
        password:{
            type:String,
            required:true
        }

    },{timestamps:true}
)
//?? 2 field contributed by timestamps are: createdAt(), updatedAt()

export const User=mongoose.model("User",userSchema);