
const Job = require("../models/job.model");

// Create Job (Farmer)
const createJob = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      type,
      cropType,
      location, 
      duration,
      workersNeeded,
      wage, 
      startDate,
      requirements 
    } = req.body;
    
    // Parse location if it's a string
    let locationObj = location;
    if (typeof location === 'string') {
      const parts = location.split(',').map(s => s.trim());
      locationObj = {
        village: parts[0] || location,
        district: parts[1] || '',
        state: parts[2] || ''
      };
    }

    const job = await Job.create({
      title,
      description,
      type: type || 'General',
      cropType,
      duration: duration || '1 day',
      workersNeeded: workersNeeded || 1,
      wage: parseFloat(wage),
      location: locationObj,
      date: startDate || new Date(),
      requirements,
      createdBy: req.user._id
    });
    
    res.status(201).json(job);
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all Jobs (All users)
const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("createdBy", "fullName email")
      .populate("assignedTo", "fullName email");
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign Job to Labour (Farmer)
const assignJob = async (req, res) => {
  try {
    const jobId = req.params.id;          // URL param
    const { labourId } = req.body;        // body

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    job.assignedTo = labourId;
    job.status = "in-progress";
    await job.save();

    res.json({ message: "Job assigned successfully", job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




// Labour applies/request for a job
const applyJob = async (req, res) => {
  try {
    console.log('📝 Apply Job - Job ID:', req.params.id);
    console.log('👤 Labour User:', { id: req.user._id, email: req.user.email, role: req.user.role });
    
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    console.log('📋 Job found:', { title: job.title, currentApplications: job.applications?.length || 0 });

    if (job.assignedLabour) {
      return res.status(400).json({ message: 'Labour already assigned' });
    }

    const labourSkills = req.user.skills || [];
    const jobRequiredSkills = job.requiredSkills || [];
    
    // Only check skills if job has required skills
    if (jobRequiredSkills.length > 0) {
      const matched = jobRequiredSkills.every(skill => labourSkills.includes(skill));
      if (!matched) {
        return res.status(400).json({ message: "Your skills don't match the job requirements" });
      }
    }

    // Initialize arrays if they don't exist
    if (!job.labourRequests) {
      job.labourRequests = [];
    }
    if (!job.applications) {
      job.applications = [];
    }

    // Check if already applied
    const alreadyApplied = job.labourRequests.some(id => id.toString() === req.user._id.toString());
    if (alreadyApplied) {
      console.log('⚠️ Already applied!');
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Add to both arrays for backward compatibility
    job.labourRequests.push(req.user._id);
    job.applications.push({
      labour: req.user._id,
      appliedAt: new Date()
    });
    
    await job.save();
    
    console.log('✅ Application saved! Total applications:', job.applications.length);
    console.log('📊 Applications:', job.applications);

    res.status(200).json({ message: 'You have requested for this job' });
  } catch (err) {
    console.error('❌ Apply Job Error:', err);
    res.status(400).json({ message: err.message });
  }
};



// Labour completes job
const completeJob = async (req, res) => {
  try {
    const { jobId } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Optionally ensure only the assigned labour or an admin can complete
    job.status = "completed";
    await job.save();

    res.json({ message: "Job completed successfully", job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get my posted jobs (Farmer)
const getMyJobs = async (req, res) => {
  try {
    console.log('📋 Get My Jobs - Farmer ID:', req.user._id);
    
    const jobs = await Job.find({ createdBy: req.user._id })
      .populate("assignedTo", "fullName email phone")
      .populate("labourRequests", "fullName email phone skills location")
      .populate("applications.labour", "fullName email phone skills location")
      .sort({ createdAt: -1 });
    
    console.log('📊 Found jobs:', jobs.length);
    jobs.forEach(job => {
      console.log(`  Job: ${job.title} - Applications: ${job.applications?.length || 0}`);
    });
    
    res.json(jobs);
  } catch (error) {
    console.error('❌ Get My Jobs Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get my applications (Labour)
const getMyApplications = async (req, res) => {
  try {
    console.log('📋 Get My Applications - Labour ID:', req.user._id);
    
    const jobs = await Job.find({ 
      $or: [
        { labourRequests: req.user._id },
        { 'applications.labour': req.user._id }
      ]
    })
      .populate("createdBy", "fullName email phone")
      .sort({ createdAt: -1 });
    
    console.log('📊 Found jobs with applications:', jobs.length);
    
    // Get payment/payout info for jobs
    const Payment = require('../models/payment.model');
    
    // Transform to application format expected by frontend
    const applications = await Promise.all(jobs.map(async (job) => {
      // Find this labour's application in the job
      const application = job.applications?.find(
        app => app.labour.toString() === req.user._id.toString()
      );
      
      console.log('🔍 Job:', job.title, {
        assignedTo: job.assignedTo,
        labourId: req.user._id.toString(),
        paymentStatus: job.paymentStatus,
        totalAmount: job.totalAmount
      });
      
      // Determine status based on job state
      let status = 'pending';
      if (job.assignedTo && job.assignedTo.toString() === req.user._id.toString()) {
        status = 'accepted';
        console.log('✅ Status set to ACCEPTED');
      } else if (application && !job.labourRequests.some(id => id.toString() === req.user._id.toString())) {
        // If not in labourRequests but was in applications, it was rejected
        status = 'rejected';
        console.log('❌ Status set to REJECTED');
      } else {
        console.log('⏳ Status remains PENDING');
      }
      
      // Get payout status for this job
      const payment = await Payment.findOne({ job: job._id, labour: req.user._id });
      
      return {
        _id: job._id,
        job: {
          _id: job._id,
          title: job.title,
          description: job.description,
          location: job.location,
          wage: job.wage,
          duration: job.duration,
          startDate: job.date,
          type: job.type,
          cropType: job.cropType,
          paymentStatus: job.paymentStatus,
          totalAmount: job.totalAmount,
          paymentDetails: job.paymentDetails
        },
        appliedAt: application?.appliedAt || job.createdAt,
        status: status,
        paymentStatus: job.paymentStatus,
        totalAmount: job.totalAmount,
        payoutStatus: payment?.payoutStatus,
        payoutUtr: payment?.payoutUtr
      };
    }));
    
    console.log('📋 Transformed applications:', applications.length);
    
    res.json(applications);
  } catch (error) {
    console.error('❌ Get My Applications Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete job (Farmer only)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    
    // Check if the job belongs to the logged-in farmer
    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this job" });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Accept application (Farmer only)
const acceptApplication = async (req, res) => {
  try {
    const { jobId, labourId } = req.params;
    
    console.log('✅ Accept Application - Job:', jobId, 'Labour:', labourId);
    
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    
    // Check if the job belongs to the logged-in farmer
    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to modify this job" });
    }
    
    // Check if labour actually applied
    const hasApplied = job.applications.some(app => app.labour.toString() === labourId);
    if (!hasApplied) {
      return res.status(400).json({ message: "Labour has not applied for this job" });
    }
    
    // Assign labour to job
    job.assignedTo = labourId;
    job.status = "in-progress";
    
    // Remove from applications and requests
    job.applications = job.applications.filter(app => app.labour.toString() !== labourId);
    job.labourRequests = job.labourRequests.filter(id => id.toString() !== labourId);
    
    await job.save();
    
    console.log('✅ Application accepted and labour assigned');
    
    // Create notification for labour
    const notificationController = require('./notificationController');
    await notificationController.createNotification({
      recipient: labourId,
      sender: req.user._id,
      type: 'application_accepted',
      title: '🎉 Application Accepted!',
      message: `Your application for "${job.title}" has been accepted by the farmer. They will contact you soon.`,
      jobId: job._id
    });
    
    res.json({ 
      message: "Application accepted successfully", 
      job 
    });
  } catch (error) {
    console.error('❌ Accept Application Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Reject application (Farmer only)
const rejectApplication = async (req, res) => {
  try {
    const { jobId, labourId } = req.params;
    
    console.log('❌ Reject Application - Job:', jobId, 'Labour:', labourId);
    
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    
    // Check if the job belongs to the logged-in farmer
    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to modify this job" });
    }
    
    // Check if labour actually applied
    const hasApplied = job.applications.some(app => app.labour.toString() === labourId);
    if (!hasApplied) {
      return res.status(400).json({ message: "Labour has not applied for this job" });
    }
    
    // Remove from applications and requests
    job.applications = job.applications.filter(app => app.labour.toString() !== labourId);
    job.labourRequests = job.labourRequests.filter(id => id.toString() !== labourId);
    
    await job.save();
    
    console.log('❌ Application rejected and removed');
    
    // Create notification for labour
    const notificationController = require('./notificationController');
    await notificationController.createNotification({
      recipient: labourId,
      sender: req.user._id,
      type: 'application_rejected',
      title: 'Application Not Selected',
      message: `Your application for "${job.title}" was not selected. Don't worry, keep applying to other jobs!`,
      jobId: job._id
    });
    
    res.json({ 
      message: "Application rejected successfully", 
      job 
    });
  } catch (error) {
    console.error('❌ Reject Application Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};
