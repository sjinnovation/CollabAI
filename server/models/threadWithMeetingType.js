import mongoose from "mongoose";

import { Schema } from "mongoose";

const threadWithMeetingTypeSchema = mongoose.Schema(
  {
    meetingType: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'MeetingType'
    },
    userid:{
        type: Schema.Types.ObjectId,
        required:true,
        ref:'User'

    },
    threadid:{
        type:String,
        required: true,
        ref: 'promptModel'
    }
  },
  { timestamps: true }
);

const ThreadWithMeetingType = mongoose.model("ThreadWithMeetingType", threadWithMeetingTypeSchema);

export default ThreadWithMeetingType;
