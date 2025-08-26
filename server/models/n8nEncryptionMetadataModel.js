import mongoose from 'mongoose';

const n8nEncryptionMetadataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
n8nEncryptionMetadataSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Add index for faster lookups
n8nEncryptionMetadataSchema.index({ userId: 1 }, { unique: true });

const N8nEncryptionMetadata = mongoose.model('n8nEncryptionMetadata', n8nEncryptionMetadataSchema);

export default N8nEncryptionMetadata; 