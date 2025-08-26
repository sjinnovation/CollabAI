import config from '../models/configurationModel.js';
 import { encrypt } from '../utils/configEncription.js';

 const sensitiveKeys = [
     'openaikey',
     'geminiApiKey',
     'claudeApiKey',
     'togetheraiKey',
     'linkedinClientId',
     'linkedinClientSecret',
     'vsCodeOpenaikey',
     'vsCodeClaudeKey'
 ];

 const isMasked = (value) => {
     return value.includes('***');
 };

 const migrateConfigs = async () => {
     try {
         console.log('Starting config encryption migration...');

         for (const key of sensitiveKeys) {
             const configDoc = await config.findOne({ key });
             if (configDoc && !isMasked(configDoc.value)) {
                 try {
                     // Encrypt the value
                     const encryptedValue = await encrypt(configDoc.value, configDoc._id);

                     // Update the config with encrypted value
                     await config.updateOne(
                         { _id: configDoc._id },
                         { $set: { value: encryptedValue } }
                     );

                     console.log(`Successfully migrated ${key}`);
                 } catch (error) {
                     console.error(`Error migrating ${key}:`, error);
                 }
             }
         }

         console.log('Migration completed successfully');
     } catch (error) {
         console.error('Migration failed:', error);
     }
 };

 // Run migration
 migrateConfigs()
     .then(() => process.exit(0))
     .catch(() => process.exit(1));  