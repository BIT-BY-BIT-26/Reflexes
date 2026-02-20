const departmentModel = require("../models/departmentModel");
const Department = require("../models/departmentModel");
const HospitalModel = require("../models/HospitalModel");


exports.createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;
    const hospital = req.user.hospitalId; // admin ke token se

    if (!name) {
      return res.status(400).json({ success:false,message: "Department name required" });
    }

    const existing = await departmentModel.findOne({
      hospital: hospital,
      name,
    }).populate("hospital","name");

    if (existing) {
      return res.status(409).json({ success:false,message: "Department already exists" });
    }

    const department = await departmentModel.create({
      hospital: hospital,
      name,
      description,
    });

    res.status(201).json({
      success:true,
      message: "Department created successfully",
      department,
    });
  } catch (err) {
    res.status(500).json({ success:false,message: err.message });
  }
};


exports.getAllDepartments = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;

    const hospital = await HospitalModel.findById(hospitalId).select("name");
    const departments = await Department.find({
      hospital: hospitalId,
    }).select("name description isActive createdAt").sort({ createdAt: -1 });

    res.json({success:true,hospital,departments});
  } catch (err) {
    res.status(500).json({ success:false,message: err.message });
  }
};


exports.getDepartmentsByHospital = async (req, res) => {
  try {
    const {hospitalId} = req.params;
    const hospital = await HospitalModel.findById(hospitalId).select("_id name");
    if(!hospital){
      return res.status(404).json({
        success:false,
        message:"Hospital not found",
      });
    }
    const departments = await Department.find({
      hospital: hospitalId,
      isActive: true, // user ko sirf active departments dikhega 
    })
      .select("name isActive createdAt")
      .sort({ name: 1 });

    res.json({
      success: true,
      hospital,
      departments,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


exports.getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.json(department);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    if (name) department.name = name;
    if (description) department.description = description;

    await department.save();

    res.json({
      message: "Department updated successfully",
      department,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.toggleDepartmentStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    department.isActive = !department.isActive;
    await department.save();

    res.json({
      message: `Department ${
        department.isActive ? "activated" : "deactivated"
      }`,
      isActive: department.isActive,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    await Department.findByIdAndDelete(id);

    res.json({ message: "Department deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};