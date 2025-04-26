import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) return null;
  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // console.log("File has beenn successfully uploaded on ", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    if (localFilePath) fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteFromCloudinary = async (fileUrl) => {
  if (!fileUrl) {
    throw new ApiError(400, "File URL cannot be null or undefined");
  }

  try {
    const urlParts = fileUrl.split("/");
    const fileNameWithExtension = urlParts[urlParts.length - 1]; // Extract last part (e.g., s2yxfcrfiigmk2m1aywi.png)
    const publicId = fileNameWithExtension.split(".")[0]; // Remove the file extension

    const res = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    console.log("Deletion response:", res);

    return res;
  } catch (error) {
    console.error("Error during deletion:", error);
    throw new ApiError(400, "File cannot be deleted");
  }
};

const deletevideoFromCloudinary = async (fileUrl) => {
  if (!fileUrl) {
    throw new ApiError(400, "File URL cannot be null or undefined");
  }

  try {
    const urlParts = fileUrl.split("/");
    const fileNameWithExtension = urlParts[urlParts.length - 1]; // Extract last part (e.g., s2yxfcrfiigmk2m1aywi.png)
    const publicId = fileNameWithExtension.split(".")[0]; // Remove the file extension

    const res = await cloudinary.uploader.destroy(publicId, {
      resource_type: "video",
    });

    console.log("Deletion response:", res);

    return res;
  } catch (error) {
    console.error("Error during deletion:", error);
    throw new ApiError(400, "File cannot be deleted");
  }
};

export { uploadOnCloudinary, deleteFromCloudinary, deletevideoFromCloudinary };
