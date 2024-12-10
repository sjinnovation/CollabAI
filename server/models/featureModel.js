import mongoose from 'mongoose';

const FeatureSchema = new mongoose.Schema({
    name:{ type:String, required:true},
    description:{ type:String, required:true}
});
const Feature = mongoose.model('Feature', FeatureSchema);
export default Feature;