import  mongoose, { Schema }  from 'mongoose'

const userSchema = mongoose.Schema({
    userid:{
        id:Schema.ObjectId,
        type:String,
        required:true
    },
    count:{
       type:Number,
       required:true
    },
    promptdate:{
        type:Date,
        required:true
     },
 },{
   timestamps:true 
 }
)

const Uprompt = mongoose.model('userPrompt',userSchema);

export default Uprompt;