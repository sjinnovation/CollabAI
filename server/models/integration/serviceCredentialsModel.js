import mongoose from "mongoose";

const ServiceCredentialsSchema = mongoose.Schema(
    {
        service_id: {
            type: mongoose.Schema.Types.ObjectId, // Reference to ServiceList's _id
            ref: "service_list",
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },
        credentials: {
            type: Map,
            of: mongoose.Schema.Types.Mixed, // Allows nested objects
            required: true,
        },
        is_active: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

const ServiceCredentials = mongoose.model("service_credentials", ServiceCredentialsSchema);

export default ServiceCredentials;