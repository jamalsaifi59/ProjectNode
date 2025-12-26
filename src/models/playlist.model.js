import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    video: [
        {
        type: Schema.Types.ObjectId,
        ref: "Video"
    }
    ],
    description: {
        type: String
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User"
    }
},
    { timestamps })

export const Playlist = mongoose.model("Playlist", playlistSchema)