import mongoose, { Schema } from 'mongoose';

const promptSchemaVSCode = mongoose.Schema(
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
		firstMessage: {
			type: Boolean,
			required: false,
			default : false
		}
	},
	{
		timestamps: true,
	}
);

promptSchemaVSCode.index({ threadid: 1, userid: 1 });

const promptVSCodeModel = mongoose.model('promptVSCode', promptSchemaVSCode);

export default promptVSCodeModel;