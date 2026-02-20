const patientModel = require("../model/patientModel");
const reportModel = require("../model/reportModel");


exports.uploadReport = async(req,res)=>{
    try{
        const {title, type} = req.body;
        const patient = await patientModel.findOne({userId:req.user.id});
        const mime = req.file.mimetype;

        let fileType =  mime.includes("pdf") ? "pdf" : "image";
        // if (mime.includes("pdf")) {
        //     fileType = "pdf";
        // }
        const report = await reportModel.create({
            patient:patient._id,
            title: title,
            type: type,
            filePublicId:req.file.filename,
            fileType
        });
        res.status(200).json({
            message:"Report uploaded successfully",
            report
        })
    } catch(error){
         console.log("UPLOAD ERROR =>", error);
        res.status(500).json({message:`Upload failed ${error}`});
    }
}


exports.shareReport = async(req,res)=>{
    const {doctorId} = req.body;
    const patientId = req.user.id;
    const patient =await patientModel.findOne({userId:patientId});
    const report = await reportModel.findOne({
        _id:req.params.reportId,
        patient:patient._id
    });
    if(!report){
        return res.status(404).json({message:"Report not found"});
    }
    report.sharedWithDoctors.addToSet(doctorId);
    report.isPrivate = false;
    await report.save();

    res.json({message:"Report shared successfully with doctor"});
}