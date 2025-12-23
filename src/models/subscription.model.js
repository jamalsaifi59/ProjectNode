import mongoose, { Schema } from "mongoose";

const subcriptionSchema = new Schema({
    subcriber:{
        type:Schema.Types.ObjectId,
        ref: "User"
    },
    channel:{
        type:Schema.Types.ObjectId,
        ref: "User"
    },
},{
    timestamps: true
}
)

export const subcriptions = mongoose.model("Subcription",subcriptionSchema)