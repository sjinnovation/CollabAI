import mongoose from "mongoose";

const RevenueSchema = new mongoose.Schema(
  {
    project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    projected_revenue: { type: Number, required: true },
    revenue: { type: Number, required: true },
    benefits: [{ type: Number }], 
    created_at: { type: Date, default: Date.now },
  }
);

const Revenue = mongoose.model("Revenue", RevenueSchema);

export default Revenue;