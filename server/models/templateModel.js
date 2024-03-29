import mongoose from "mongoose";

  import { Schema } from "mongoose";

const templateSchema = mongoose.Schema(
    {
            title: {
              type: String,
              required: true,
              
            },
            description: {
              type: String,
              required: true,
              
            },
            category: {
              type: Schema.Types.ObjectId,
              required: true,
              ref: "categories",
            },
    },
    { timestamps: true }
);

const Template = mongoose.model("Template", templateSchema);

export default Template;