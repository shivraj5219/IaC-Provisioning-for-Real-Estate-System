import { useState } from 'react';
import { labourAPI, workRequestAPI } from '../../services/api';
import Navbar from '../../components/Common/Navbar';
import './LabourRecommendation.css';

const LabourRecommendation = () => {
  const [requirements, setRequirements] = useState({
    // Basic requirements
    jobType: '',
    skills: '',
    experience: '',
    location: '',
    
    // Advanced ML Parameters (from train_labour_model_v2.py)
    Crop: '',
    Season: 'Kharif',
    Region: 'Punjab',
    Soil_Type: 'Loamy',
    Irrigation_Type: 'Canal',
    Mechanization_Level: 'Medium',
    Labour_Availability: 'High',
    Gender_Split: 'Mixed',
    Farm_Size_Acre: '',
    Prev_Yield_q_per_acre: '',
    Weather_Index: 0.8
  });
  const [recommendations, setRecommendations] = useState([]);
  const [mlPrediction, setMlPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Work request modal state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedLabour, setSelectedLabour] = useState(null);
  const [requestForm, setRequestForm] = useState({
    jobType: '',
    cropType: '',
    farmSize: '',
    duration: '',
    wage: '',
    startDate: '',
    requirements: '',
    message: ''
  });
  const [sendingRequest, setSendingRequest] = useState(false);

  const jobTypes = ['Plowing', 'Sowing', 'Harvesting', 'Irrigation', 'Weeding', 'General Labor', 'Pesticide Application', 'Others'];
  const cropTypes = ['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize', 'Soybean', 'Vegetables', 'Fruits'];
  const seasons = ['Kharif', 'Rabi', 'Zaid'];
  const regions = ['Punjab', 'Haryana', 'Uttar Pradesh', 'Gujarat', 'Maharashtra', 'Rajasthan', 'Madhya Pradesh', 'Karnataka', 'Andhra Pradesh', 'Tamil Nadu'];
  const soilTypes = ['Loamy', 'Clay', 'Sandy', 'Black', 'Red', 'Alluvial'];
  const irrigationTypes = ['Canal', 'Well', 'Tube Well', 'Drip', 'Sprinkler', 'Rain-fed'];
  const mechanizationLevels = ['High', 'Medium', 'Low', 'Unknown'];
  const labourAvailability = ['High', 'Medium', 'Low'];
  const genderSplit = ['Male', 'Female', 'Mixed'];

  const handleChange = (e) => {
    setRequirements({
      ...requirements,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await labourAPI.recommendLabour(requirements);
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        setRecommendations(response.data.recommendations);
        setMlPrediction(response.data.mlPrediction || null);
        
        if (response.data.recommendations.length === 0) {
          setError('No labour found matching your requirements. Try adjusting your filters.');
        }
      } else {
        setError(response.data.message || 'Failed to get recommendations');
      }
    } catch (err) {
      console.error('Labour Recommendation Error:', err);
      setError(err.response?.data?.message || 'Failed to fetch recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRequirements({
      jobType: '',
      skills: '',
      experience: '',
      location: '',
      Crop: '',
      Season: 'Kharif',
      Region: 'Punjab',
      Soil_Type: 'Loamy',
      Irrigation_Type: 'Canal',
      Mechanization_Level: 'Medium',
      Labour_Availability: 'High',
      Gender_Split: 'Mixed',
      Farm_Size_Acre: '',
      Prev_Yield_q_per_acre: '',
      Weather_Index: 0.8
    });
    setRecommendations([]);
    setMlPrediction(null);
    setError(null);
  };

  const getMatchColor = (score) => {
    if (score >= 90) return '#4caf50';
    if (score >= 75) return '#ff9800';
    return '#f44336';
  };

  const handleOpenRequestModal = (labour) => {
    setSelectedLabour(labour);
    setRequestForm({
      jobType: requirements.jobType || '',
      cropType: requirements.Crop || '',
      farmSize: requirements.Farm_Size_Acre || '',
      duration: '',
      wage: '',
      startDate: '',
      requirements: requirements.skills || '',
      message: ''
    });
    setShowRequestModal(true);
  };

  const handleCloseRequestModal = () => {
    setShowRequestModal(false);
    setSelectedLabour(null);
    setRequestForm({
      jobType: '',
      cropType: '',
      farmSize: '',
      duration: '',
      wage: '',
      startDate: '',
      requirements: '',
      message: ''
    });
  };

  const handleRequestFormChange = (e) => {
    setRequestForm({
      ...requestForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    setSendingRequest(true);
    
    try {
      const requestData = {
        labourId: selectedLabour.id || selectedLabour._id,
        ...requestForm
      };
      
      const response = await workRequestAPI.sendRequest(requestData);
      
      if (response.data.success) {
        alert('Work request sent successfully! The labour user will be notified.');
        handleCloseRequestModal();
      }
    } catch (err) {
      console.error('Send request error:', err);
      alert(err.response?.data?.message || 'Failed to send work request. Please try again.');
    } finally {
      setSendingRequest(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="labour-recommendation-container">
        <div className="recommendation-header">
          <h1>🤖 Smart Labour Recommendation System</h1>
          <p>AI-powered matching to find the perfect labourers for your farm work</p>
        </div>

        <div className="recommendation-form-card">
          <h2>🌾 Advanced ML Labour Prediction</h2>
          <p style={{marginBottom: '20px', color: '#666'}}>Enter complete farm details for accurate AI-powered labour recommendations</p>
          <form onSubmit={handleSearch} className="recommendation-form">
          
          {/* Crop & Farm Details */}
          <div className="ml-section">
            <h3>🌱 Crop & Farm Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Crop Type *</label>
                <select name="Crop" value={requirements.Crop} onChange={handleChange} required>
                  <option value="">Select crop</option>
                  {cropTypes.map(crop => (
                    <option key={crop} value={crop}>{crop}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Season *</label>
                <select name="Season" value={requirements.Season} onChange={handleChange} required>
                  {seasons.map(season => (
                    <option key={season} value={season}>{season}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Farm Size (Acres) *</label>
                <input
                  type="number"
                  name="Farm_Size_Acre"
                  value={requirements.Farm_Size_Acre}
                  onChange={handleChange}
                  min="0.1"
                  step="0.1"
                  placeholder="e.g., 30"
                  required
                />
              </div>

              <div className="form-group">
                <label>Region</label>
                <select name="Region" value={requirements.Region} onChange={handleChange}>
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Soil & Irrigation */}
          <div className="ml-section">
            <h3>🌍 Soil & Irrigation Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Soil Type</label>
                <select name="Soil_Type" value={requirements.Soil_Type} onChange={handleChange}>
                  {soilTypes.map(soil => (
                    <option key={soil} value={soil}>{soil}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Irrigation Type</label>
                <select name="Irrigation_Type" value={requirements.Irrigation_Type} onChange={handleChange}>
                  {irrigationTypes.map(irrigation => (
                    <option key={irrigation} value={irrigation}>{irrigation}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Labour & Mechanization */}
          <div className="ml-section">
            <h3>👥 Labour & Mechanization</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Mechanization Level</label>
                <select name="Mechanization_Level" value={requirements.Mechanization_Level} onChange={handleChange}>
                  {mechanizationLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Labour Availability</label>
                <select name="Labour_Availability" value={requirements.Labour_Availability} onChange={handleChange}>
                  {labourAvailability.map(avail => (
                    <option key={avail} value={avail}>{avail}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Gender Split</label>
                <select name="Gender_Split" value={requirements.Gender_Split} onChange={handleChange}>
                  {genderSplit.map(gender => (
                    <option key={gender} value={gender}>{gender}</option>
                  ))}
                </select>
              </div>
              <div className="form-group"></div>
            </div>
          </div>

          {/* Yield & Weather */}
          <div className="ml-section">
            <h3>📊 Yield & Weather Data</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Previous Yield (quintals/acre)</label>
                <input
                  type="number"
                  name="Prev_Yield_q_per_acre"
                  value={requirements.Prev_Yield_q_per_acre}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  placeholder="e.g., 20"
                />
              </div>

              <div className="form-group">
                <label>Weather Index (0-1)</label>
                <input
                  type="number"
                  name="Weather_Index"
                  value={requirements.Weather_Index}
                  onChange={handleChange}
                  min="0"
                  max="1"
                  step="0.1"
                  placeholder="e.g., 0.8"
                />
              </div>
            </div>
          </div>

          {/* Labour Matching Filters */}
          <div className="ml-section" style={{borderColor: '#2196f3'}}>
            <h3>🔍 Labour Matching Filters (Optional)</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Job Type</label>
                <select name="jobType" value={requirements.jobType} onChange={handleChange}>
                  <option value="">Any</option>
                  {jobTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Required Skills</label>
                <input
                  type="text"
                  name="skills"
                  value={requirements.skills}
                  onChange={handleChange}
                  placeholder="e.g., Plowing, Harvesting"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Minimum Experience (years)</label>
                <input
                  type="number"
                  name="experience"
                  value={requirements.experience}
                  onChange={handleChange}
                  min="0"
                  placeholder="e.g., 3"
                />
              </div>

              <div className="form-group">
                <label>Location Preference</label>
                <input
                  type="text"
                  name="location"
                  value={requirements.location}
                  onChange={handleChange}
                  placeholder="e.g., Punjab"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleReset} className="btn-reset">
              Reset
            </button>
            <button type="submit" className="btn-search" disabled={loading}>
              {loading ? 'Searching...' : 'Find Labourers'}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {mlPrediction && (
        <div className="ml-prediction-card">
          <h2>🤖 AI Labour Requirement Prediction</h2>
          <div className="prediction-stats">
            <div className="stat-box primary">
              <span className="stat-icon">👥</span>
              <div>
                <h3>{mlPrediction.recommendedLabourCount}</h3>
                <p>Workers Required</p>
              </div>
            </div>
            <div className="stat-box">
              <span className="stat-icon">📊</span>
              <div>
                <h3>{mlPrediction.demandLevel}</h3>
                <p>Demand Level</p>
              </div>
            </div>
            <div className="stat-box">
              <span className="stat-icon">📏</span>
              <div>
                <h3>{mlPrediction.labourPerAcre ? Math.round(mlPrediction.labourPerAcre) : mlPrediction.labourPerHectare ? Math.round(mlPrediction.labourPerHectare) : 'N/A'}</h3>
                <p>Workers per Acre</p>
              </div>
            </div>
            <div className="stat-box">
              <span className="stat-icon">✨</span>
              <div>
                <h3>{Math.round((mlPrediction.confidence || 0.9) * 100)}%</h3>
                <p>Confidence</p>
              </div>
            </div>
          </div>
          
          <div style={{marginTop: '15px', padding: '10px', background: '#f5f5f5', borderRadius: '5px'}}>
            <p style={{margin: 0, fontSize: '0.9rem', color: '#666'}}>
              <strong>Method:</strong> {mlPrediction.method || 'ML Model'} | 
              <strong> Crop:</strong> {requirements.Crop} | 
              <strong> Season:</strong> {requirements.Season} | 
              <strong> Farm Size:</strong> {requirements.Farm_Size_Acre} acres
            </p>
          </div>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="recommendations-section">
          <div className="section-header">
            <h2>Recommended Labourers</h2>
            <p>Showing {recommendations.length} matches based on your requirements</p>
          </div>

          <div className="recommendations-grid">
            {recommendations.map((labour, index) => {
              // Safe data extraction
              const labourId = labour.id || labour._id || index;
              const displayName = String(labour.name || labour.fullName || 'Labour');
              const firstLetter = displayName.charAt(0).toUpperCase();
              const rating = Number(labour.rating) || 4.0;
              const completedJobs = Number(labour.completedJobs) || 0;
              const matchScore = Number(labour.matchScore) || 0;
              const experience = Number(labour.experience) || 0;
              const skills = Array.isArray(labour.skills) ? labour.skills : [];
              const location = String(labour.location || 'Not specified');
              const phone = String(labour.phone || 'N/A');
              const availability = String(labour.availability || 'Available');
              const phoneVerified = Boolean(labour.phoneVerified);
              
              return (
              <div key={labourId} className="labour-card">
                <div className="labour-header">
                  <div className="labour-avatar">
                    <span>{firstLetter}</span>
                  </div>
                  <div className="labour-info">
                    <h3>{displayName}</h3>
                    <div className="labour-rating">
                      <span className="stars">⭐ {rating}</span>
                      <span className="reviews">({completedJobs} jobs)</span>
                    </div>
                  </div>
                  <div 
                    className="match-badge" 
                    style={{ backgroundColor: getMatchColor(matchScore) }}
                  >
                    {matchScore}% Match
                  </div>
                </div>

                <div className="labour-details">
                  <div className="detail-item">
                    <span className="detail-icon">📍</span>
                    <span><strong>Location:</strong> {location}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-icon">💼</span>
                    <span><strong>Experience:</strong> {experience} years</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-icon">✅</span>
                    <span><strong>Completed Jobs:</strong> {completedJobs}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-icon">🎯</span>
                    <div>
                      <strong>Skills:</strong>
                      <div className="skills-tags">
                        {skills.map((skill, idx) => (
                          <span key={idx} className="skill-tag">{skill}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="detail-item">
                    <span className="detail-icon">📱</span>
                    <span>
                      <strong>Phone:</strong> {phone}
                      {phoneVerified && <span className="verified"> Verified ✓</span>}
                    </span>
                  </div>

                  <div className="availability-status">
                    <span className={`status-badge ${availability.toLowerCase()}`}>
                      {availability}
                    </span>
                  </div>
                </div>

                <div className="labour-actions">
                  {availability.toLowerCase() === 'available' && (
                    <button 
                      className="btn-contact"
                      onClick={() => handleOpenRequestModal(labour)}
                    >
                      Send Request
                    </button>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Work Request Modal */}
      {showRequestModal && selectedLabour && (
        <div className="modal-overlay" onClick={handleCloseRequestModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📝 Send Work Request</h2>
              <button className="modal-close" onClick={handleCloseRequestModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="labour-summary">
                <div className="labour-avatar-small">
                  <span>{String(selectedLabour.name || selectedLabour.fullName || 'L').charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h3>{selectedLabour.name || selectedLabour.fullName}</h3>
                  <p>📍 {selectedLabour.location} | 💼 {selectedLabour.experience} years exp</p>
                </div>
              </div>

              <form onSubmit={handleSendRequest} className="request-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Job Type *</label>
                    <select 
                      name="jobType" 
                      value={requestForm.jobType} 
                      onChange={handleRequestFormChange}
                      required
                    >
                      <option value="">Select job type</option>
                      {jobTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Crop Type *</label>
                    <select 
                      name="cropType" 
                      value={requestForm.cropType} 
                      onChange={handleRequestFormChange}
                      required
                    >
                      <option value="">Select crop</option>
                      {cropTypes.map(crop => (
                        <option key={crop} value={crop}>{crop}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Farm Size (Acres) *</label>
                    <input
                      type="number"
                      name="farmSize"
                      value={requestForm.farmSize}
                      onChange={handleRequestFormChange}
                      min="0.1"
                      step="0.1"
                      placeholder="e.g., 30"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Duration (Days) *</label>
                    <input
                      type="number"
                      name="duration"
                      value={requestForm.duration}
                      onChange={handleRequestFormChange}
                      min="1"
                      placeholder="e.g., 7"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Wage (₹/Day) *</label>
                    <input
                      type="number"
                      name="wage"
                      value={requestForm.wage}
                      onChange={handleRequestFormChange}
                      min="1"
                      placeholder="e.g., 500"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Start Date *</label>
                    <input
                      type="date"
                      name="startDate"
                      value={requestForm.startDate}
                      onChange={handleRequestFormChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Specific Requirements</label>
                  <textarea
                    name="requirements"
                    value={requestForm.requirements}
                    onChange={handleRequestFormChange}
                    rows="3"
                    placeholder="e.g., Experience with modern farming equipment, punctuality required"
                  />
                </div>

                <div className="form-group">
                  <label>Personal Message</label>
                  <textarea
                    name="message"
                    value={requestForm.message}
                    onChange={handleRequestFormChange}
                    rows="3"
                    placeholder="Add a personal message to the labour..."
                  />
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    onClick={handleCloseRequestModal}
                    className="btn-cancel"
                    disabled={sendingRequest}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-submit"
                    disabled={sendingRequest}
                  >
                    {sendingRequest ? 'Sending...' : 'Send Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default LabourRecommendation;
