// import mongoose from "mongoose";
// import {DB_NAME} from "./constants"

//require('dotenv').config({path:'./env'})  //in this way we can add the env files available to all the files in the project, but this is inconsistence since here we are using require, while all other plakces we are usng import, hence need other way to iport:

//and to use import statement for dotenv , you have to add -r dotenv/config --experimental-json-modules in the package .json in dev command , s o that as the server is started this get supplied to all the files. 

// require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js";

dotenv.config({
    path:'./env'
})


//second method to connect
//in this method we will do the conection inside the db folder in index.js


//since connectDB is async , hence it will return a promise, so handle them using .then, .catch
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`server is running at port : ${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log("MONGO db connection failed !!!", error);
})












//#### this is the first method  to connect and setup in this both mongo and express,

// import express from "express"
// const app=express()

// (async()=>{
//     try{
//         mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error",(error)=>{
//             console.log("ERR:",error);
//             throw error
//         })

//         app.listen(process.env.PORT,()=>{
//             ContentVisibilityAutoStateChangeEvent.log(`App is listening on port ${process.env.PORT}`)
//         })
//     }catch(error){
//         console.error("ERROR",error)
//         throw err
//     }
// })()