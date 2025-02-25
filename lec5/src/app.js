import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

const app=express()

//middlewares are configured using app.use()
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))

//limiting the json daata  to 16 kb using middleware
app.use(express.json({limit:"16kb"}))

//anther middleware is there, so that the data doesn't goes directly to the url, hence the url itselt encode it 
app.use(express.urlencoded({extended: true, limit: "16kb"}))

//static middleware is used to save some of the files to a folder , for some use
app.use(express.static("public"))
app.use(cookieParser())


//routes import below:
import userRouter from './routes/user.route.js';




//routes declaration
app.use("/api/v1/users",userRouter);


//so initial route will be like : http://localhost:8000:/api/v1/users/<register/login>   and then will be passed to the user router to add further route
export {app}