// controllers/schoolController.js
const mongoose = require("mongoose");
const School = require("../models/School");

exports.createSchool = async (req, res) => {
  try {
    const {
      schoolName,
      schoolAddress,
      schoolPhone,
      schoolEmail,
      schoolBankAcc,
      schoolWebsite,
      schoolEstablishedYear,
      schoolType,
      schoolFees,
      schoolRulesRegulations,
    } = req.body;

    const schoolLogo = req.file ? `/uploads/${req.file.filename}` : null;

    const newSchool = new School({
      schoolName,
      schoolAddress,
      schoolPhone,
      schoolEmail,
      schoolBankAcc,
      schoolWebsite,
      schoolEstablishedYear,
      schoolType,
      schoolFees,
      schoolRulesRegulations,
      schoolLogo,
      createdBy: req.user.id,
    });

    await newSchool.save();

    res.status(201).json({ message: "School created successfully", school: newSchool });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get All Schools
exports.getAllSchools = async (req, res) => {
  try {
    const schools = await School.find();
    res.status(200).json({ schools });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get School by ID
exports.getSchoolById = async (req, res) => {
    try {
      const schoolId = req.params.id;
      const school = await School.findById(schoolId);
  
      if (!school) {
        return res.status(404).json({ message: 'School not found' });
      }
  
      res.status(200).json({ school });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // Delete School by ID
exports.deleteSchool = async (req, res) => {
    try {
      const schoolId = req.params.id;
  
      const school = await School.findByIdAndDelete(schoolId);
  
      if (!school) {
        return res.status(404).json({ success: false, message: 'School not found.' });
      }
  
      res.status(200).json({ success: true, message: 'School deleted successfully.' });
    } catch (error) {
      console.error('Error deleting school:', error.message);
      res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
  };

  exports.updateSchool = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body; 
  
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid School ID' });
      }

      const updatedSchool = await School.findByIdAndUpdate(id, updateData, {
        new: true, 
        runValidators: true, 
      });
  
      if (!updatedSchool) {
        return res.status(404).json({ error: 'School not found' });
      }
  
      res.json(updatedSchool); 
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  };