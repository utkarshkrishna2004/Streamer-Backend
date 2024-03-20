import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
// Common use for the "File System" module: Read, Create, Update, Delete, Rename files

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.log("Couldn't find the local file path..!");
            return null;
        }

        //next step: upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        // file has been uploaded successfully..!
        console.log("file is uploaded in cloudinary ", response.url);
        return response;
        
    } catch (error) {
        fs.unlinkSync(localFilePath); // removes the locally saved temproary file as the upload operation got failed!
        return null;
    }
};

export { uploadOnCloudinary };
