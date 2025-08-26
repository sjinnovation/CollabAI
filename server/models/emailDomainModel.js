import mongoose from "mongoose";

const EmailDomainSchema = mongoose.Schema({
    companyName: {
        type: String,
        required: true,
    },
    emailDomain: {
        type: String,
        required: true,
        unique: true,
    },
}, {
    timestamps: true,
});

const EmailDomain = mongoose.model("EmailDomain", EmailDomainSchema);
export default EmailDomain;
