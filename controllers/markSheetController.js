const MarkSheet = require("../models/MarkSheet");
const Teacher = require("../models/Teachers");

exports.createOrUpdateMarkSheet = async (req, res) => {
  try {
    const teacherId = req.user?._id;
    if (!teacherId) return res.status(401).json({ message: "Unauthorized" });

    const { studentId, classId, examType, sessionYear, subjects } = req.body;

    // 1. Get teacher
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return res.status(403).json({ message: "Teacher not found" });

    // 2. Check if mark sheet already exists for this student, class, exam & session
    let markSheet = await MarkSheet.findOne({
      studentId,
      classId,
      examType,
      sessionYear,
    });

    if (markSheet) {
      // ------------------ UPDATE ------------------
      // Update subjects if provided
      subjects.forEach(sub => {
        const existingSubject = markSheet.subjects.find(s => s.subjectName === sub.subjectName);
        if (existingSubject) {
          existingSubject.obtainedMarks = sub.obtainedMarks;
          existingSubject.grade = sub.grade || existingSubject.grade;
          existingSubject.remarks = sub.remarks || existingSubject.remarks;
        } else {
          markSheet.subjects.push(sub); // add new subject if not exist
        }
      });

      // Recalculate totals
      markSheet.obtainedMarks = markSheet.subjects.reduce((sum, s) => sum + s.obtainedMarks, 0);
      markSheet.totalMarks = markSheet.subjects.reduce((sum, s) => sum + s.maxMarks, 0);
      markSheet.percentage = (markSheet.obtainedMarks / markSheet.totalMarks) * 100;
      markSheet.resultStatus = markSheet.percentage >= 33 ? "Pass" : "Fail";

      markSheet.updatedBy = teacherId;

      await markSheet.save();

      return res.status(200).json({ message: "Marksheet updated successfully", markSheet });
    } else {
      // ------------------ CREATE ------------------
      // Calculate totals
      let totalMarks = 0;
      let obtainedMarks = 0;
      subjects.forEach(sub => {
        totalMarks += sub.maxMarks;
        obtainedMarks += sub.obtainedMarks;
      });

      const percentage = ((obtainedMarks / totalMarks) * 100).toFixed(2);

      // Grade logic
      let grade = "F";
      if (percentage >= 90) grade = "A+";
      else if (percentage >= 75) grade = "A";
      else if (percentage >= 60) grade = "B";
      else if (percentage >= 45) grade = "C";
      else if (percentage >= 33) grade = "D";

      const resultStatus = percentage >= 33 ? "Pass" : "Fail";

      markSheet = new MarkSheet({
        studentId,
        classId,
        examType,
        sessionYear,
        subjects,
        totalMarks,
        obtainedMarks,
        percentage,
        grade,
        resultStatus,
        createdBy: teacherId,
        createdByModel: req.user.role === "admin" ? "Admin" : "Teacher", 
      });

      await markSheet.save();

      return res.status(201).json({ message: "Marksheet created successfully", markSheet });
    }
  } catch (error) {
    console.error("Create/Update MarkSheet Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get all MarkSheets (with optional filters)
exports.getAllMarkSheets = async (req, res) => {
  try {
    const { classId, studentId, examType, sessionYear } = req.query;

    // Build filter object dynamically
    const filter = {};
    if (classId) filter.classId = classId;
    if (studentId) filter.studentId = studentId;
    if (examType) filter.examType = examType;
    if (sessionYear) filter.sessionYear = sessionYear;

    const markSheets = await MarkSheet.find(filter)
      .populate("studentId", "name rollNumber") // get student details
      .populate("classId", "name")              // get class details
      .populate("createdBy", "name email")      // teacher who created
      .populate("updatedBy", "name email");     // teacher who last updated

    res.status(200).json({
      message: "MarkSheets fetched successfully",
      count: markSheets.length,
      markSheets,
    });
  } catch (error) {
    console.error("GetAllMarkSheets Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get single MarkSheet by ID
exports.getMarkSheetById = async (req, res) => {
  try {
    const { id } = req.params;

    const markSheet = await MarkSheet.findById(id)
      .populate("studentId", "name rollNumber")
      .populate("classId", "name")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!markSheet) {
      return res.status(404).json({ message: "MarkSheet not found" });
    }

    res.status(200).json({ message: "MarkSheet fetched successfully", markSheet });
  } catch (error) {
    console.error("GetMarkSheetById Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
