import mongoose , {Schema} from "mongoose";

const feedbackSchema = new Schema({
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    feedback: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isResolved:{
        type:Boolean,
        default:false
    }
  });

  const feedbackModel = mongoose.model("feedback", feedbackSchema);
  export default feedbackModel;