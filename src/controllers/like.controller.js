import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "invalid video id")
    }

    const videoLike = await Like.findOne({
        Video: videoId,
        likeBy: req.user._id
    });

    if (!videoLike) {
        const video = await Video.findById(videoId);
        if (!video) {
            throw new ApiError(404, "video not found")
        }

        const newLike = await Like.create({
            Video: videoId,
            likeBy: req.user._id
        })

        return res.status(201).json(
            new ApiResponse(201, " Video like successfully", newLike)
        )

    }

    await videoLike.remove();
    return res.status(200).json(
        new ApiResponse(200, "Video like deleted successfully")
    )
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.body;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "invalid comment id")
    }

    const commentLike = await Like.findOne({
        Comment: commentId,
        likeBy: req.user._id
    })

    if (!commentLike) {
        const comment = await Comment.findById(commentId);
        if (!comment) {
            throw new ApiError(404, "comment not found")
        }

        const newLike = await Like.create({
            Comment: commentId,
            likeBy: req.user._id
        })

        return res.status(201).json(
            new ApiResponse(201, "comment like successfully", newLike)
        )
    }

    await commentLike.remove();
    return res.status(200).json(
        new ApiResponse(200, "Comment like deleted successfully")
    )
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.body;
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "invalid Tweet Id")
    }

    const tweetLike = await Like.findOne({
        Tweet: tweetId,
        likeBy: req.user._id
    })

    if (!tweetLike) {
        const tweet = await Tweet.findById(tweetId)

        if (!tweet) {
            throw new ApiError(404, "Tweet not found")
        }

        const newLike = await Like.create({
            Tweet: tweetId,
            likeBy: req.user._id
        })

        return res.status(201).json(
            new ApiResponse(201, "Tweet like successfully", newLike)
        )
    }

    await tweetLike.remove();
    return res.status(200).json(
        new ApiResponse(200, "Tweet like deleted successfully")
    )
});

const getLikeVideo = asyncHandler(async (req, res) => {
    const likeVideo = await Like.find({
        likeBy: req.user._id,
        video: { $exists: true }
    }).populate("video")

    return res.status(201).json(
        new ApiResponse(201, "All like video fetched successfully", likeVideo)
    )
})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikeVideo
}