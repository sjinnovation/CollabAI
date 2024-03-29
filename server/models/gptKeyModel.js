import  mongoose, { Schema }  from 'mongoose'

const keySchema = mongoose.Schema({ 
    companyid:{
        type: Schema.Types.ObjectId, 
        ref: 'company',
        required:true
    },
    chatgptapikey:{
        type:String,
        required:false
     },
 },{
   timestamps:true 
 }
)

const gptkeyModel = mongoose.model('customerKey',keySchema);

export default gptkeyModel;