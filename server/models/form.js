import mongoose, {Schema} from "mongoose";


const MessageSchema=new Schema({
    role:{type:String,enum:["user","assistant"],required:true},
    content:{type:String,required:true},
    timestamp:{type:Date,default:Date.now}
},{_id:false})

const FieldSchema=new Schema({
    id:{type:String, required:true},
    type:{
        type:String,
        required:true,
        emum: ["text", "email", "number", "textarea", "select", "radio", "checkbox", "date"],
    },
    label:{type:String,required:true},
    placeholder:{type:String, default:""},
    helperText:{type:String,default:""},
    required:{type:Boolean,default:false},
    options:{type:[String],default:[]}, // for select radio/checkbox
    validation:{
        min:{type:Number,default:null},
        max:{type:Number,default:null},
        pattern:{type:String,default:null}
    },
},{_id:false});

const FormSchema=new Schema({
    name:{type:String,required:true,default:"Untitled form"},
    description:{type:String,default:""},
    fields:{type:[FieldSchema],default:[]},
    owner:{type:Schema.Types.ObjectId,ref:"User",required:true},
    version:{type:Number,default:0},
    published:{type:Boolean,default:false},
    publishedAt:{type:Date,default:null},

    status:{
        type:String,
        enum: ["pending", "generating", "revising", "completed", "failed"],
        default:"pending",
    },
    fieldsPlanned:{type:[FieldSchema],default:[]}, // during planning
    error:{type:String,default:null},

    messages:{type:[MessageSchema],default:[]}
},{timestamps:true});

FormSchema.index({owner:1,updatedAt:-1});
FormSchema.index({published:1});

export const Form=mongoose.model('Form',FormSchema)