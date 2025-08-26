import mongoose from "mongoose";

const ServiceListSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },
        service_name: {
            type: String,
            required: true,
        },
        service_icon: {
            type: String,
            required: false
        },
        slug: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: false,
        },
        is_active: {
            type: Boolean,
            required: false,
            default: false,
        },
        is_google_app : {
            type : Boolean,
            required : false,
            default : false
        },
        // Authentication-related fields
        authType: {
            type: String, // 'Basic', 'OAuth', 'Bearer', etc.
            required: true,
        },
        oauthurl : {
            type: String,
            required: false,
        },
        tokenurl : {
            type: String,
            required: false,
        },
        baseurl : {
            type : String,
            required : false
        },
        type : {
            type : String,
            required : false
        },
        contentType : {
            type : String,
            required : false
        },
        authenticateFields : [
            {
                keyName : {
                    type : String,
                    required : false
                },
                keyValue : {
                    type : String,
                    required : false
                }
            }
        ],
        authFields: [
            {
                keyName: { // e.g., 'username', 'uname', 'email', etc.
                    type: String,
                    required: false,
                },
                keyValue: {
                    type:String,
                    required: false,
                }
            },
        ],
        
        headers: [
            {
                headerKey: { // e.g., 'Content-Type', 'Authorization'
                    type: String,
                    required: false,
                },
            },
        ],
    },
    { timestamps: true }
);

const ServiceList = mongoose.model("service_list", ServiceListSchema);

export default ServiceList;