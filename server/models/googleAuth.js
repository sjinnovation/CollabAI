import mongoose from "mongoose";
const GoogleAuthSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    code: {
        type: String,
        required: true
    },
    accessToken: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String,
        required: true
    },
}, {
    timestamps: true,
},);
const GoogleAuth = mongoose.model("GoogleAuth", GoogleAuthSchema);
export default GoogleAuth;
