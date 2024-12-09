import mongoose from 'mongoose';

const ClientSchema = new mongoose.Schema({
    name:{type:String, required:true},
    description:{type:String},
    contact_info:{type:String},
    point_of_contact:{type:String},
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    image : { type: String}
});

const Client= mongoose.model('Client',ClientSchema);
export default Client;