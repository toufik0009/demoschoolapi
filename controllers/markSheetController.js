const MarkSheet = require("../models/MarkSheet");
const Student = require("../models/Students");
const Teacher = require("../models/Teachers");
const Admin = require("../models/Admins");

// ---------------------- Helper: Check Teacher Access --------------------------
const checkTeacherAccess = (teacher, classId, section, subjectName) => {
  if (!teacher || !Array.isArray(teacher.assignedSubjects)) return false;
  return teacher.assignedSubjects.some(
    (sub) =>
      sub.classId === classId &&
      sub.section === section &&
      Array.isArray(sub.subjects) &&
      sub.subjects.includes(subjectName)
  );
};

// ---------------------- Helper: ensure no duplicate subjects inside request ----
const hasDuplicateSubjectsInRequest = (subjects) => {
  const seen = new Set();
  for (let s of subjects) {
    if (seen.has(s.subjectName)) return true;
    seen.add(s.subjectName);
  }
  return false;
};

// ============================================================================
// CREATE MARKSHEET (Teacher or Admin)
// - Prevent creating if same studentId + examType + sessionYear + subjectName
//   already exists WITH THE SAME examDate
// - If existing record has different examDate, allow creation (separate record)
// ============================================================================

exports.createOrUpdateMarkSheet = async (req, res) => {
  try {
    const {
      examType,
      classId,
      section,
      sessionYear,
      studentId,
      subjects,
      examDate
    } = req.body;

    const schoolId = req.schoolId;

    if (!studentId || !examType || !examDate || !sessionYear || !subjects?.length) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const normalizeDate = (d) => new Date(d).toISOString().slice(0, 10);
    const dateKey = normalizeDate(examDate);

    // FIND existing markSheet
    let markSheet = await MarkSheet.findOne({
      schoolId,
      studentId,
      classId,
      section,
      examType,
      sessionYear,
      examDate: dateKey
    });

    // ================================================================
    // CASE–1: No document found → Create new
    // ================================================================
    if (!markSheet) {

      // ✅ Add required fields calculation
      const totalMarks = subjects.reduce((sum, s) => sum + Number(s.maxMarks), 0);
      const obtainedMarks = subjects.reduce((sum, s) => sum + Number(s.obtainedMarks), 0);
      const percentage = Number(((obtainedMarks / totalMarks) * 100).toFixed(2));
      const resultStatus = percentage >= 33 ? "Pass" : "Fail";

      markSheet = await MarkSheet.create({
        schoolId,
        studentId,
        classId,
        section,
        examType,
        sessionYear,
        examDate: dateKey,
        subjects: subjects,

        // ✅ Required fields added
        totalMarks,
        obtainedMarks,
        percentage,
        resultStatus,

        createdBy: req.userId,
        createdByModel: req.role === "teacher" ? "Teacher" : "Admin"
      });

      return res.status(201).json({
        message: "New MarkSheet created & subject marks added",
        data: markSheet
      });
    }

    // ================================================================
    // CASE–2: Existing found → NOW WE BLOCK SAME SUBJECT UPDATE
    // ================================================================
    for (const sub of subjects) {
      const exists = markSheet.subjects.some(
        (s) => s.subjectName === sub.subjectName
      );

      if (exists) {
        return res.status(400).json({
          message: `Marks already given for subject "${sub.subjectName}" on this exam.`
        });
      }
    }

    // ➕ Push only NEW subjects
    markSheet.subjects.push(...subjects);

    // ------------------------------------------------
    // ✅ Recalculate totals after adding new subject(s)
    // ------------------------------------------------
    const totalMarks = markSheet.subjects.reduce((sum, s) => sum + Number(s.maxMarks), 0);
    const obtainedMarks = markSheet.subjects.reduce((sum, s) => sum + Number(s.obtainedMarks), 0);
    const percentage = Number(((obtainedMarks / totalMarks) * 100).toFixed(2));
    const resultStatus = percentage >= 33 ? "Pass" : "Fail";

    // Assign updated values
    markSheet.totalMarks = totalMarks;
    markSheet.obtainedMarks = obtainedMarks;
    markSheet.percentage = percentage;
    markSheet.resultStatus = resultStatus;

    markSheet.updatedBy = req.userId;
    markSheet.updatedByModel = req.role === "teacher" ? "Teacher" : "Admin";

    await markSheet.save();

    return res.status(200).json({
      message: "New subject marks added successfully",
      data: markSheet
    });

  } catch (error) {
    console.error("MarkSheet Save Error: ", error);
    return res.status(500).json({ message: "Server error" });
  }
};




// ============================================================================
// UPDATE MARKSHEET (Teacher or Admin)
// - When updating, still enforce teacher access per-subject
// - If subjects changed/added, ensure no conflict with other existing marksheets
//   that have the same examDate (except self)
// ============================================================================

