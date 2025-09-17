const Student = require("../models/Students");
const Class = require("../models/Classes");
const jwt = require("jsonwebtoken");

// Student Login
exports.studentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("StudentLogin Request:", req.body);

    // 1. Check if student exists
    const student = await Student.findOne({ studentEmail: email });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // 2. Plaintext password check (DOB-based password from your model)
    if (password !== student.studentPassword) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // 3. Create JWT token
    const token = jwt.sign(
      {
        userId: student._id,
        role: student.role,
        email: student.studentEmail,
        name: student.studentName,
      },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "7d" }
    );

    // 4. Send response
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

// Create a new Student
exports.createStudent = async (req, res) => {
  try {
    const studentData = {
      ...req.body,
      createdBy: req.user.userId || req.user.id,
      schoolId: req.user.schoolId,
    };

    if (req.file) {
      studentData.studentImage = `/uploads/${req.file.filename}`;
    }

    const student = new Student(studentData);
    await student.save();

    if (student.studentClass && student.studentSection) {
      // Decide which field to update based on gender
      let updateField;
      if (student.studentGender === "Male") updateField = "totalBoys";
      else if (student.studentGender === "Female") updateField = "totalGirls";
      else updateField = "totalOthers";

      // Find class document by className + section + schoolId
      const classDoc = await Class.findOne({
        className: student.studentClass,
        sections: student.studentSection,
        schoolId: req.user.schoolId,
      });

      if (classDoc) {
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
      student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating student",
      error: error.message
    });
  }
};


// Get all Students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching students", error: error.message });
  }
};

// Get a single Student by ID
exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.status(200).json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching student", error: error.message });
  }
};

// Update a Student by ID
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedStudent = await Student.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!updatedStudent) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.status(200).json({ success: true, message: "Student updated successfully", updatedStudent });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating student", error: error.message });
  }
};

// Delete a Student by ID
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStudent = await Student.findByIdAndDelete(id);

    if (!deletedStudent) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.status(200).json({ success: true, message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting student", error: error.message });
  }
};
