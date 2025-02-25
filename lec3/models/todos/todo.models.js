import mongoose from "mongoose";

const todoSchema=new mongoose.Schema(
    {
        content:{
            type:String,
            required:true,
        },
        complete:{
            type:Boolean,
            default:false
        },
        createdBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User" //it is compulsory when above object is given
        },
        subTodos:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Subtodo"
            }
        ] //arrays of subtodos
    },{timestamps:true}
)

export const Todo=mongoose.model("Todo",todoSchema)
//?? what will be the name of this schema in DB:    it will be "todos"