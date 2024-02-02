import  mongoose, { Schema }  from 'mongoose'

const imageSchema = mongoose.Schema({ 
    imageurl:{
        type:String,
        required:false
     },
 },{
   timestamps:true 
 }
)

const imageModel = mongoose.model('Image',imageSchema);

export default imageModel;