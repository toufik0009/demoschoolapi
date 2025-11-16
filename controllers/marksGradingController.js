const MarksGrading = require('../models/MarksGrading');

// ✅ Create or Update Grades for a Class
exports.createOrUpdateGrades = async (req, res) => {
    try {
        const schoolId = req.admin?.schoolIds?.[0]; // FIXED

        if (!schoolId) {
            return res.status(400).json({ message: "School ID is required" });
        }

        const { className, grades } = req.body;
        const classKey = className || "All";

        if (!grades || !Array.isArray(grades) || grades.length === 0) {
            return res.status(400).json({ message: "Grades array is required" });
        }

        // Check if this class already has grades for this school
        let grading = await MarksGrading.findOne({
            schoolId,
            className: classKey
        });

        if (grading) {
            grading.grades = grades;
            await grading.save();
        } else {
            grading = new MarksGrading({
                schoolId,
                className: classKey,
                grades,
                createdBy: req.admin?.id || req.admin?.userId
            });
            await grading.save();
        }

        res.status(200).json({ message: "Grades saved successfully", grading });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};


// ✅ Get All Grades
exports.getAllGrades = async (req, res) => {
    try {
        const schoolId = req.admin.schoolIds[0]; 
        const allGrades = await MarksGrading.find({schoolId});
        res.status(200).json(allGrades);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// ✅ Get Grades by Class
exports.getGradesByClass = async (req, res) => {
    try {
        const { className } = req.params;
        const classKey = className || "All";
        const grading = await MarksGrading.findOne({ className: classKey });
        if (!grading)
            return res.status(404).json({ message: "No grading found for this class" });

        res.status(200).json(grading);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// ✅ Delete Grades for a Class
exports.deleteGradesByClass = async (req, res) => {
    try {
        const { className } = req.params;
        await MarksGrading.findOneAndDelete({ className });
        res.status(200).json({ message: "Grades deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};