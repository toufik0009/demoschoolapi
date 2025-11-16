const Admin = require("../models/Admins");
const Teacher = require("../models/Teachers");
const Student = require("../models/Students");
const jwt = require('jsonwebtoken');

module.exports = async function extractSchoolId(req, res, next) {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        // console.log("extractSchoolId Token:", token);
        if (!token) return res.status(401).json({ message: "No token provided" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // console.log("decoded:", decoded);

        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized. Missing user data." });
        }

        // FIXED → take userId correctly
        const userId = decoded.userId;  
        const role = decoded.role;

        if (!userId || !role) {
            return res.status(401).json({ message: "Unauthorized. Missing user id or role." });
        }

        let schoolId;

        // -------- ADMIN --------
        if (role === "admin") {
            // FIXED → schoolIds is already inside token
            if (!decoded.schoolIds || decoded.schoolIds.length === 0) {
                return res.status(400).json({ message: "Admin has no assigned school" });
            }

            schoolId = decoded.schoolIds[0]; 
        }

        // -------- TEACHER --------
        else if (role === "teacher") {
            const teacher = await Teacher.findById(userId).select("schoolId");
            if (!teacher) return res.status(404).json({ message: "Teacher not found" });

            schoolId = teacher.schoolId;
        }

        // -------- STUDENT --------
        else if (role === "student") {
            const student = await Student.findById(userId).select("schoolId");
            if (!student) return res.status(404).json({ message: "Student not found" });

            schoolId = student.schoolId;
        }

        if (!schoolId) {
            return res.status(400).json({ message: "School ID not found for this user" });
        }

        req.schoolId = schoolId;

        next();

    } catch (error) {
        console.error("extractSchoolId Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
