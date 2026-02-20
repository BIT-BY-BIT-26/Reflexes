const { default: mongoose } = require("mongoose");

const reportSchema = mongoose.Schema({
    patient:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Patient",
        required:true,
    },
    title:{
        type:String,
        required:true
    },
    type:{
        type:String,
        enum:["LAB","XRAY","MRI","OTHER"],
        required:true
    },
    filePublicId:{
        type:String,
        required:true
    },
    fileType: {
        type: String,
        enum: ["image", "pdf"],
        required: true
    },

    uploadedBy:{
        type:String,
        enum:["Doctor","Patient"],
        default:"Patient"
    },
    sharedWithDoctors:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Doctor"
        }
    ],
    doctorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Doctor"
    },
    isPrivate:{
        type:Boolean,
        default:true
    }
},{timestamps:true});


module.exports = mongoose.model("Reports",reportSchema);