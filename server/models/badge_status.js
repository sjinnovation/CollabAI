import mongoose from "mongoose";
const badge_statusSchema = mongoose.Schema({
    _id: {
        type:String,
        default: 'globalBadge'
    },
    isVisible: {
        type: Boolean,
        default: false 
    },
    

}, {
    timestamps: true,
},);
const BadgeStatus = mongoose.model("badge_status", badge_statusSchema);
export default BadgeStatus;