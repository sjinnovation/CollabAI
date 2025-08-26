import crypto from 'crypto';
 import EncryptionMetadata from '../models/encryptionMetadataModel.js';

 const algorithm = 'aes-256-cbc';

 export const encrypt = async (text, configId) => {
     try {
         // Generate new key and IV for each encryption
         const key = crypto.randomBytes(32);
         const iv = crypto.randomBytes(16);

         // Create cipher
         const cipher = crypto.createCipheriv(algorithm, key, iv);
         let encrypted = cipher.update(text);
         encrypted = Buffer.concat([encrypted, cipher.final()]);

         // Store encryption metadata
         await EncryptionMetadata.create({
             configId,
             key: key.toString('hex'),
             iv: iv.toString('hex')
         });

         // Return only the encrypted data
         return encrypted.toString('hex');
     } catch (error) {
         console.error('Encryption error:', error);
         throw error;
     }
 };

 export const decrypt = async (encryptedText, configId) => {
     try {
         // Retrieve encryption metadata
         const metadata = await EncryptionMetadata.findOne({ configId });
         if (!metadata) {
             throw new Error('Encryption metadata not found');
         }

         // Convert stored hex strings back to buffers
         const key = Buffer.from(metadata.key, 'hex');
         const iv = Buffer.from(metadata.iv, 'hex');
         const encryptedData = Buffer.from(encryptedText, 'hex');

         // Create decipher
         const decipher = crypto.createDecipheriv(algorithm, key, iv);
         let decrypted = decipher.update(encryptedData);
         decrypted = Buffer.concat([decrypted, decipher.final()]);

         return decrypted.toString();
     } catch (error) {
         console.error('Decryption error:', error);
         throw error;
     }
 };

 // Helper function to check if a value is encrypted
 export const isEncrypted = async (configId) => {
     const metadata = await EncryptionMetadata.findOne({ configId });
     return !!metadata;
 };

 // In any controller that needs to use these values
 export const getDecryptedConfig = async (key) => {
     const configValue = await config.findOne({ key });
     if (!configValue) return null;

     try {
         const encryptedData = JSON.parse(configValue.value);
         if (encryptedData.iv && encryptedData.encryptedData) {
             return decrypt(encryptedData);
         }
         return configValue.value;
     } catch (e) {
         return configValue.value;
     }
 };