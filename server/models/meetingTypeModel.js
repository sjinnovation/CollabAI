import mongoose from "mongoose";

import { Schema } from "mongoose";

const meetingTypeSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    isDeleted: { 
      type: Boolean, 
      default: false 
    }
  },
  { timestamps: true }
);

const MeetingType = mongoose.model("meetingType", meetingTypeSchema);

export default MeetingType;
