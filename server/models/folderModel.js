import mongoose from 'mongoose';

const colorOptions = {
    black: '#000000',
    red: '#F14D42',
    orange: '#E36E30',
    yellow: '#B98618',
    gold: '#DB9F1E',
    green: '#3DCB40',
    darkGreen: '#30A633',
    teal: '#27C0A6',
    cyan: '#16B7DB',
    blue: '#6490F0',
    lightBlue: '#0088FF',
    navy: '#1D53BF',
    purple: '#512AEB',
    violet: '#875BE1',
    pink: '#EE4D83',
    magenta: '#E659C2',
    white: '#FFFFFF',
};

const allowedColors = Object.keys(colorOptions);

const folderSchema = new mongoose.Schema(
    {
        folderName: {
            type: String,
            required: true
        },
        instruction: {
            type: String,
            required: false,
            default: "You are a helpful AI assistant. Please respond to my questions and analyze any documents I share to provide relevant insights and information."
        },
        model: {
            type: String,
            required: false,
            default: "gpt-4.1"
        },
        personaId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AiPersona',
            required: false,
        },
        folderColor: {
            type: String,
            required: true,
            enum: allowedColors
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        fileInfo: {
            type: Array,
            default: [],
        },
        threadFilesInfo: {
            type: Array,
            default: [],
        },
        webSearch :{
            type : Boolean,
            required: false,
            default : false
        },
        waitingFilesInfo: {
            type: Array,
            default: [],
        },
        selectedFileKeys: {
            type: Array,
            default: [],
        },
    },
    { timestamps: true }
);

const FolderChat = mongoose.model("FolderChat", folderSchema);
export default FolderChat;