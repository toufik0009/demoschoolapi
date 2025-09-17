const Class = require("../models/Classes");
const jwt = require("jsonwebtoken");

// Create a new Class
exports.createClass = async (req, res) => {
  try {
    const { className, sections, subjects, teachers } = req.body;

    // ✅ Find by className + sections
    let existingClass = await Class.findOne({
      schoolId: req.user.schoolId,
      className,
      sections,
    });

    if (existingClass) {
      let updated = false;

      // Add new subjects if not already present
      for (let subj of subjects) {
        const subjectExists = existingClass.subjects.some(
          (s) => s.subjectName === subj.subjectName
        );

        if (!subjectExists) {
          existingClass.subjects.push(subj);
          updated = true;
        }
      }

      // Add new teachers if not already present
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
    } else {
      // ✅ Create new class if className + sections combo doesn’t exist
      const newClass = new Class({
        className,
        sections,
        subjects,
        teachers,
        createdBy: req.user.userId || req.user.id,
        schoolId: req.user.schoolId,
      });

      await newClass.save();

      return res.status(201).json({
        success: true,
        message: "Class created successfully",
        class: newClass,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating class",
      error: error.message,
    });
  }
};

// Get all Classes
exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find();
    res.status(200).json({ success: true, classes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching classes", error: error.message });
  }
};

// Get a single Class by ID
exports.getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching class with ID:", id);
    const classData = await Class.findById(id);

    if (!classData) {
      return res.status(404).json({ success: false, message: "Class not found" });
    }

    res.status(200).json({ success: true, class: classData });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching class", error: error.message });
  }
};

// Update a Class by ID
exports.updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedClass = await Class.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!updatedClass) {
      return res.status(404).json({ success: false, message: "Class not found" });
    }

    res.status(200).json({ success: true, message: "Class updated successfully", class: updatedClass });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating class", error: error.message });
  }
};

// Delete a Class by ID
exports.deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedClass = await Class.findByIdAndDelete(id);

    if (!deletedClass) {
      return res.status(404).json({ success: false, message: "Class not found" });
    }

    res.status(200).json({ success: true, message: "Class deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting class", error: error.message });
  }
};
