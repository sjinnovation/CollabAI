import mongoose from "mongoose";

const SpecificRefreshTokenSchema = mongoose.Schema(
    {
        service_id: {
            type: mongoose.Schema.Types.ObjectId, // Reference to ServiceList's _id
            ref: "service_list",
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },
        refresh_token: {
            type: String,
            required: true,
        },
        service_name: {
            type: String,
            required: false,
        }
    },
    { timestamps: true }
);

const SpecificRefreshToken = mongoose.model("specific_refresh_token", SpecificRefreshTokenSchema);

export default SpecificRefreshToken;