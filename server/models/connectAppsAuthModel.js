
import mongoose from "mongoose";
const connectAppsAuthSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    appName:{
        type:String,
        required : true
        
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
    scope:{
        type: Array,
        required :false
    }, 
    tokenType:{
        type :String,
        required : false

    },
}, {
    timestamps: true,
},);
const connectAppsAuth = mongoose.model("connectAppsAuth", connectAppsAuthSchema);
export default connectAppsAuth;
