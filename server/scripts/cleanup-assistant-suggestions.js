import mongoose from 'mongoose';
import AssistantSuggestions from '../models/assistantSuggestions.js';

async function cleanupAssistantSuggestions() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/collaborativeai_db');
    console.log('Connected to MongoDB');

    // Find records with empty, null, or invalid designations
    const invalidRecords = await AssistantSuggestions.find({
      $or: [
        { designation: null },
        { designation: '' },
        { designation: { $exists: false } },
        { designation: /^\s*$/ } // Only whitespace
      ]
    });

    console.log(`Found ${invalidRecords.length} invalid records`);

    if (invalidRecords.length > 0) {
      console.log('Invalid records:', invalidRecords.map(r => ({ id: r._id, designation: r.designation })));
      
      // Delete invalid records
      const deleteResult = await AssistantSuggestions.deleteMany({
        $or: [
          { designation: null },
          { designation: '' },
          { designation: { $exists: false } },
          { designation: /^\s*$/ }
        ]
      });

      console.log(`Deleted ${deleteResult.deletedCount} invalid records`);
    }

    // Check current indexes
    const indexes = await AssistantSuggestions.collection.getIndexes();
    console.log('Current indexes:', JSON.stringify(indexes, null, 2));

    // Check if there's a problematic index and drop it if needed
    const problematicIndex = indexes.find(idx => 
      idx.key && 
      (idx.key.role === 1 || (idx.key.role === 1 && idx.key.assistant_id === 1))
    );

    if (problematicIndex) {
      console.log('Found problematic index, attempting to drop...');
      try {
        await AssistantSuggestions.collection.dropIndex('role_1_assistant_id_1');
        console.log('Dropped problematic index: role_1_assistant_id_1');
      } catch (dropError) {
        console.log('Could not drop index (might not exist):', dropError.message);
      }
    }

    // Ensure correct index exists
    try {
      await AssistantSuggestions.collection.createIndex({ designation: 1 }, { unique: true });
      console.log('Ensured designation index exists');
    } catch (indexError) {
      console.log('Designation index already exists or error:', indexError.message);
    }

    console.log('Cleanup completed successfully');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error during cleanup:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

cleanupAssistantSuggestions();
