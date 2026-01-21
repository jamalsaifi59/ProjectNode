import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subcriptions } from "../models/subscription.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const userSubscription = asyncHandler (async (req, res) => {
    const { channelId } = req.params;
    if(!isValidObjectId(channelId)){
        throw new ApiError (400, "invalid channel Id")
    }

    const exitstingChannel = await User.findById(channelId)
    if (!exitstingChannel){
        throw new ApiError  (404, "channel not found")
    }

    const exitstingSubscription = await Subcriptions.findOne({
        channel: channelId,
        subscriber: req.user._id
    })

    if(exitstingSubscription){
        await exitstingSubscription.deleteOne();

        return res.status(200).json (
            new ApiResponse (200, "unsubscribed successfully",{})
        )
    }

    const newSubscription = await Subcriptions.create({
        channel: channelId,
        subscriber: req.user._id
    })

    return res.status(201).json (
        new ApiResponse (201, "subscribed successfully", newSubscription)
    )
});

const getUserChannelSubscriber = asyncHandler (async (req, res) => {
        const { subscriberId } = req.params;
    if(!isValidObjectId(subscriberId)){
        throw new ApiError (400, "invalid subscriber Id")
    }
    const exitstingUser = await User.findById(subscriberId)

    if(!exitstingUser){
        throw new ApiError (404, "subscriber user not found")
    }

    const subscribers = await Subcriptions.find(
        {
            channel: subscriberId
        }
    )

    return res.status(200).json(
        new ApiResponse (200, "subscriber fetched successfully", subscribers)
    )
});

const getSubscriberChannel = asyncHandler (async (req, res) => {
    const { channelId } = req.params;
    if(!isValidObjectId(channelId)){
        throw new ApiError (400, "invalid channel Id")
    }

    const exitstingUser = await User.findById(channelId);
    if(!exitstingUser){
        throw new ApiError (404, "channel user not found")
    }

    const channelSubscriber = await Subcriptions.find({
        subscriber: channelId
    }).populate({
        path: "channel",
        select: "-refreshToken -password"
    })

    return res.status(200).json (
        new ApiResponse (200, channelSubscriber, "channel subscriber fetched successfully")
    )

});

export {
     userSubscription,
     getUserChannelSubscriber,
     getSubscriberChannel
}