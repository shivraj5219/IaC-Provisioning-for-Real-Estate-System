const Job = require("../models/job.model");

// Create Job (Farmer)
const createJob = async (req, res) => {
  try {
    const { title, description, wage, location, date } = req.body;
    const job = await Job.create({
      title,
      description,
      wage,
      location,
      date,
      createdBy: req.user._id,
      createdByName: req.user.fullName
    });
    res.status(201).json(job);
  } catch (error) {
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
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

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

    // Initialize labourRequests array if it doesn't exist
    if (!job.labourRequests) {
      job.labourRequests = [];
    }

    if (!job.labourRequests.includes(req.user._id)) {
      job.labourRequests.push(req.user._id);
      await job.save();
    }

    res.status(200).json({ message: 'You have requested for this job' });
  } catch (err) {
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

// Smart Labour Recommendation System with ML Integration
const recommendLabour = async (req, res) => {
  try {
    const { 
      jobType, skills, experience, location, duration, workersNeeded, 
      cropType, area, season,
      // Advanced ML parameters
      Crop, Season, Region, Soil_Type, Irrigation_Type,
      Mechanization_Level, Labour_Availability, Gender_Split,
      Farm_Size_Acre, Prev_Yield_q_per_acre, Weather_Index
    } = req.body;

    // Get all labour users from database
    const User = require('../models/user.model');
    const labourUsers = await User.find({ role: 'labour' }).select('-password');

    // ML-based labour requirement calculation
    let mlPrediction = null;
    
    // Check if advanced ML parameters provided
    const useAdvancedML = Crop && Farm_Size_Acre;
    
    if (useAdvancedML) {
      // Use advanced ML model with all 12 parameters
      try {
        const { spawn } = require('child_process');
        const path = require('path');
        
        const scriptPath = path.join(__dirname, '../ml/predict_labour.py');
        const python = spawn('python', [scriptPath]);
        
        const inputData = JSON.stringify([{
          Crop: Crop,
          Season: Season || 'Kharif',
          Region: Region || 'Punjab',
          Soil_Type: Soil_Type || 'Loamy',
          Irrigation_Type: Irrigation_Type || 'Canal',
          Mechanization_Level: Mechanization_Level || 'Medium',
          Labour_Availability: Labour_Availability || 'High',
          Gender_Split: Gender_Split || 'Mixed',
          Farm_Size_Acre: parseFloat(Farm_Size_Acre),
          Task: 'General',
          Prev_Yield_q_per_acre: parseFloat(Prev_Yield_q_per_acre || 20),
          Weather_Index: parseFloat(Weather_Index || 0.8)
        }]);
        
        python.stdin.write(inputData);
        python.stdin.end();
        
        let result = '';
        let errorOutput = '';
        python.stdout.on('data', (data) => { result += data.toString(); });
        python.stderr.on('data', (data) => { errorOutput += data.toString(); });
        
        await new Promise((resolve) => {
          python.on('close', () => {
            try {
              if (errorOutput) {
                console.error('Python stderr:', errorOutput);
              }
              const parsed = JSON.parse(result.trim());
              if (parsed && parsed.length > 0) {
                mlPrediction = parsed[0];
              }
            } catch (e) {
              console.error('Failed to parse ML prediction:', e);
              console.error('Raw output:', result);
            }
            resolve();
          });
        });
      } catch (mlError) {
        console.error('Advanced ML prediction error:', mlError);
      }
    } else if (cropType && area) {
      try {
        const { spawn } = require('child_process');
        const path = require('path');
        
        const scriptPath = path.join(__dirname, '../ml/smart_labour_recommendation.py');
        const python = spawn('python', [scriptPath]);
        
        const inputData = JSON.stringify({ 
          crop_type: cropType, 
          area: parseFloat(area),
          season: season || 'Kharif'
        });
        
        python.stdin.write(inputData);
        python.stdin.end();
        
        let result = '';
        python.stdout.on('data', (data) => { result += data.toString(); });
        
        await new Promise((resolve) => {
          python.on('close', () => {
            try {
              mlPrediction = JSON.parse(result.trim());
            } catch (e) {
              console.error('Failed to parse ML prediction:', e);
            }
            resolve();
          });
        });
      } catch (mlError) {
        console.error('ML prediction error:', mlError);
      }
    }

    if (labourUsers.length === 0) {
      return res.json({ 
        success: true,
        message: 'No labour users found in database',
        recommendations: [],
        mlPrediction: mlPrediction
      });
    }

    // Calculate match score for each labour
    const recommendations = labourUsers.map(labour => {
      let matchScore = 0;
      let factors = [];

      // 1. Skills Matching (40% weight)
      if (skills && labour.skills && Array.isArray(labour.skills)) {
        const requiredSkills = skills.toLowerCase().split(',').map(s => s.trim());
        const labourSkills = labour.skills.map(s => s.toLowerCase());
        
        const matchedSkills = requiredSkills.filter(skill => 
          labourSkills.some(ls => ls.includes(skill) || skill.includes(ls))
        );
        
        const skillScore = requiredSkills.length > 0 
          ? (matchedSkills.length / requiredSkills.length) * 40 
          : 40; // If no skills specified, give full points
        
        matchScore += skillScore;
        factors.push({ factor: 'Skills', score: skillScore.toFixed(1) });
      } else {
        matchScore += 40; // No skills filter, give full points
        factors.push({ factor: 'Skills', score: '40.0' });
      }

      // 2. Experience Matching (25% weight)
      const minExperience = experience ? parseInt(experience) : 0;
      const labourExperience = labour.experience || 0;
      
      if (labourExperience >= minExperience) {
        const experienceScore = Math.min(25, (labourExperience / Math.max(minExperience, 1)) * 12.5);
        matchScore += experienceScore;
        factors.push({ factor: 'Experience', score: experienceScore.toFixed(1) });
      } else {
        const penalty = ((minExperience - labourExperience) / minExperience) * 15;
        matchScore += Math.max(0, 25 - penalty);
        factors.push({ factor: 'Experience', score: Math.max(0, 25 - penalty).toFixed(1) });
      }

      // 3. Location Proximity (20% weight)
      if (location && labour.location) {
        const reqLocation = location.toLowerCase().trim();
        const labourLocation = typeof labour.location === 'object' 
          ? (labour.location.city || labour.location.state || '').toLowerCase()
          : labour.location.toLowerCase();
        
        const locationScore = labourLocation.includes(reqLocation) || reqLocation.includes(labourLocation)
          ? 20 
          : 10; // Partial points if not exact match
        
        matchScore += locationScore;
        factors.push({ factor: 'Location', score: locationScore.toFixed(1) });
      } else {
        matchScore += 15; // No location filter, give partial points
        factors.push({ factor: 'Location', score: '15.0' });
      }

      // 4. Rating/Performance (10% weight)
      const rating = labour.rating || 4.0; // Default rating
      const ratingScore = (rating / 5) * 10;
      matchScore += ratingScore;
      factors.push({ factor: 'Rating', score: ratingScore.toFixed(1) });

      // 5. Availability (5% weight)
      const availability = labour.availability || 'Available';
      const availabilityScore = availability === 'Available' ? 5 : 2;
      matchScore += availabilityScore;
      factors.push({ factor: 'Availability', score: availabilityScore.toFixed(1) });

      // Format fullName properly
      let labourName = 'Labour';
      if (labour.fullName) {
        if (typeof labour.fullName === 'object') {
          labourName = `${labour.fullName.firstName || ''} ${labour.fullName.lastName || ''}`.trim();
        } else {
          labourName = labour.fullName;
        }
      }

      // Format location properly
      let formattedLocation = 'Not specified';
      if (labour.location) {
        if (typeof labour.location === 'object') {
          const parts = [];
          if (labour.location.village) parts.push(labour.location.village);
          if (labour.location.district) parts.push(labour.location.district);
          if (labour.location.state) parts.push(labour.location.state);
          formattedLocation = parts.join(', ') || 'Not specified';
        } else {
          formattedLocation = labour.location;
        }
      }

      return {
        id: labour._id,
        name: labourName,
        email: labour.email,
        phone: labour.phone,
        skills: labour.skills || [],
        experience: labour.experience || 0,
        rating: labour.rating || 4.0,
        location: formattedLocation,
        availability: labour.availability || 'Available',
        completedJobs: labour.completedJobs || 0,
        phoneVerified: labour.phoneVerified || false,
        matchScore: Math.round(matchScore),
        matchFactors: factors
      };
    });

    // Sort by match score (descending)
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    // Determine recommended count based on ML prediction or user input
    let recommendedCount = workersNeeded ? parseInt(workersNeeded) : 10;
    if (mlPrediction && mlPrediction.success) {
      recommendedCount = mlPrediction.labour_required;
    }

    // Return top matches (limit to recommended count * 3 for options)
    const limit = recommendedCount * 3;
    const topRecommendations = recommendations.slice(0, limit);

    // Build response
    const response = {
      success: true,
      count: topRecommendations.length,
      totalLabourers: labourUsers.length,
      requirements: { jobType, skills, experience, location, duration, workersNeeded },
      recommendations: topRecommendations
    };

    // Add ML prediction if available
    if (mlPrediction) {
      if (mlPrediction.success) {
        // Simple ML prediction format
        response.mlPrediction = {
          recommendedLabourCount: mlPrediction.labour_required,
          demandLevel: mlPrediction.demand_level,
          labourPerHectare: mlPrediction.labour_per_hectare,
          confidence: mlPrediction.confidence,
          method: mlPrediction.method,
          recommendations: mlPrediction.recommendations
        };
      } else if (mlPrediction.Labour_Required) {
        // Advanced ML prediction format
        response.mlPrediction = {
          recommendedLabourCount: mlPrediction.Labour_Required,
          demandLevel: mlPrediction.Labour_Demand_Level || 'Medium',
          labourPerAcre: mlPrediction.Labour_Required / (Farm_Size_Acre || 1),
          confidence: 0.90,
          method: 'advanced_ml_model',
          recommendations: [
            `Total labour required: ${mlPrediction.Labour_Required} workers`,
            `Labour intensity: ${mlPrediction.Labour_Demand_Level || 'Medium'}`,
            `For ${Crop} crop in ${Season || 'Kharif'} season`,
            `Farm size: ${Farm_Size_Acre} acres`
          ]
        };
      }
    }

    res.json(response);

  } catch (err) {
    console.error('Labour Recommendation Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Predict labour needs (mock implementation)
// const predictLabour = async (req, res) => {
//   try {
//     const { cropType, area } = req.body || {};
//     // simple mock: labourNeeded = area * 2 for demo
//     const labourNeeded = (area && Number(area)) ? Math.ceil(area * 2) : 0;
//     return res.json({ cropType: cropType || 'unknown', area: area || 0, labourNeeded });
//   } catch (err) {
//     return res.status(500).json({ message: err.message });
//   }
// };

// Export all functions
module.exports = {
  createJob,
  getJobs,
  assignJob,
  completeJob,
  applyJob,
  recommendLabour
};
