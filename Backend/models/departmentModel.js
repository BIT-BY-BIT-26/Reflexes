const mongoose= require('mongoose');

const departmentSchema = new mongoose.Schema( 
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        hospital: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        },

        description: {
            type: String
        },
    },

    { timestamps: true }
);

module.exports=mongoose.model("Department",departmentSchema);