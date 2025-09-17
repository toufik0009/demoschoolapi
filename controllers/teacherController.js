const Teacher = require("../models/Teachers");
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
      message: "Teacher created successfully",
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

    // ✅ Simple string comparison instead of bcrypt
    if (password !== teacher.teacherPassword) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: teacher._id, role: teacher.role },
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
        subjects: teacher.teacherSubjects
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

// Update a Teacher by ID
exports.updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTeacher = await Teacher.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!updatedTeacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    res.status(200).json({ success: true, message: "Teacher updated successfully", updatedTeacher });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating teacher", error: error.message });
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
