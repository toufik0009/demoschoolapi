const express = require("express");
const router = express.Router();

const {
  createOrUpdateChalan,
  getChalanBySchool,
  deleteChalan,
  updateChalan
} = require("../controllers/chalanController");

const { adminAuth } = require("../middleware/adminMiddleware");

router.post("/create-update", adminAuth, createOrUpdateChalan);
router.get("/school", adminAuth, getChalanBySchool); 
router.put("/update/:id", adminAuth, updateChalan);
router.delete("/:id", adminAuth, deleteChalan);

module.exports = router;
