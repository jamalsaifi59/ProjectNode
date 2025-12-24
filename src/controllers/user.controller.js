import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { UploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"



const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(
            500, error?.message || "something went wrong while generating access and refresh token"
        )
    }
}
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

// LogIn User
const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body
    if (!(username || email)) {
        throw new ApiError(400, "username or email is required")
    }

    if (!password) {
        throw new ApiError(400, "password is required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    }).select("+password")
    if (!user) {
        throw new ApiError(404, "user dose not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "password is invalid")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: loggedInUser
            },
                "User logged in Successfully"
            )
        )

})

const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User Logout "))

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unathorized request")
    }

    const decodedToken = jwt.verify(
        incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET
    )
    const user = await User.findById(decodedToken?._id)
    if (!user) {
        throw new ApiError(401, "Invalid refresh Token")
    }

    if (!incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Refresh token is expire or used")
    }

    const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(200,
                { accessToken, refreshToken: newRefreshToken },
                "Access Token Refreshed Successfully"
            )
        )
})

const changeCurrentPassord = asyncHandler(async (req, res) => {
    const { oldPassord, newPassord } = req.body
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassord)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Old Password is Invalid")
    }

    user.password = newPassord
    await user.save({ validateBeforeSave: false })

    return res.status(200)
        .json(new ApiResponse(200, {}, "Old Password is change"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200)
        .json(200, req.user, "Current User Fetched Succesfully")
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body
    if (!fullname || !email) {
        throw new ApiError(400, "All Field are required")
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email: email
            }
        },
        { new: true }
    ).select("-password")

    return res.status(200)
        .json(new ApiResponse(200, user, "Account Details Updated Successfully"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file Is Missing")
    }

    const avatar = await UploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password")

    return res.status(200)
        .json(new ApiResponse(200, user, "Updated Avatar is Successfully"))
})
const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "CoverImage file Is Missing")
    }

    const coverImage = await UploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password")

    return res.status(200)
        .json(new ApiResponse(200, user, "Updated coverImage is Successfully"))
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "Username is missing")
    }


    // code pipline 
    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subcriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subcribersCount: {
                    $size: "$subcribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubcribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subcribers.subcriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project:{
                fullname: 1,
                username: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
                subcribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubcribed: 1,

            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError (404,"Channel Does Not Exists")
    }
    console.log(channel)
    return res.status(200)
    .json(
        new ApiResponse (200, channel[0],"User Channel fetched Successfully")
    )
})

const getWatchHistory = asyncHandler(async(res,res)=>{
    const user = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1,
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200)
    .json(
        new ApiResponse(200,user[0],watchHistory,"Watch History Fetched Successfully")
    )
})

export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    changeCurrentPassord,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}