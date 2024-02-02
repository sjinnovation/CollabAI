import mongoose from "mongoose";

const subscriberSchema = mongoose.Schema(
  {
    userid: {
        type: String,
        required: true,
        ref: "user",
        },
    planId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    subscription_status: {
      type: String,
      required: true,
      default: "active",
    },
    customer_id: {
      type: String,
      required: true,
    },
    subscription_id: {
      type: String,
      required:true 
    },
    
    compid: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Subscriber = mongoose.model("Subscriber", subscriberSchema);

export default Subscriber;
