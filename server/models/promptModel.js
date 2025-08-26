import mongoose, { Schema } from 'mongoose';

const promptSchema = mongoose.Schema(
	{
		tokenused: {
			type: Number,
		},
		threadid: {
			type: String,
			required: true,
		},
		userid: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
		description: {
			type: String,
			required: false,
		},
		promptresponse: {
			type: String,
			required: false,
		},
		promptdate: {
			type: Date,
			required: false,
		},
		prompttitle: {
			type: String,
			required: false,
		},
		isDeleted: {
			type: Boolean,
			require: false,
			default: false,
		},
		modelused: {
			type: String,
			required: false,
		},
		botProvider: {
			type: String,
			enum: ['openai', 'gemini', 'claude', 'deepseek', 'huggingface'],
		},
		isResponseThread : {
			type: Boolean,
			require: false,
			default: false,
		},
		folderId :{
			type: String,
			required: false,
			default : null
		},
		msgId: {
			type: String,
			required: false,
			default : null
		}
	},
	{
		timestamps: true,
	}
);

promptSchema.index({ threadid: 1, userid: 1 });

const promptModel = mongoose.model('prompt', promptSchema);

export default promptModel;
