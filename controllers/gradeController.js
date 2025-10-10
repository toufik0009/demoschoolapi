const Grade = require("../models/Grade");

// Create Grade
exports.createGrade = async (req, res) => {
  try {
    const { schoolId, grade, from, upto, status } = req.body;

    if (!schoolId || !grade || from == null || upto == null || !status) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newGrade = await Grade.create({
      schoolId,
      grade,
      from,
      upto,
      status,
      createdBy: req.user?.userId || null,
    });

    res.status(201).json({ success: true, message: "Grade created", grade: newGrade });
  } catch (err) {
    console.error("Error creating grade:", err.message);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// Get All Grades for a school
exports.getGradesBySchool = async (req, res) => {
  try {
    const { schoolId } = req.query;
    if (!schoolId) return res.status(400).json({ message: "schoolId is required" });

    const grades = await Grade.find({ schoolId }).sort({ from: -1 });
    res.status(200).json({ success: true, grades });
  } catch (err) {
    console.error("Error fetching grades:", err.message);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// Update Grade
exports.updateGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedGrade = await Grade.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!updatedGrade) return res.status(404).json({ message: "Grade not found" });

    res.status(200).json({ success: true, message: "Grade updated", grade: updatedGrade });
  } catch (err) {
    console.error("Error updating grade:", err.message);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// Delete Grade
exports.deleteGrade = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedGrade = await Grade.findByIdAndDelete(id);
    if (!deletedGrade) return res.status(404).json({ message: "Grade not found" });

    res.status(200).json({ success: true, message: "Grade deleted" });
  } catch (err) {
    console.error("Error deleting grade:", err.message);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
