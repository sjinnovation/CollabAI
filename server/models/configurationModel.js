import  mongoose, { Schema }  from 'mongoose'

const configSchema = mongoose.Schema({
    key:{
        id:Schema.ObjectId,
        type:String,
        required:true
    },
    value:{
       type:String,
       required:true
    }
 },{
   timestamps:true 
 }
)

const config = mongoose.model('config',configSchema);

export default config;