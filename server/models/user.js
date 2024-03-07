import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config.js';

export const UserRole = {
	SUPER_ADMIN: 'superadmin',
	ADMIN: 'admin',
	USER: 'user',
};
const userSchema = new mongoose.Schema(
	{
		maxusertokens: {
			type: Number,
			default: 5000,
		},
		currentusertokens: {
			type: Number,
			default: 0,
		},
		fname: {
			type: String,
			required: [true, 'Please provide name'],
			maxlength: 50,
			minlength: 3,
		},
		lname: {
			type: String,
			required: [true, 'Please provide name'],
			maxlength: 50,
			minlength: 3,
		},
		username: {
			type: String,
			required: [true, 'Please provide name'],
			maxlength: 50,
			minlength: 3,
			unique: true,
		},
		password: {
			type: String,
			required: [true, 'please provide a password'],
			// maxlength: 50,
			minlength: 3,
		},
		email: {
			type: String,
			unique: true,
			required: [true, 'Please provide email'],
			validate: {
				validator: validator.isEmail,
				message: 'Please provide valid email',
			},
		},
		status: {
			type: String,
			enum: ['active', 'inactive'],
			default: 'inactive',
		},
		role: {
			type: String,
			enum: ['superadmin', 'admin', 'user'],
			default: 'user',
		},
		companyId: {
			type: String,
			required: [true, 'Please provide company'],
		},
		deletedEmail: {
			type: String,
		},
		teamId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Teams',
		},
		teams: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Teams'
			}
		]
	},
	{ timestamps: true }
);

userSchema.pre('save', async function () {
	if (!this.isModified('password')) return;
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	this.email = this.email.toLowerCase(); // convert email to lowercase
	this.username = this.username.toLowerCase(); // convert email to lowercase
});

userSchema.methods.comparePasword = async function (userPassword) {
	const isMatch = await bcrypt.compare(userPassword, this.password);
	return isMatch;
};

userSchema.methods.createJWT = function () {
	return jwt.sign(
		{
			userId: this._id,
			email: this.email,
			role: this.role,
			branch: this.branch,
		},
		config.JWT_SECRET,
		{
			// expiresIn: process.env.JWT_LIFETIME,
			expiresIn: '30d',
		}
	);
};

const User = mongoose.model('User', userSchema);
export default User;
