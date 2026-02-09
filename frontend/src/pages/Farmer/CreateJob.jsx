import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobAPI } from '../../services/api';
import { CROP_TYPES } from '../../utils/constants';
import Navbar from '../../components/Common/Navbar';
import './CreateJob.css';

const CreateJob = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    cropType: '',
    state: '',
    district: '',
    village: '',
    location: '',
    duration: '',
    workersNeeded: 1,
    wage: '',
    startDate: '',
    requirements: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value,
    };

    // Auto-build location string from state, district, village
    if (['state', 'district', 'village'].includes(name)) {
      const locationParts = [
        name === 'village' ? value : newFormData.village,
        name === 'district' ? value : newFormData.district,
        name === 'state' ? value : newFormData.state,
      ].filter(part => part.trim() !== '');
      
      newFormData.location = locationParts.join(', ');
    }

    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await jobAPI.createJob(formData);
      alert('Job created successfully!');
      navigate('/farmer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="create-job-container">
        <div className="create-job-card">
          <h1>Create New Job Post</h1>
          <p className="subtitle">Fill in the details to post a new job</p>

          {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="job-form">
          <div className="form-row">
            <div className="form-group">
              <label>Job Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., Workers needed for rice harvesting"
              />
            </div>

            <div className="form-group">
              <label>Job Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="">Select job type</option>
                <option value="Plowing">Plowing</option>
                <option value="Sowing">Sowing</option>
                <option value="Harvesting">Harvesting</option>
                <option value="Irrigation">Irrigation</option>
                <option value="Weeding">Weeding</option>
                <option value="General Labor">General Labor</option>
                <option value="Others">Others</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Job Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Describe the job requirements in detail..."
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Crop Type</label>
              <select
                name="cropType"
                value={formData.cropType}
                onChange={handleChange}
              >
                <option value="">Select crop type</option>
                {CROP_TYPES.map(crop => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-section-title">📍 Location Details</div>
          <div className="form-row">
            <div className="form-group">
              <label>State *</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                placeholder="Enter state"
              />
            </div>

            <div className="form-group">
              <label>District *</label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                required
                placeholder="Enter district"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City / Village</label>
              <input
                type="text"
                name="village"
                value={formData.village}
                onChange={handleChange}
                placeholder="Enter city or village (optional)"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Duration (in days) *</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
                min="1"
                placeholder="e.g., 5"
              />
            </div>

            <div className="form-group">
              <label>Workers Needed *</label>
              <input
                type="number"
                name="workersNeeded"
                value={formData.workersNeeded}
                onChange={handleChange}
                required
                min="1"
                placeholder="e.g., 10"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Daily Wage (₹) *</label>
              <input
                type="number"
                name="wage"
                value={formData.wage}
                onChange={handleChange}
                required
                min="0"
                placeholder="e.g., 500"
              />
            </div>

            <div className="form-group">
              <label>Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Additional Requirements</label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              placeholder="Any specific skills or requirements..."
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancel"
              onClick={() => navigate('/farmer/dashboard')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Job Post'}
            </button>
          </div>
        </form>
      </div>
      </div>
    </>
  );
};

export default CreateJob;
