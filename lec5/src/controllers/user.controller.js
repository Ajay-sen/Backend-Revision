import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError";
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"


const generateAccessAndRefreshTokens=async(userId)=>{
    try{
        const user =await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false}) //validateBeforeSave will eliminate validation for saving refreshToken
        return {accessToken, refreshToken}        

    }catch(error){
        throw new ApiError(500,"Something went wrong while generating refresh and access token")
    }
}


//notice this below syantax carefully, will be used many time
//how the async is getting implemented here, which eliminates the need to write them in a try-catch block

//REGISTER USER>>>>>>

const registerUser=asyncHandler(async (req,res)=>{
    // res.status(200).json({
    //     message:"ok"
    // })

    //steps to register:------>>>
    // get user details from frontend
    //validation- not empty
    //check if user already exist: username, email
    //check for images, check for avatar
    //upload them to cloudinary, avatar
    //create user object-craete entry in db
    //remove password and refresh token firled from response
    //check jfor user creation
    //return res

    const {fullName, email,username, password}=req.body
    console.log("email: ",email);

   if(
    [fullName,email,username,password].some((field)=>field?.trim()==="")
   ){
    throw new ApiError(400,"All fields are required") 
   }

   //check if user with this credential already existe or not
   //for taht import user from  usermodel and find in the databse, bcaz usermodel can directly interact with the database

   const existedUser=await User.findOne({
    $or:[{username},{email}] //you can use OR, AND and many ops on objects, it will check on all
   })

   if(existedUser){
    throw new ApiError(409,"User with email or username already exist")
   }

   //now check for the files bwing handles or accepted using multer
   //req.files contain a number of properties, the avatar(name you have givrn in the multer) property is a  array and its first element contains the file
   const avatarLocalPath=req.files?.avatar[0]?.path; //getting that files path if exist
   const coverImageLocalPath=req.files?.coverImage[0];

   if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is required");
   }

   //now we have to upload this file to the cloudinary
   //it will take time hence use await
   const avatar=await uploadOnCloudinary(avatarLocalPath)

   const coverImage=await uploadOnCloudinary(coverImageLocalPath)

   //re check the presence of avatar, since it is a req filed
   if(!avatar){
    throw new ApiError(400,"Avatar file is required");
   }


   //now everything works fine above than just create a object of all the details and push them into the database
   const user=await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
   })


   //now check if the user is created or not by checking the databse
   const createdUser=await User.findById(user._id).select(
    "-password -refreshToken"
   )

   if(!createdUser){
    throw new ApiError(500,"Something went wrong while registering the user")
   }

   return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered Successfully")
   )
})


// LOGIN USER>>>>>>>

const loginUser=asyncHandler(async(req,res)=>{
    //req body->data
    //username and email
    //find the user
    //password chck
    //access and refresh token
    //send cokkie

    const {email,username, password}=req.body
    if(!username || !email) //logining with both username and email, you can choose one to do so also
        throw new ApiError(400,"username or email is required")

    const user=await User.findOne({
        $or: [{username},{email}]
    })

    if(!user){
        throw new ApiError(400,"user does not exist")
    }

    const isPasswordValid=await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user credentials")
    }

    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)

    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")  //remove the password and refreshtoken before sending to the user

    //will sent cookies:
    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("aqccessToken",accessToken, options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "User logged In Successfully"
        )
    )
})

//LOGOUT USER>>>>>> 

const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(  //
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new: true
        }
    )

    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refresToken",options)
    .json(new ApiResponse(200,{},"User logged Out"))

})

//end point for refresh token>>>

const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken

    if(incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
    }

   try{

    const decodedToken=jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    )

    const user=User.findById(decodedToken?._id)

    if(!user){
        throw new ApiError(401,"invalid refresh token")
    }

    if(incomingRefreshToken!==user?.refreshToken){
        throw new ApiError(401,"Refresh token is expired or used")
    }

    const options={
        httpOnly:true,
        secure:true
    }

    const {accessToken,newRefreshToken}=  await generateAccessAndRefreshTokens(user._id)

    return res
    .secret(200)
    .cookie("sccessToken",accessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json(
        new ApiResponse(
            200,
            {accessToken,refreshToken:newRefreshToken},
            "Access token refreshed"
        )
    )
   }catch(error){

        throw new ApiError(401,error?.message || "Invalid refresh token")
   }

})

// changing password controller

const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body

    const user=await User.findById(req.user?._id) //find the user in DB whois requesting
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword) //it will give true/false

    if(!isPasswordCorrect)
    {
        throw new ApiError(400,"Invalid old password");
    }

    user.password=newPassword
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password changed successfully"))
})

//controller to get the curent user
const getCurrentUser=asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(200,req.user,"current user fetched successfully")
})

//controller to update teh user details
const updateAccountDetails=asyncHandler(async(req,res)=>{
    //its upon you what all details you want to change 
    //like you tube does not allow usrname to change but insta does

    const {fullName, email}=req.body

    if(!fullName || !email){
        throw new ApiError(400,"All fields are required")
    }

    // to update the , first find theuser
    const user=User.findByIdAndUpdate(
        req.user?._id,
        { //here you have to update the details using the mongodb operators
            $set:{
                fullName,
                email:email
            }

        },
        {new:true}  //on making this true , it will return the new updated info after updation
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Account details updated successfully"))
})

//update the avatar
const updateUserAvatar=asyncHandler(async(req,res)=>{
    //here will get the fileds from multer
    const avatarLocalPath= req.file?.path

    if(!avatarLocalPath)
    {
        throw new ApiError(400,"Avatar file is missing")
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url)
    {
        throw new ApiError(400,"Error while uploading on avatar")
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {
            new:true
        }
    ).select("-password")
})


//update the cover image
const updateUserCoverImage=asyncHandler(async(req,res)=>{
    //here will get the fileds from multer
    const coverImageLocalPath= req.file?.path

    if(!coverImageLocalPath)
    {
        throw new ApiError(400,"coverImage file is missing")
    }

    const coverImage=await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url)
    {
        throw new ApiError(400,"Error while uploading on coverImage")
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:avatar.url
            }
        },
        {
            new:true
        }
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"cover image updated successfully")
    )
})


//controller to get the user channel profile details
//use of aggregation pipelining
const getUserChannelProfile=asyncHandler(async(req,res)=>{
    const {username}=req.params

    if(!username?.trim())
    {
        throw new ApiError(400,"username is missing")
    }

    const channel=await User.aggregate([    //aggregate pipiline always returns arrays hence write like that
        {
            $match:{
                username:username?.toLowerCase() //find the user using username(here) to apply further query
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignFeild:"channel",
                as:"subscribers"
            }
        },
        {   //next stage
            $lookup:{
                from: "subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers",

                },
                channelsSubscribedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{//what all fields you need to send , make the 1 here
                fullName:1,
                username:1,
                subscribersCount:1,
                channelSubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1
            }
        }
    ]) 

    if(!channel?.length){
        throw new ApiError(404,"channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,channel[0],"User channel fetched successfully")
    )

})


//contriller for watch history
//use of sub pipelining

const getWatchHistory=asyncHandler(async(req,res)=>{
    const user=await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignFeild:"_id",
                as:"watchHistory",
                pipeline:[ //sub pipelining
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignFeild:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "watch history fetched successfully"
        )
    )
})



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}; 