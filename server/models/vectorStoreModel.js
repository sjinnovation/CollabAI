import mongoose from "mongoose";

const vectorStoreSchema = mongoose.Schema(
    {
        storeId: {
            type: String,
            required: true
        },
        storeName: {
            type: String,
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        isPublic: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

const VectorStores = mongoose.model("VectorStores", vectorStoreSchema);

export default VectorStores;
