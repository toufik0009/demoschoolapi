const Class = require("../models/Classes");

// ============================
// CREATE CLASS
// ============================
exports.createClass = async (req, res) => {
  try {
    const schoolId = req.schoolId;   // ✅ FIX
    const { className, sections, subjects, teachers } = req.body;

    let existingClass = await Class.findOne({
      schoolId,
      className,
      sections,
    });

    if (existingClass) {
      let updated = false;

      // Add new subjects if not existing
      for (let subj of subjects) {
        const subjectExists = existingClass.subjects.some(
          (s) => s.subjectName === subj.subjectName
        );

        if (!subjectExists) {
          existingClass.subjects.push(subj);
          updated = true;
        }
      }

      // Add teachers if new
      if (teachers && teachers.length > 0) {
        teachers.forEach((t) => {
          if (!existingClass.teachers.includes(t)) {
            existingClass.teachers.push(t);
            updated = true;
          }
        });
      }

      if (!updated) {
        return res.status(400).json({
          success: false,
          message: "No new subject/teacher to add",
        });
      }

      existingClass.updatedBy = req.user.userId || req.user.id;
      await existingClass.save();

      return res.status(200).json({
        success: true,
        message: "Class updated successfully",
        class: existingClass,
      });
    }

    // New Class
    const newClass = new Class({
      className,
      sections,
      subjects,
      teachers,
      createdBy: req.user.userId || req.user.id,
      schoolId,
    });

    await newClass.save();

    res.status(201).json({
      success: true,
      message: "Class created successfully",
      class: newClass,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating class",
      error: error.message,
    });
  }
};

// ============================
// GET ALL CLASSES
// ============================
exports.getAllClasses = async (req, res) => {
  try {
    const schoolId = req.schoolId;   // ✅ FIX

    const classes = await Class.find({ schoolId });

    res.status(200).json({ success: true, classes });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching classes",
      error: error.message,
    });
  }
};

// ============================
// GET CLASS BY ID
// ============================
exports.getClassById = async (req, res) => {
  try {
    const schoolId = req.schoolId;   // ✅ FIX
    const { id } = req.params;

    const classData = await Class.findOne({ _id: id, schoolId });

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    res.status(200).json({ success: true, class: classData });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching class",
      error: error.message,
    });
  }
};

// ============================
// UPDATE CLASS
// ============================
exports.updateClass = async (req, res) => {
  try {
    const schoolId = req.schoolId;   // ✅ FIX
    const { id } = req.params;

    const updatedClass = await Class.findOneAndUpdate(
      { _id: id, schoolId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Class updated successfully",
      class: updatedClass,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating class",
      error: error.message,
    });
  }
};

// ============================
// DELETE CLASS
// ============================
exports.deleteClass = async (req, res) => {
  try {
    const schoolId = req.schoolId;   // ✅ FIX
    const { id } = req.params;

    const deletedClass = await Class.findOneAndDelete({ _id: id, schoolId });

    if (!deletedClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Class deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting class",
      error: error.message,
    });
  }
};
