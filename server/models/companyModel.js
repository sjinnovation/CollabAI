import  mongoose, { Schema }  from 'mongoose'

const companySchema = mongoose.Schema({
    name:{
        id:Schema.ObjectId,
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
     },
    employeeCount:{
        type:Number,
        required:true
    }, 
    status:{
        type:String,
        enum: ["active", "inactive"],
        default: "inactive",
    },
    data:{
        type:String,
    },
    deletedEmail: {
        type: String,
    },
    is_deleted: {
        type: Boolean,
        default: false,
    }
 },{
   timestamps:true 
 }
)

const Company = mongoose.model('company',companySchema);

export default Company;