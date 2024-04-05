import mongoose, { Schema } from 'mongoose';
import MeetingType from '../models/meetingTypeModel.js';

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
			enum: ['gemini', 'openai', 'claude'],
		},

		tags: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'meetingType',
			},
		],
	},
	{
		timestamps: true,
	}
);

const promptModel = mongoose.model('prompt', promptSchema);

export default promptModel;
