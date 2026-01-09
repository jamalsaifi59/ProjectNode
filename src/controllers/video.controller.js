import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { UploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, userId, query } = req.query;
    const $match = {
        isPublished: true
    }
    const $options = {
        page: Number(page),
        limit: Number(limit)
    }
    if (query?.trim()) $match.title = { $regex: query.trim(), $options: "i" }
    if (userId || isValidObjectId(userId)) {
        $match.owner_id = new mongoose.Types.ObjectId(userId)
        throw new ApiError(400, "Invalid userId")
    }

    const pipline = [
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            },
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                },
            }
        },
        {
            $project: {
                "owner.refreshToken": 0,
                "owner.password": 0
            }
        },
        {
            $match: $match,
        }
    ]

    const videoAggregate = Video.aggregate(pipline);
    const paginatedVideos = await Video.aggregatePaginate(
        videoAggregate,
        $options
    )
    if (!paginatedVideos) {
        throw new ApiError(404, "Videos not found")
    }
    return res.status(200).json(
        new ApiResponse(200, paginatedVideos, "Videos fetched successfully")
    )
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId || isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }
    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: " users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner",
                }
            }
        },
        {
            $project: {
                "owner.refreshToken": 0,
            }
        }
    ]);

    if (!video) {
        throw new ApiError(404, "Video not found")
    };

    return res.status(200).json(
        new ApiResponse(200, video, "video fetched successfully")
    )
});

const publishVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body || {};

    if (!title?.trim()) {
        throw new ApiError(400, "Title are required")
    }


    const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailFileLocalPath = req.files?.thumbnailFile?.[0]?.path;

    if (!videoFileLocalPath || !thumbnailFileLocalPath) {
        throw new ApiError(400, "video and thumbnail files are required")
    }

    const videoFile = await UploadOnCloudinary(videoFileLocalPath);

    if (!videoFile?.url) {
        throw new ApiError(500, "Failed to upload video file")
    }

    const thumbnailFile = await UploadOnCloudinary(thumbnailFileLocalPath);

    if (!thumbnailFile?.url) {
        throw new ApiError(500, "Failed to upload thumbnail file")
    }

    const video = await Video.create({
        title: title.trim(),
        description,
        video: videoFile?.url,
        thumbnail: thumbnailFile?.url,
        owner: req.user._id,
        duration: videoFile?.duration || 0
    });

    const createdVideo = await Video.create(video);

    if (!createdVideo) {
        throw new ApiError(500, "Something went wrong while uploading video");
    }

    return res.status(200).json(
        new ApiResponse(200, createdVideo, "Video published successfully")
    )

});


const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }
    const { title, description } = req.body || {};
    if (!title?.trim()){
        throw new ApiError (400, "Title changes are required")
    }
    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description,
            }
        },
        { new: true }
    )

    if (!video) {
        throw new ApiError(404, "something went wrong while updating the video")
    }

    return res.status(200).json(
        new ApiResponse(200, video, "Video updated successfully")
    )
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    await Video.findByIdAndDelete(videoId);

    return res.status(200).json(
        new ApiResponse(200, "Video deleted successfully")
    )
})
export {
    getAllVideos,
    getVideoById,
    publishVideo,
    updateVideo,
    deleteVideo
}