import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js"
import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js"

const createTweets = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const userId = req.userId;

    if(!content?.trim()){
        throw new ApiError (400, "content is required")
    }

    const tweet = await Tweet.create({
        content,
        owner: userId
    })
    if(!tweet){
        throw new ApiError (404, "Tweet not found")
    }

    return res.status (201).json(
        new ApiResponse (201, "Tweet created successfully", tweet)
    )

});

const getUserTweets = asyncHandler (async (req, res) =>{
    const userId = req.userId;
    const tweet = await Tweet.find({owner: userId}).populate("owner", "username email");
    return res.status (200).json(
        new ApiResponse (200, "User tweets fetched successfully", tweet)
    )
});

const updateTweets = asyncHandler (async (req, res) =>{
    const { tweetId } = req.params;
    if(!tweetId?.trim() || !isValidObjectId(tweetId)){
        throw new ApiError (400, "Invalid TweetId")
    }
    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set:{
                content: req.body.content,
                owner: req.userId
            }
        },
        {
            new: true
        }
    )
    if(!tweet){
        throw new ApiError (404, "Tweet not found")
    }
    return res.status(200).json(
        new ApiResponse (200, "Tweet updated successfully",tweet)
    )
});

const deleteTweets = asyncHandler (async (req, res) =>{
    const {tweetId} = req.params;

    if(!tweetId || !isValidObjectId(tweetId)){
        throw new ApiError (400, "Invalid tweetId")
    }

    const tweet = await Tweet.findByIdAndDelete(tweetId)

    if(!tweet){
        throw new ApiError (404, "Tweet not found")
    }

    return res.status(200).json(
        new ApiResponse (200, "Tweet Deleted successfully", tweet)
    )
})
export {
    createTweets,
    getUserTweets,
    updateTweets,
    deleteTweets
}