exports.updateMarkSheet = async (req, res) => {
  try {
    const markSheetId = req.params.markSheetId;
    if (!markSheetId) return res.status(400).json({ message: "markSheetId required" });

    const existing = await MarkSheet.findById(markSheetId);
    if (!existing) return res.status(404).json({ message: "MarkSheet not found" });

    const {
      examType,
      classId,
      section,
      sessionYear,
      studentId,
      subjects,
      totalMarks,
      obtainedMarks,
      percentage,
      grade,
      resultStatus,
      examDate,
    } = req.body;

    // basic validation
    if (subjects && hasDuplicateSubjectsInRequest(subjects)) {
      return res.status(400).json({ message: "Duplicate subject names in request." });
    }

    // ------------------ Teacher Access Check ---------------------
    if (req.role === "teacher") {
      const teacher = await Teacher.findById(req.userId);
      if (!teacher) return res.status(403).json({ message: "Teacher not found." });

      const subsToCheck = subjects || existing.subjects;
      for (let sub of subsToCheck) {
        if (!checkTeacherAccess(teacher, classId || existing.classId, section || existing.section, sub.subjectName)) {
          return res.status(403).json({
            message: `You don't have access to ${sub.subjectName} for Class ${classId || existing.classId}-${section || existing.section}`,
          });
        }
      }
    }

    // ------------------ Prevent conflicts with other marksheets ---------------------
    const normalizeDateKey = (d) => {
      if (!d) return null;
      const dt = new Date(d);
      if (isNaN(dt)) return null;
      return dt.toISOString().slice(0, 10);
    };

    const incomingDateKey = normalizeDateKey(examDate ?? existing.examDate);
    const newSubjectNames = (subjects || existing.subjects).map((s) => s.subjectName);

    // find other marksheets for the same student/examType/sessionYear that have overlapping subjects
    const otherConflicts = await MarkSheet.find({
      _id: { $ne: existing._id },
      schoolId: existing.schoolId,
      studentId: studentId || existing.studentId,
      examType: examType || existing.examType,
      sessionYear: sessionYear || existing.sessionYear,
      "subjects.subjectName": { $in: newSubjectNames },
    }).select("examDate subjects");

    for (let oc of otherConflicts) {
      const otherDateKey = normalizeDateKey(oc.examDate);
      if (incomingDateKey === otherDateKey) {
        const otherSubjectNames = oc.subjects.map((s) => s.subjectName);
        const overlap = newSubjectNames.filter((n) => otherSubjectNames.includes(n));
        if (overlap.length > 0) {
          return res.status(400).json({
            message: `Cannot update: subjects [${overlap.join(", ")}] would duplicate existing marks for the same date in another record. Use a different examDate or update that existing record instead.`,
          });
        }
      }
    }

    // ------------------ Perform update ---------------------
    existing.examType = examType ?? existing.examType;
    existing.classId = classId ?? existing.classId;
    existing.section = section ?? existing.section;
    existing.sessionYear = sessionYear ?? existing.sessionYear;
    existing.studentId = studentId ?? existing.studentId;
    existing.subjects = subjects ?? existing.subjects;
    existing.totalMarks = totalMarks ?? existing.totalMarks;
    existing.obtainedMarks = obtainedMarks ?? existing.obtainedMarks;
    existing.percentage = percentage ?? existing.percentage;
    existing.grade = grade ?? existing.grade;
    existing.resultStatus = resultStatus ?? existing.resultStatus;
    existing.examDate = examDate ?? existing.examDate;
    existing.updatedBy = req.userId;
    existing.updatedByModel = req.role === "teacher" ? "Teacher" : "Admin";

    await existing.save();

    return res.status(200).json({
      message: "MarkSheet Updated Successfully",
      data: existing,
    });
  } catch (error) {
    console.error("Update MarkSheet Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ============================================================================
// GET ALL MARKSHEETS (Teacher & Admin)  (unchanged logic, small improvements)
// ============================================================================

exports.getAllMarkSheets = async (req, res) => {
  try {
    const schoolId = req.schoolId;

    let filter = { schoolId };

    // Teacher should see only their assigned class & subjects
    if (req.role === "teacher") {
      const teacher = await Teacher.findById(req.userId);

      // Build dynamic OR conditions for teacher access
      const orCondition = [];

      teacher.assignedSubjects.forEach((sub) => {
        (sub.subjects || []).forEach((subject) => {
          orCondition.push({
            classId: sub.classId,
            "subjects.subjectName": subject,
          });
        });
      });

      if (orCondition.length > 0) filter.$or = orCondition;
      // if teacher has no assigned subjects, they will get empty list (no results)
    }

    const markSheets = await MarkSheet.find(filter)
      .populate("studentId", "name rollNo")
      .populate("createdBy", "name");

    // 🔢 Auto calculate totals & percentage for each markSheet
    const enrichedMarkSheets = markSheets.map(ms => {
      const totalMax = ms.subjects.reduce((sum, s) => sum + (s.maxMarks || 0), 0);
      const totalObtained = ms.subjects.reduce((sum, s) => sum + (s.obtainedMarks || 0), 0);

      const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

      return {
        ...ms.toObject(),
        totalMaxMarks: totalMax,
        totalObtainedMarks: totalObtained,
        percentage: Number(percentage.toFixed(2)),   // 2 decimal format
      };
    });

    return res.status(200).json({
      message: "All Marksheets",
      data: enrichedMarkSheets,
    });

  } catch (error) {
    console.error("GetAll MarkSheets Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ============================================================================
// GET MARKSHEET BY ID (WITH AUTO TOTAL & PERCENTAGE)
// ============================================================================

exports.getMarkSheetById = async (req, res) => {
  try {
    const id = req.params.id;

    const markSheet = await MarkSheet.findById(id)
      .populate("studentId")
      .populate("createdBy");

    if (!markSheet) {
      return res.status(404).json({ message: "MarkSheet not found" });
    }

    // ----------- SAME CALCULATION LIKE getAllMarkSheets ------------
    const totalMax = markSheet.subjects.reduce(
      (sum, s) => sum + (s.maxMarks || 0),
      0
    );

    const totalObtained = markSheet.subjects.reduce(
      (sum, s) => sum + (s.obtainedMarks || 0),
      0
    );

    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

    const enrichedData = {
      ...markSheet.toObject(),
      totalMaxMarks: totalMax,
      totalObtainedMarks: totalObtained,
      percentage: Number(percentage.toFixed(2)),
    };

    return res.status(200).json({ data: enrichedData });

  } catch (error) {
    console.error("GetById Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
