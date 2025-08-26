import crypto from 'crypto';
import N8nEncryptionMetadata from '../models/n8nEncryptionMetadataModel.js';

const algorithm = 'aes-256-cbc';

/**
 * Encrypt n8n secret key
 * @param {string} text - The secret key to encrypt
 * @param {string} userId - The user ID
 * @returns {Promise<string>} - Encrypted secret key as hex string
 */
export const encryptN8nSecretKey = async (text, userId) => {
  try {
    // Generate new key and IV for each encryption
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    // Create cipher
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Store encryption metadata
    await N8nEncryptionMetadata.findOneAndUpdate(
      { userId },
      {
        key: key.toString('hex'),
        iv: iv.toString('hex'),
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    // Return only the encrypted data
    return encrypted;
  } catch (error) {
    console.error('n8n Encryption error:', error);
    throw error;
  }
};

/**
 * Decrypt n8n secret key
 * @param {string} encryptedText - The encrypted secret key
 * @param {string} userId - The user ID
 * @returns {Promise<string>} - Decrypted secret key
 */
export const decryptN8nSecretKey = async (encryptedText, userId) => {
  try {
    // Retrieve encryption metadata
    const metadata = await N8nEncryptionMetadata.findOne({ userId });
    if (!metadata) {
      throw new Error('n8n encryption metadata not found');
    }

    // Convert stored hex strings back to buffers
    const key = Buffer.from(metadata.key, 'hex');
    const iv = Buffer.from(metadata.iv, 'hex');
    const encryptedData = Buffer.from(encryptedText, 'hex');

    // Create decipher
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedData, null, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('n8n Decryption error:', error);
    throw error;
  }
};

/**
 * Check if n8n secret key is encrypted
 * @param {string} userId - The user ID
 * @returns {Promise<boolean>} - True if encrypted
 */
export const isN8nSecretKeyEncrypted = async (userId) => {
  const metadata = await N8nEncryptionMetadata.findOne({ userId });
  return !!metadata;
};

/**
 * Clean up n8n encryption metadata
 * @param {string} userId - The user ID
 * @returns {Promise<void>}
 */
export const cleanupN8nEncryptionMetadata = async (userId) => {
  try {
    await N8nEncryptionMetadata.deleteOne({ userId });
  } catch (error) {
    console.error('Error cleaning up n8n encryption metadata:', error);
    throw error;
  }
}; 