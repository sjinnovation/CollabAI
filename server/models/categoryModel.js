import mongoose from "mongoose";

const categorySchema = mongoose.Schema(
  {
    category_name: {
        type: String,
        required: true,
        unique: true
  },
  is_deleted: {
    type: Boolean,
    default: false
  }
},
  {
    timestamps: true,
  }
);

const Category = mongoose.model("Categories", categorySchema);

export default Category;
