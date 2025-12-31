import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getVideoComments = asyncHandler (async (req, res) =>{
    const { videoId } = req.params;
    const { page = 1, limit = 10} = req.query;

    if(!videoId || isValidObjectId(videoId)){
        throw new ApiError (400, "Invalid videoId");
    }

    const video = await video.findById(videoId);
    if(!video){
        throw new ApiError (404, "video not found")
    }

    const options = { page: Number(page), limit: Number(limit)};
    const commentAggregate = Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
    {
      $project: {
        "owner.refreshToken": 0,
        "owner.password": 0,
      },
    },
  ]);

  const paginatedComments = await Comment.aggregatePaginate(
    commentAggregate,
    options
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      paginatedComments,
      "Comments fetched successfully"
    )
  );
});

const createComment = asyncHandler (async (req,res)=>{
    const { content } = req.body;
    const { videoId } = req.params;
    const { _id: owner } = req.user;

    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError (400, "Invalid videoId");
    }

    const video = await video.findById(videoId);
    if(!video){
        throw new ApiError (404, "video not found")
    }

    const comment = await Comment.create({
        content,
        video: video._id,
        owner
    })

    return res.status(200).json(
        new ApiResponse(
            200,
            comment,
            "Comment created successfully"
        )
    );
})

const updateComment = asyncHandler (async (req,res)=>{
    const { commentId} = req.params;
    const { content} = req.body;

    if(!commentId || !isValidObjectId(commentId)){
        throw new ApiError (400, "Invalid commentId");
    }

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content
            }
        },
        { new: true }
    )

    return res.status(200).json(
        new ApiResponse(
            200,
            comment,
            "Comment updated successfully"
        )
    );
})

const deleteComment = asyncHandler (async (req,res)=>{
    const { commentId} = req.params;
    if(!commentId || !isValidObjectId(commentId)){
        throw new ApiError (400, "Invalid commentId")
    }
    await Comment.findByIdAndDelete(commentId);
    return res.status(200).json(
        new ApiResponse(200, "Comment Deleted Successfully")
    )
})

export { getVideoComments, createComment, updateComment, deleteComment}