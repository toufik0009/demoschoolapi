const Student = require("../models/Students");
const School = require("../models/School");
const Class = require("../models/Classes");
const jwt = require("jsonwebtoken");

// Student Login
exports.studentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ studentEmail: email });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    if (password !== student.studentPassword) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const school = await School.findById(student.schoolId);
    if (!school) {
      return res.status(404).json({ success: false, message: "Assigned school not found" });
    }

    if (school.status.toLowerCase() !== "paid") {
      return res.status(403).json({
        success: false,
        message: "Cannot login. Your school is Unpaid.",
      });
    }

    const token = jwt.sign(
      {
        userId: student._id,
        role: "student",
        email: student.studentEmail,
        name: student.studentName,
        schoolIds: [student.schoolId],   // Important!
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      student: {
        id: student._id,
        image: student.studentImage,
        name: student.studentName,
        email: student.studentEmail,
        role: student.role,
        schoolId: student.schoolId
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
};

// Create
exports.createStudent = async (req, res) => {
  try {
    const studentData = {
      ...req.body,
      createdBy: req.user.userId,
      schoolId: req.schoolId,
    };

    if (req.file) {
      studentData.studentImage = `/uploads/${req.file.filename}`;
    }

    const student = new Student(studentData);
    await student.save();

    // update class count
    if (student.studentClass && student.studentSection) {
      const classDoc = await Class.findOne({
        className: student.studentClass,
        sections: student.studentSection,
        schoolId: req.schoolId,
      });

      if (classDoc) {
        const updateField =
          student.studentGender === "Male"
            ? "totalBoys"
            : student.studentGender === "Female"
            ? "totalGirls"
            : "totalOthers";

        await Class.findByIdAndUpdate(
          classDoc._id,
          { $push: { [updateField]: student._id } },
          { new: true }
        );
      }
    }

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating student",
      error: error.message,
    });
  }
};
// Get All Students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({ schoolId: req.schoolId });

    res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get Student By ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findOne({
      _id: req.params.id,
      schoolId: req.schoolId,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found in this school",
      });
    }

    res.status(200).json({ success: true, student });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching student",
      error: error.message,
    });
  }
};

// Update Student with Class Sync
exports.updateStudent = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (updateData.markSheet) {
      try { updateData.markSheet = JSON.parse(updateData.markSheet); }
      catch { updateData.markSheet = []; }
    }

    if (req.file) {
      updateData.studentImage = `/uploads/${req.file.filename}`;
    }

    const oldStudent = await Student.findOne({
      _id: req.params.id,
      schoolId: req.schoolId,
    });

    if (!oldStudent) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // --- Update Student DB ---
    const student = await Student.findOneAndUpdate(
      { _id: req.params.id, schoolId: req.schoolId },
      updateData,
      { new: true, runValidators: true }
    );

    const oldClass = oldStudent.studentClass;
    const oldSection = oldStudent.studentSection;
    const oldGender = oldStudent.studentGender;

    const newClass = student.studentClass;
    const newSection = student.studentSection;
    const newGender = student.studentGender;

    const genderField = (g) =>
      g === "Male" ? "totalBoys" :
      g === "Female" ? "totalGirls" : "totalOthers";


    // ------------ CLASS UPDATE LOGIC ------------ //

    // 1️⃣ CLASS OR SECTION CHANGED → Remove + Add
    if (oldClass !== newClass || oldSection !== newSection) {

      // Remove from Old Class
      const oldClassDoc = await Class.findOne({
        className: oldClass,
        sections: oldSection,
        schoolId: req.schoolId,
      });

      if (oldClassDoc) {
        await Class.findByIdAndUpdate(
          oldClassDoc._id,
          { $pull: { [genderField(oldGender)]: student._id } }
        );
      }

      // Add to New Class
      const newClassDoc = await Class.findOne({
        className: newClass,
        sections: newSection,
        schoolId: req.schoolId,
      });

      if (newClassDoc) {
        await Class.findByIdAndUpdate(
          newClassDoc._id,
          { $addToSet: { [genderField(newGender)]: student._id } }
        );
      }
    }

    // 2️⃣ SAME class/section কিন্তু student থাকে না → শুধু add
    else {
      const classDoc = await Class.findOne({
        className: newClass,
        sections: newSection,
        schoolId: req.schoolId,
      });

      if (classDoc) {
        const field = genderField(newGender);

        // student এই array-এ নেই?
        if (!classDoc[field].includes(student._id)) {
          await Class.findByIdAndUpdate(
            classDoc._id,
            { $addToSet: { [field]: student._id } }
          );
        }
      }
    }

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      student,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating student",
      error: error.message,
    });
  }
};



// Delete Student
exports.deleteStudent = async (req, res) => {
  try {
    const deletedStudent = await Student.findOneAndDelete({
      _id: req.params.id,
      schoolId: req.schoolId,
    });

    if (!deletedStudent) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting student",
      error: error.message,
    });
  }
};

