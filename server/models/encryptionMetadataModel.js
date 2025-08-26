import mongoose from 'mongoose';

 const encryptionMetadataSchema = new mongoose.Schema({
     configId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'config',
         required: true
         },
     key: {
         type: String,
         required: true
     },
     iv: {
         type: String,
         required: true
     },
     createdAt: {
         type: Date,
         default: Date.now
     },
     updatedAt: {
         type: Date,
         default: Date.now
     }
 });

 // Update the updatedAt timestamp before saving
 encryptionMetadataSchema.pre('save', function(next) {
     this.updatedAt = new Date();
     next();
 });

 // Add index for faster lookups
 encryptionMetadataSchema.index({ configId: 1 }, { unique: true });
 const EncryptionMetadata = mongoose.model('encryptionMetadata', encryptionMetadataSchema);

 export default EncryptionMetadata;