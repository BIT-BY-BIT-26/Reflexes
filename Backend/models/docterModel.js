const { mongoose } = require("mongoose");

const doctorSchema = new mongoose.Schema({

  userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true,
    unique:true,
  },

  position:{
    type: String,
    required:true,
    trim: true
  },

  profile_photo:{
    type:String,
  },

  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true
  },

  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true
  },

  opd_timing:{
    from: {type:String},
    to:{type:String}
  },

  experience:{
    type: Number,
    min: 0
  },

  specialisation:{
    type: String,
  },

  profileCompleted:{
    type:Boolean,
    default:false
  },

  availableDays:{
    type:[String],
    enum:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
  },

  onlineAvailabitity:{
    from:{type:String},
    to:{type:String}
  },

  registrationNumber:{
    type:String
  },

  // ⭐ NEW FIELDS

  isOnline:{
    type:Boolean,
    default:false
  },

  opdStarted:{
    type:Boolean,
    default:false
  },

  opdPaused: {
    type: Boolean,
    default: false
  },

  opdStartedAt: {
    type: Date,
    default: null
  },

  lastSeen:{
    type:Date
  },

  isActive:{
    type:Boolean,
    default:true
  }

},{timestamps:true});

doctorSchema.index({ hospital: 1, department: 1 });

module.exports = mongoose.model('Doctor',doctorSchema);