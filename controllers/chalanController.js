const Chalan = require("../models/Chalan");

// CREATE or UPDATE (Upsert) Chalan by schoolId
exports.createOrUpdateChalan = async (req, res) => {
  try {
    const schoolId = req.admin.schoolIds[0];  // 💥 take schoolId from token
    const adminId = req.admin.userId;

    let chalan = await Chalan.findOne({ schoolId });

    if (!chalan) {
      chalan = new Chalan({
        schoolId,
        ...req.body,
        createdBy: adminId,
      });
    } else {
      Object.assign(chalan, req.body, {
        updatedBy: adminId,
      });
    }

    await chalan.save();

    res.json({
      message: "Chalan saved successfully",
      data: chalan,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// GET Chalan by School ID
exports.getChalanBySchool = async (req, res) => {
  try {
    const schoolId = req.admin.schoolIds[0];  // 💥 from token

    const chalan = await Chalan.findOne({ schoolId });

    if (!chalan)
      return res.status(404).json({ message: "Chalan not found" });

    res.json(chalan);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// DELETE Chalan
exports.deleteChalan = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Chalan.findByIdAndDelete(id);

    if (!deleted) return res.status(404).json({ message: "Chalan not found" });

    res.json({ message: "Chalan deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateChalan = async (req, res) => {
  try {
    const adminId = req.admin.userId;

    const updated = await Chalan.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedBy: adminId,
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Chalan not found" });

    res.json({
      message: "Chalan updated successfully",
      data: updated,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

