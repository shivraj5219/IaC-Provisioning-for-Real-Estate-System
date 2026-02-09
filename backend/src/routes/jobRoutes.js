const express = require("express");
const {
  createJob,
  getJobs,
  assignJob,
  completeJob,
  applyJob,
  getMyJobs,
  getMyApplications,
  deleteJob,
  acceptApplication,
  rejectApplication
} = require("../controllers/jobController");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

// Test route to verify routes are loaded
router.get("/test", (req, res) => {
  res.json({ message: "Job routes are working!" });
});

// Get all jobs
router.get("/", protect, getJobs);

// Get my posted jobs (Farmer) - MUST be before /:id routes
router.get("/my-jobs", protect, authorizeRoles("farmer"), getMyJobs);

// Get my applications (Labour) - MUST be before /:id routes
router.get("/my-applications", protect, authorizeRoles("labour"), getMyApplications);

// Create job (Farmer only)
router.post("/", protect, authorizeRoles("farmer"), createJob);
router.post("/create", protect, authorizeRoles("farmer"), createJob);

// Labour completes job - MUST be before /:id routes
router.put("/complete", protect, authorizeRoles("labour"), completeJob);

// Accept application (Farmer only) - MUST be before /:id/apply
router.post('/:jobId/accept/:labourId', protect, authorizeRoles("farmer"), acceptApplication);

// Reject application (Farmer only) - MUST be before /:id/apply
router.post('/:jobId/reject/:labourId', protect, authorizeRoles("farmer"), rejectApplication);

// Labour applies/request (Labour only)
router.post('/:id/apply', protect, authorizeRoles("labour"), applyJob);

// Assign job to labour (Farmer only)
router.put("/:id/assign", protect, authorizeRoles("farmer"), assignJob);

// Delete job (Farmer only)
router.delete("/:id", protect, authorizeRoles("farmer"), deleteJob);

module.exports = router;
