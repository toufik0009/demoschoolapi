const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const superAdminRoutes = require('./routes/superAdminRoutes');
const schoolRoutes = require('./routes/schoolRoutes');
const adminRoutes = require("./routes/adminRoutes");
const studentRoutes = require("./routes/studentRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const classRoutes = require("./routes/classRoutes");
const markSheetRoutes = require("./routes/markSheetRoutes");
const studentPaymentRoutes = require("./routes/studentPaymentRoutes");
const leaveRouter = require('./routes/leaveRoutes')


dotenv.config();
const app = express();


app.use(express.json());
app.use(cors());

// Connect to MongoDB
connectDB();


app.get("/", (req, res) => {
  res.send("Welcome to the Demo School API");
});

app.use('/api/superadmin', superAdminRoutes);
app.use('/api/schools', schoolRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/marksheet", markSheetRoutes);
app.use("/api/student-payment", studentPaymentRoutes);
app.use("/api/leave", leaveRouter);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
