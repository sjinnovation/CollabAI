import mongoose,{Schema} from 'mongoose';

const vsPlugginTrackUsageSchema =mongoose.Schema({
    user_id:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    total_tokens: {
        type: Number,
        required: true
    },
    openAi_count: {
        type: Number,
        required: false
    },
    claude_count: {
        type: Number,
        required: false
    },
    // deepseek_count: {
    //     type: Number,
    //     required: false
    // },
    total_prompt_count: {
        type: Number,
        required: true
    },
},
{ timestamps: true }
);

const VsPluginTrackUsage = mongoose.model('VsPluginTrackUsage', vsPlugginTrackUsageSchema);

export default VsPluginTrackUsage;