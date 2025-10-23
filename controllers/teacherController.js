const Teacher = require("../models/Teachers");
const School = require("../models/School");
const Class = require("../models/Classes");
const jwt = require("jsonwebtoken");

exports.createTeacher = async (req, res) => {
  try {
    const {
      teacherName,
      teacherPhone,
      employRole,
      image,
      dateOfJoin,
      teacherClasses,
      teacherSections,
      teacherSubjects,
      monthlySalary,
      fatherHusbandName,
      gender,
      experience,
      adharNumber,
      religion,
      teacherEmail,
      education,
      bloodGroup,
      dateOfBirth,
      residentialAddress,
      role,
      city,
      state,
      zip,
    } = req.body;

    // ✅ map frontend fields -> schema fields
    const teacherData = {
      teacherName,
      teacherPhone,
      role: employRole || "teacher",
      teacherImage: image,
      teacherDOJ: dateOfJoin,

      teacherClasses: Array.isArray(teacherClasses)
        ? teacherClasses
        : teacherClasses ? JSON.parse(teacherClasses) : [],

      teacherSections: Array.isArray(teacherSections)
        ? teacherSections
        : teacherSections ? JSON.parse(teacherSections) : [],

      teacherSubjects: Array.isArray(teacherSubjects)
        ? teacherSubjects
        : teacherSubjects ? JSON.parse(teacherSubjects) : [],

      teacherSalary: monthlySalary,
      teacherParentName: fatherHusbandName,
      teacherGender: gender,
      teacherExperience: experience,
      teacherAadharNumber: adharNumber,
      teacherReligion: religion,
      teacherEmail,
      teacherEducation: education,
      teacherBloodGroup: bloodGroup,
      teacherDOB: dateOfBirth,
      teacherResidentialAddress: residentialAddress,
      teacherCity: city,
      teacherState: state,
      teacherZip: zip,
      role:role,
      schoolId: req.user?.schoolId,
      createdBy: req.user?.userId || req.user?.id,
    };


    if (req.file) {
      teacherData.teacherImage = `/uploads/${req.file.filename}`;
    }

    console.log("Mapped Teacher Data:", req.user);

    const teacher = await Teacher.create(teacherData);

    res.status(201).json({
      success: true,
      message: "School Staff created successfully",
      teacher,
    });

  } catch (error) {
    console.error("❌ Error creating teacher:", error.message);
    res.status(500).json({
      success: false,
      message: "Error creating teacher",
      error: error.message,
    });
  }
};

// Teacher Login
exports.loginTeacher = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Password", req.body);

    const teacher = await Teacher.findOne({ teacherEmail: email });
    if (!teacher) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Simple password check (replace with bcrypt if needed)
    if (password !== teacher.teacherPassword) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 🔹 Check school status
    const school = await School.findById(teacher.schoolId);
    if (!school) {
      return res.status(404).json({ message: "Assigned school not found" });
    }

    if (school.status.toLowerCase() !== "paid") {
      return res.status(403).json({
        message: "Cannot login. Your assigned school's payment status is Unpaid.",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: teacher._id, role: teacher.role, schoolId: teacher.schoolId },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      teacher: {
        id: teacher._id,
        image: teacher.teacherImage,
        name: teacher.teacherName,
        email: teacher.teacherEmail,
        phone: teacher.teacherPhone,
        role: teacher.role,
        classes: teacher.teacherClasses,
        sections: teacher.teacherSections,
        subjects: teacher.teacherSubjects,
        schoolId: teacher.schoolId
      },
    });
  } catch (error) {
    console.error("Error logging in teacher:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};


// Get all Teachers
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.status(200).json({ success: true, teachers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching teachers", error: error.message });
  }
};

// Get a single Teacher by ID
exports.getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching teacher with ID:", id);
    const teacher = await Teacher.findById(id);

    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    res.status(200).json({ success: true, teacher });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching teacher", error: error.message });
  }
};

// Controller - Update Teacher
exports.updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    let updateData = { ...req.body };
    console.log("Data",updateData)

    // If a new image file is uploaded, save its path
    // if (req.file) {
    //   updateData.teacherImage = req.file.path;
    // }
    if (req.file) {
      updateData.teacherImage = `/uploads/${req.file.filename}`;
    }

    // Optional: prevent undefined/null fields from overwriting existing data
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined || updateData[key] === null) {
        delete updateData[key];
      }
    });

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedTeacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    res.status(200).json({
      success: true,
      message: "Teacher updated successfully",
      updatedTeacher
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating teacher",
      error: error.message
    });
  }
};

// Delete a Teacher by ID
exports.deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTeacher = await Teacher.findByIdAndDelete(id);

    if (!deletedTeacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    res.status(200).json({ success: true, message: "Teacher deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting teacher", error: error.message });
  }
};
