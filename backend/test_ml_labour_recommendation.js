/**
 * Test ML Labour Recommendation System
 * 
 * This script demonstrates how the system works:
 * 1. Takes crop/farm details as input
 * 2. ML model calculates required labour count
 * 3. Backend fetches matching labour users from database
 * 4. Returns labour count + list of recommended workers
 */

const mongoose = require('mongoose');
const User = require('./src/models/user.model');
const { spawn } = require('child_process');
const path = require('path');

async function testMLLabourRecommendation() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://127.0.0.1:27017/krishi-sangam');
    console.log('✅ Connected to MongoDB\n');

    // ========================================
    // STEP 1: INPUT DATA (Crop Details)
    // ========================================
    const input = {
      Crop: "Soybean",
      Season: "Kharif",
      Region: "Punjab",
      Soil_Type: "Loamy",
      Irrigation_Type: "Canal",
      Mechanization_Level: "Medium",
      Labour_Availability: "High",
      Gender_Split: "Mixed",
      Farm_Size_Acre: 30,
      Prev_Yield_q_per_acre: 20,
      Weather_Index: 0.8,
      Labour_Per_Acre_est: 3
    };

    console.log('📋 INPUT DATA:');
    console.log(JSON.stringify(input, null, 2));
    console.log('\n' + '='.repeat(60) + '\n');

    // ========================================
    // STEP 2: ML MODEL PREDICTION
    // ========================================
    console.log('🤖 Running ML Model...\n');

    // For now, using heuristic from smart_labour_recommendation.py
    // Convert acres to hectares (1 acre = 0.404686 hectares)
    const areaHectares = input.Farm_Size_Acre * 0.404686;
    
    const scriptPath = path.join(__dirname, 'src/ml/smart_labour_recommendation.py');
    const python = spawn('python', [scriptPath]);
    
    const mlInput = JSON.stringify({ 
      crop_type: input.Crop, 
      area: areaHectares,
      season: input.Season
    });
    
    python.stdin.write(mlInput);
    python.stdin.end();
    
    let mlResult = '';
    python.stdout.on('data', (data) => { mlResult += data.toString(); });
    
    const mlPrediction = await new Promise((resolve) => {
      python.on('close', () => {
        try {
          resolve(JSON.parse(mlResult.trim()));
        } catch (e) {
          console.error('Failed to parse ML prediction:', e);
          resolve(null);
        }
      });
    });

    if (mlPrediction && mlPrediction.success) {
      console.log('✅ ML MODEL OUTPUT:');
      console.log(`   Crop: ${mlPrediction.crop_type}`);
      console.log(`   Area: ${mlPrediction.area_hectares.toFixed(2)} hectares (${input.Farm_Size_Acre} acres)`);
      console.log(`   Season: ${mlPrediction.season}`);
      console.log(`   Labour Required: ${mlPrediction.labour_required} workers`);
      console.log(`   Demand Level: ${mlPrediction.demand_level}`);
      console.log(`   Labour per Hectare: ${mlPrediction.labour_per_hectare}`);
      console.log(`   Confidence: ${(mlPrediction.confidence * 100).toFixed(0)}%`);
      console.log(`   Method: ${mlPrediction.method}`);
      console.log('\n' + '='.repeat(60) + '\n');
    }

    // ========================================
    // STEP 3: FETCH MATCHING LABOUR FROM DATABASE
    // ========================================
    console.log('👷 Fetching Labour Workers from Database...\n');

    const labourUsers = await User.find({ role: 'labour' }).select('-password');
    console.log(`   Total Labour Users in DB: ${labourUsers.length}\n`);

    // Calculate match scores based on input criteria
    const recommendations = labourUsers.map(labour => {
      let matchScore = 0;

      // Skills matching (if crop-specific skills exist)
      const cropSkills = ['Plowing', 'Sowing', 'Harvesting', 'Weeding'];
      if (labour.skills && Array.isArray(labour.skills)) {
        const matchedSkills = labour.skills.filter(skill => 
          cropSkills.some(cs => skill.toLowerCase().includes(cs.toLowerCase()))
        );
        matchScore += (matchedSkills.length / cropSkills.length) * 40;
      } else {
        matchScore += 20; // Partial points if no skills
      }

      // Experience (prefer 3+ years)
      const experience = labour.experience || 0;
      if (experience >= 3) matchScore += 25;
      else matchScore += (experience / 3) * 25;

      // Location matching (Punjab)
      if (labour.location) {
        const labourLocation = typeof labour.location === 'object'
          ? (labour.location.state || '').toLowerCase()
          : labour.location.toLowerCase();
        
        if (labourLocation.includes(input.Region.toLowerCase())) {
          matchScore += 20;
        } else {
          matchScore += 10;
        }
      } else {
        matchScore += 10;
      }

      // Rating
      const rating = labour.rating || 4.0;
      matchScore += (rating / 5) * 10;

      // Availability
      const availability = labour.availability || 'Available';
      matchScore += availability === 'Available' ? 5 : 2;

      // Format name properly
      let labourName = 'Labour';
      if (labour.fullName) {
        if (typeof labour.fullName === 'object') {
          labourName = `${labour.fullName.firstName || ''} ${labour.fullName.lastName || ''}`.trim();
        } else {
          labourName = String(labour.fullName);
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
          formattedLocation = String(labour.location);
        }
      }

      return {
        id: labour._id,
        name: labourName,
        email: labour.email,
        phone: labour.phone,
        skills: labour.skills || [],
        experience: experience,
        rating: rating,
        location: formattedLocation,
        availability: availability,
        completedJobs: labour.completedJobs || 0,
        phoneVerified: labour.phoneVerified || false,
        matchScore: Math.round(matchScore)
      };
    });

    // Sort by match score
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    // Get top recommendations (based on ML prediction)
    const requiredCount = mlPrediction ? mlPrediction.labour_required : 10;
    const topRecommendations = recommendations.slice(0, Math.min(requiredCount, recommendations.length));

    // ========================================
    // STEP 4: FINAL OUTPUT
    // ========================================
    console.log('✅ RECOMMENDED LABOUR WORKERS:\n');
    console.log(`   Required: ${requiredCount} workers`);
    console.log(`   Available: ${topRecommendations.length} workers\n`);

    topRecommendations.forEach((labour, index) => {
      console.log(`${index + 1}. ${labour.name} [${labour.matchScore}% Match]`);
      console.log(`   📧 Email: ${labour.email}`);
      console.log(`   📱 Phone: ${labour.phone} ${labour.phoneVerified ? '✓' : ''}`);
      console.log(`   🎯 Skills: ${labour.skills.join(', ') || 'N/A'}`);
      console.log(`   💼 Experience: ${labour.experience} years`);
      console.log(`   ⭐ Rating: ${labour.rating}/5.0 (${labour.completedJobs} jobs)`);
      console.log(`   📍 Location: ${labour.location}`);
      console.log(`   ✅ Status: ${labour.availability}`);
      console.log('');
    });

    console.log('='.repeat(60));
    console.log('\n📊 SUMMARY:');
    console.log(`   Farm Size: ${input.Farm_Size_Acre} acres (${areaHectares.toFixed(2)} hectares)`);
    console.log(`   Crop: ${input.Crop} (${input.Season} season)`);
    console.log(`   Labour Required: ${requiredCount} workers`);
    console.log(`   Recommendations Provided: ${topRecommendations.length} workers`);
    console.log(`   Top Match Score: ${topRecommendations[0]?.matchScore || 0}%`);
    console.log('='.repeat(60));

    // ========================================
    // API RESPONSE FORMAT
    // ========================================
    const apiResponse = {
      success: true,
      input: input,
      mlPrediction: mlPrediction ? {
        labourRequired: mlPrediction.labour_required,
        demandLevel: mlPrediction.demand_level,
        labourPerHectare: mlPrediction.labour_per_hectare,
        confidence: mlPrediction.confidence,
        method: mlPrediction.method,
        recommendations: mlPrediction.recommendations
      } : null,
      labourRecommendations: {
        count: topRecommendations.length,
        required: requiredCount,
        workers: topRecommendations
      }
    };

    console.log('\n\n📤 API RESPONSE FORMAT:');
    console.log(JSON.stringify(apiResponse, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the test
testMLLabourRecommendation();
