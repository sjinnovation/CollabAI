import mongoose from 'mongoose';

const TechStackSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String }, // E.g., Frontend, Backend, Database
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const TechStack = mongoose.model('TechStack', TechStackSchema);
export default TechStack;