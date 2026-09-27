import mongoose,{Schema} from "mongoose";

const SubmissionSchema=new Schema({
    form:{type:Schema.Types.ObjectId,ref:"Form",required:true},
    values:{type:Schema.Types.Mixed,required:true}, // values = { field_id_1: "...", field_id_2: ["option_a", "option_c"] }
    
    // Meta for spam detection / analytics
    ip:{type:String,default:null},
    userAgent:{type:String,default:null},

    status:{
        type:String,
        enum: ["new", "read", "archived"],
        default:"new"
    },
},{timestamps:true});

SubmissionSchema.index({form:1,createdAt:-1});
SubmissionSchema.index({form:1,status:1});

export const Submission=mongoose.model('Submission',SubmissionSchema);