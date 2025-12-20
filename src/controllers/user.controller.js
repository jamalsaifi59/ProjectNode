import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { UploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"


const registerUser = asyncHandler(async (req, res) => {

    // get user for frontend
    const { username, fullname, email, password } = req.body
    // console.log("email: ", email)

    // validation check 
    if ([fullname, username, email, password].some(field => !field?.trim())) {
        throw new ApiError(400, "All fields are required");
    }


    // check if user already exist : username, email
    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existingUser) {
        throw new ApiError(409, "User all already exist")
    }

    //check for images and avatar

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    console.log("Files :", req.files)

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar file is required")
    }

    // upload them to cloudinary

    const avatar = await UploadOnCloudinary(avatarLocalPath)
    // const coverImage = await UploadOnCloudinary(coverImageLocalPath)
    if (!avatar?.url) {
        throw new ApiError(400, "avatar file is required")
    }
    let coverImage;
    if (coverImageLocalPath) {
        coverImage = await UploadOnCloudinary(coverImageLocalPath);
    }


    // create user object,create entry in db

    const user = await User.create({
        fullname,
        email,
        password,
        avatar: avatar?.url,
        coverImage: coverImage?.url || "",
        username: username.trim().toLowerCase(),
    })

    // remove password and refresh token
    const createUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!createUser) {
        throw new ApiError(500, "something went wrong while registering user")
    }

    return res.status(201).json(
        new ApiResponse(201, createUser, "User Register Successfully")
    )

})

export { registerUser }