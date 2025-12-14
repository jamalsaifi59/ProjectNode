import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import { console } from "inspector";

 Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, //dluj7wg9c
        api_key: process.env.CLOUDINARY_API_KEY,            //848227369961317
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });

    const UploadOnCloudinary = async (localFilepath)=>{
        try {
            if (!localFilepath){
                console.log("File Not Find")
            }
            //upload the file on cloudinary
            const response = await cloudinary.uploader.upload(localFilepath,{
                resource_type : "auto",
            })
            // upload the file successfully on cloudinary
            console.log ("file is uploaded successfully on cloudinary", response.url);
            return response;
        } catch (error) {
            fs.unlinkSync(localFilepath)
            return null
            
        }

    }