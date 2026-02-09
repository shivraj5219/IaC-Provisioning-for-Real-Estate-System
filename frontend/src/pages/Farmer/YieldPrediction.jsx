import { useState } from 'react';
import Navbar from '../../components/Common/Navbar';
import './YieldPrediction.css';

const YieldPrediction = () => {
  const [formData, setFormData] = useState({
    State: '',
    Year: new Date().getFullYear(),
    Season: '',
    Crop: '',
    Area: '',
    Rainfall: '',
    Temperature: '',
    Fertilizer: '',
    Pesticide: '',
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const states = ['Punjab', 'Haryana', 'UP', 'MP', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'AP', 'Gujarat', 'Rajasthan'];
  const cropTypes = ['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize', 'Soybean'];
  const seasons = ['Kharif', 'Rabi', 'Zaid'];
  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 10}, (_, i) => currentYear - i);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare request data matching backend expectations
      const requestData = {
        State: formData.State,
        Year: parseInt(formData.Year),
        Season: formData.Season,
        Crop: formData.Crop,
        Area: parseFloat(formData.Area),
        Rainfall: parseFloat(formData.Rainfall),
        Temperature: parseFloat(formData.Temperature),
        Fertilizer: parseFloat(formData.Fertilizer),
        Pesticide: parseFloat(formData.Pesticide),
      };

      const response = await fetch('http://localhost:5000/api/yield/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();
      
      if (response.ok) {
        setPrediction(data);
      } else {
        alert(data.message || 'Failed to get prediction');
      }
    } catch (error) {
      console.error('Yield Prediction Error:', error);
      alert('Failed to get prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      State: '',
      Year: new Date().getFullYear(),
      Season: '',
      Crop: '',
      Area: '',
      Rainfall: '',
      Temperature: '',
      Fertilizer: '',
      Pesticide: '',
    });
    setPrediction(null);
  };

  return (
    <>
      <Navbar />
      <div className="yield-prediction-container">
        <div className="prediction-header">
          <h1>📊 Yield Prediction</h1>
          <p>Estimate your crop yield based on various agricultural parameters</p>
      </div>

      <div className="prediction-content">
        <div className="prediction-form-section">
          <h2>Enter Crop Details</h2>
          <form onSubmit={handleSubmit} className="prediction-form">
            <div className="form-row">
              <div className="form-group">
                <label>State *</label>
                <select name="State" value={formData.State} onChange={handleChange} required>
                  <option value="">Select state</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Year *</label>
                <select name="Year" value={formData.Year} onChange={handleChange} required>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Season *</label>
                <select name="Season" value={formData.Season} onChange={handleChange} required>
                  <option value="">Select season</option>
                  {seasons.map(season => (
                    <option key={season} value={season}>{season}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Crop Type *</label>
                <select name="Crop" value={formData.Crop} onChange={handleChange} required>
                  <option value="">Select crop</option>
                  {cropTypes.map(crop => (
                    <option key={crop} value={crop}>{crop}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Area (in hectares) *</label>
                <input
                  type="number"
                  name="Area"
                  value={formData.Area}
                  onChange={handleChange}
                  required
                  min="100"
                  step="0.1"
                  placeholder="e.g., 1000"
                />
              </div>

              <div className="form-group">
                <label>Rainfall (mm) *</label>
                <input
                  type="number"
                  name="Rainfall"
                  value={formData.Rainfall}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.1"
                  placeholder="e.g., 800"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Temperature (°C) *</label>
                <input
                  type="number"
                  name="Temperature"
                  value={formData.Temperature}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.1"
                  placeholder="e.g., 28"
                />
              </div>

              <div className="form-group">
                <label>Fertilizer Usage (kg/ha) *</label>
                <input
                  type="number"
                  name="Fertilizer"
                  value={formData.Fertilizer}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.1"
                  placeholder="e.g., 150"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Pesticide Usage (kg/ha) *</label>
                <input
                  type="number"
                  name="Pesticide"
                  value={formData.Pesticide}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.1"
                  placeholder="e.g., 3"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={handleReset} className="btn-reset">
                Reset
              </button>
              <button type="submit" className="btn-predict" disabled={loading}>
                {loading ? 'Predicting...' : 'Predict Yield'}
              </button>
            </div>
          </form>
        </div>

        {prediction && prediction.predicted_production && (
          <div className="prediction-result">
            <h2>Yield Prediction Results</h2>
            
            <div className="result-card">
              <div className="result-main">
                <div className="result-icon">🌾</div>
                <div className="result-value">
                  <h3>{(prediction.predicted_production / formData.Area).toFixed(2)} tons/hectare</h3>
                  <p>Estimated Yield per Hectare</p>
                </div>
              </div>
            </div>

            <div className="total-production">
              <h3>Total Expected Production</h3>
              <p className="production-value">
                {prediction.predicted_production.toFixed(2)} tons
              </p>
              <p className="production-note">Based on {formData.Area} hectares</p>
            </div>

            <div className="input-summary">
              <h3>📋 Input Summary</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="label">State:</span>
                  <span className="value">{prediction.input?.State}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Year:</span>
                  <span className="value">{prediction.input?.Year}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Season:</span>
                  <span className="value">{prediction.input?.Season}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Crop:</span>
                  <span className="value">{prediction.input?.Crop}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Rainfall:</span>
                  <span className="value">{prediction.input?.Rainfall} mm</span>
                </div>
                <div className="summary-item">
                  <span className="label">Temperature:</span>
                  <span className="value">{prediction.input?.Temperature} °C</span>
                </div>
              </div>
            </div>

            <div className="recommendations">
              <h3>💡 Farming Tips</h3>
              <ul>
                <li>Ensure proper irrigation during critical growth stages</li>
                <li>Apply recommended fertilizers at the right time</li>
                <li>Monitor for pest infestations regularly</li>
                <li>Maintain optimal soil moisture levels</li>
                <li>Consider weather forecasts for planning activities</li>
              </ul>
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
};

export default YieldPrediction;
