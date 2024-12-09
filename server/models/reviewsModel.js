import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  header: { type: String, required: true },
  comment: { type: String },
  rating: { type: Number, min: 1, max: 5, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const Review = mongoose.model('Review', ReviewSchema);
export default Review;
