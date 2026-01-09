import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.model.js";

const createplaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name?.trim() || !description?.trim()) {
        throw new ApiError(400, "name and description are required")
    }

    const newPlaylist = await Playlist.create({
        name: name.trim(),
        description: description.trim(),
        owner: req.user._id
    })

    return res.status(201).json(
        new ApiResponse(201, "playlist created successfully", newPlaylist)
    )
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "invalid user Id")
    }

    const playlists = await Playlist.find({
        owner: userId
    })

    return res.status(200).json(
        new ApiResponse(200, "User Playlist fetched successfully", playlists)
    )

});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "invalid playlist Id")
    }
    const playlist = await Playlist.findById(playlistId).populate("video")

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    return res.status(200).json(
        new ApiResponse(200, playlist, "Playlist fetched successfully")
    )

});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    if (!isValidObjectId(playlistId)){
        throw new ApiError(400, "invalid playlist Id")
    }
    if (!isValidObjectId(videoId)){
        throw new ApiError(400, "invalid video Id")
    }

    const playlist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user._id
        },
        {
            $addToSet: {
                video: videoId
            }
        },
        {
            new: true
        }
    )

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    };

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    return res.status(200).json(
        new ApiResponse(200, playlist, "video added successfully")
    )

});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "playlist and video ID invalid")
    }

    const updatedPlaytlist = await Playlist.findByIdAndUpdate(
        {
            _id: playlistId,
            owner: req.user._id
        },
        {
            $pull: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            new: true
        }
    )

    if (!updatedPlaytlist) {
        throw new ApiError(404, "Playlist Not found")
    }

    return res.status(200).json(
        new ApiResponse(200, updatedPlaytlist, "video remove successfully")
    )

});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "invalid playlist ID")
    }

    const deleteVideo = await Playlist.findByIdAndDelete(
        {
            _id: playlistId,
            owner: req.user._id
        }
    )

    if (!deleteVideo) {
        throw new ApiError(404, "playlist not found")
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "playlist deleted successfully")
    )

});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlistId");
    }

    const updateObj = {};

    if (name !== undefined) {
        if (name.trim() !== "") {
            updateObj.name = name.trim();
        }
    }

    if (description !== undefined) {
        if (description.trim() !== "") {
            updateObj.description = description.trim();
        }
    }

    if (!Object.keys(updateObj).length) {
        throw new ApiError(400, "No fields provided for update");
    }

    const currentPlaylist = await Playlist.findOne({
        _id: playlistId,
        owner: req.user._id,
    });

    if (!currentPlaylist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (updateObj?.name && currentPlaylist.name === updateObj.name) {
        throw new ApiError(400, "Please update the playlist name");
    }

    if (updateObj?.name) {
        const duplicate = await Playlist.findOne({
            owner: req.user._id,
            _id: { $ne: playlistId },
            name: { $regex: new RegExp(`^${updateObj.name}$`, "i") },
        });

        if (duplicate) {
            throw new ApiError(409, "You already have a playlist with this name");
        }
    }

    if (updateObj?.name) currentPlaylist.name = updateObj.name;
    if (updateObj?.description)
        currentPlaylist.description = updateObj.description;

    await currentPlaylist.save();

    return res
        .status(200)
        .json(
            new ApiResponse(200, currentPlaylist, "Playlist updated successfully")
        );

});

export {
    createplaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}