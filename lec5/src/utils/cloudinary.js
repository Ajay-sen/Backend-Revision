// using this file we will uload some file from "local" to clodinary and after that we ll also remove that from loacl

import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

//the values of the below config , will get from cloudinary website
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
})

//uploading can cause error , hence keep in try-catch block
//uploading will also take time , hence make it async-await
const uploadOnCloudinary=async(localFilePath)=>{
    try{
        if(!localFilePath) return null;
        //upload to cloudinary
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"  //any type of file
        })

        console.log("uploaded successsfully",response.url);

        //uploaded successfully , now need to remove it from local
        fs.unlinkSync(localFilePath)
        return response;

    }catch(error){
        fs.unlinkSync(localFilePath);
        //remove the locally saved temp file as the upload was failed, the file may be malacious hence remove it , even the upload was not done
    }
}

export {uploadOnCloudinary};