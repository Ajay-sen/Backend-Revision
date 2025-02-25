import mongoose , {Schema} from "'mongoose";

import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema=new Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true,  ///to make its seraching field enabled , for more easily sercahed
        },

        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
        },

        fullName:{
            type:String, 
            required:true,
            trim:true,
            index:true,
        },

        avatar:{    //w ll use a thiry pary sourse to store the images , and will provide the links here

            type:String,  //cloudinary links
            required:true,
        },

        coverImage:{
            type:String,
        },

        watchHistory:[  //will contain array of the viwed contents
            {
                type:Schema.Types.ObjectId,
                ref:"Video"
            }
        ],

        password:{
            type:String,
            required:[true,'Password is required']
        },

        refreshToken:{
            type:String
        }

    },
    {
        timestamps:true,
    }
)

//pre hook
userSchema.pre("save",async function(next){  //so will apply the pre hook when the save methos will be called, 
    //to use "this" we cannot use arraow methos here, since theta does not allow this to use, hence use  fucntion keyword
    //now here we will  hash the paswword , only when password will be modified, no other time
    if(!this.isModified("password")) return next();

    this.password= await bcrypt.hash(this.password,10)
    next()  //must call the next , since it is working as a middeleware

})

// now inject a new methos inside userSchema, to check that incripted password, using bcrypt

userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {
            _id: this.id,
            email:this.email,
            username:this.username,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    ) 
}

userSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
            _id: this.id,
           
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User=mongoose.model("User", userSchema)   //in mongodb : saved as users