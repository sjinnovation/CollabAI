import mongoose from "mongoose";

const subscriptionSchema = mongoose.Schema(
  {
    planId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    interval: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    subscription_status: {
      type: String,
      required: true,
      default: "active",
    },
    tokens :
    {
      type: Number,
      required: true,
    },
    priceId: {
      type: String,
      required: false,
    },
    isdeleted : {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
