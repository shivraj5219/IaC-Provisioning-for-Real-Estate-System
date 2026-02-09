import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Common/Navbar';
import PaymentButton from '../../components/Payment/PaymentButton';
import './FarmerDashboard.css';

const FarmerDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchMyJobs();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchMyJobs();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchMyJobs = async () => {
    try {
      const response = await jobAPI.getMyJobs();
      setJobs(response.data);
    } catch (err) {
      setError('Failed to fetch jobs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await jobAPI.deleteJob(jobId);
        setJobs(jobs.filter(job => job._id !== jobId));
      } catch (err) {
        alert('Failed to delete job');
      }
    }
  };

  const handleAcceptApplication = async (jobId, labourId, labourName) => {
    if (window.confirm(`Accept application from ${labourName}?`)) {
      try {
        await jobAPI.acceptApplication(jobId, labourId);
        // Refresh jobs to show updated status
        await fetchMyJobs();
        alert('Application accepted! Labour has been assigned to the job.');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to accept application');
      }
    }
  };

  const handleRejectApplication = async (jobId, labourId, labourName) => {
    if (window.confirm(`Reject application from ${labourName}?`)) {
      try {
        await jobAPI.rejectApplication(jobId, labourId);
        // Refresh jobs to show updated list
        await fetchMyJobs();
        alert('Application rejected successfully');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to reject application');
      }
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchMyJobs();
  };

  return (
    <>
      <Navbar />
      <div className="farmer-dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Welcome, {user?.name}! </h1>
            <p>Manage your farm jobs and explore tools</p>
          </div>
          <button onClick={handleRefresh} className="refresh-button" title="Refresh jobs">
            🔄 Refresh
          </button>
        </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <h3>{jobs.length}</h3>
            <p>Total Jobs Posted</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{jobs.filter(j => j.status === 'open').length}</h3>
            <p>Active Jobs</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{jobs.reduce((acc, job) => acc + (job.applications?.length || 0), 0)}</h3>
            <p>Total Applications</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/farmer/create-job" className="action-card">
            <div className="action-icon">➕</div>
            <h3>Create New Job</h3>
            <p>Post a new job requirement</p>
          </Link>
          <Link to="/farmer/weather" className="action-card">
            <div className="action-icon">🌤️</div>
            <h3>Check Weather</h3>
            <p>View today's weather forecast</p>
          </Link>
          <Link to="/farmer/crop-prediction" className="action-card">
            <div className="action-icon">🌾</div>
            <h3>Crop Prediction</h3>
            <p>Get crop recommendations</p>
          </Link>
          <Link to="/farmer/yield-prediction" className="action-card">
            <div className="action-icon">📊</div>
            <h3>Yield Prediction</h3>
            <p>Predict crop yield</p>
          </Link>
          <Link to="/farmer/labour-recommendation" className="action-card">
            <div className="action-icon">👷</div>
            <h3>Labour Recommendation</h3>
            <p>Get labour requirements</p>
          </Link>
        </div>
      </div>

      <div className="jobs-section">
        <h2>My Posted Jobs</h2>
        {loading ? (
          <div className="loading">Loading jobs...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <p>No jobs posted yet</p>
            <Link to="/farmer/create-job" className="btn-primary">Create Your First Job</Link>
          </div>
        ) : (
          <div className="jobs-grid">
            {jobs.map((job) => (
              <div key={job._id} className="job-card">
                <div className="job-header">
                  <h3>{job.title}</h3>
                  <span className={`job-status ${job.status}`}>{job.status}</span>
                </div>
                <p className="job-description">{job.description}</p>
                <div className="job-details">
                  <div className="job-detail">
                    <strong>Type:</strong> {job.type}
                  </div>
                  <div className="job-detail">
                    <strong>Duration:</strong> {job.duration}
                  </div>
                  <div className="job-detail">
                    <strong>Workers Needed:</strong> {job.workersNeeded}
                  </div>
                  <div className="job-detail">
                    <strong>Wage:</strong> ₹{job.wage}/day
                  </div>
                  <div className="job-detail">
                    <strong>Applications:</strong> {job.applications?.length || 0}
                  </div>
                  {job.assignedTo && (
                    <div className="job-detail assigned-labour">
                      <strong>Assigned To:</strong> {job.assignedTo?.fullName?.firstName} {job.assignedTo?.fullName?.lastName}
                    </div>
                  )}
                </div>
                
                {/* Show applications if any and job not assigned yet */}
                {!job.assignedTo && job.applications && job.applications.length > 0 && (
                  <div className="applications-list">
                    <h4>Applied Labours ({job.applications.length}):</h4>
                    {job.applications.map((app, idx) => {
                      const labourName = `${app.labour?.fullName?.firstName || ''} ${app.labour?.fullName?.lastName || ''}`.trim() || 'Unknown';
                      return (
                        <div key={idx} className="applicant-card">
                          <div className="applicant-info">
                            <strong>{labourName}</strong>
                            <span>📧 {app.labour?.email || 'N/A'}</span>
                            <span>📞 {app.labour?.phone || 'N/A'}</span>
                            {app.labour?.skills && app.labour.skills.length > 0 && (
                              <span>💼 Skills: {app.labour.skills.join(', ')}</span>
                            )}
                            {app.labour?.location && (
                              <span>📍 {app.labour.location.village}, {app.labour.location.district}, {app.labour.location.state}</span>
                            )}
                          </div>
                          <div className="applicant-actions">
                            <button 
                              className="btn-accept"
                              onClick={() => handleAcceptApplication(job._id, app.labour._id, labourName)}
                            >
                              Accept
                            </button>
                            <button 
                              className="btn-reject"
                              onClick={() => handleRejectApplication(job._id, app.labour._id, labourName)}
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Show Payment Section when labour is assigned */}
                {job.assignedTo && job.paymentStatus === 'pending' && (
                  <div className="payment-section">
                    <h4>💳 Payment Required</h4>
                    <div className="payment-info">
                      <div className="payment-info-row">
                        <span className="payment-info-label">Daily Wage:</span>
                        <span className="payment-info-value">₹{job.wage}</span>
                      </div>
                      <div className="payment-info-row">
                        <span className="payment-info-label">Duration:</span>
                        <span className="payment-info-value">{job.duration} day(s)</span>
                      </div>
                      <div className="payment-info-row">
                        <span className="payment-info-label">Total Amount:</span>
                        <span className="payment-info-value">₹{job.wage * (parseInt(job.duration) || 1)}</span>
                      </div>
                    </div>
                    <PaymentButton 
                      job={job} 
                      onPaymentSuccess={fetchMyJobs}
                    />
                  </div>
                )}

                {job.paymentStatus === 'processing' && (
                  <div className="payment-pending">
                    ⏳ Payment in progress...
                  </div>
                )}

                {job.paymentStatus === 'completed' && (
                  <div className="payment-completed">
                    ✅ Payment completed on {new Date(job.paymentDetails?.paidAt).toLocaleDateString()}
                    <br />
                    <small>Amount: ₹{job.paymentDetails?.amount || job.totalAmount}</small>
                  </div>
                )}

                {job.paymentStatus === 'failed' && (
                  <div className="payment-failed">
                    ❌ Payment failed. Please try again.
                  </div>
                )}
                
                <div className="job-actions">
                  <button 
                    className="btn-delete" 
                    onClick={() => handleDeleteJob(job._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </>
  );
};

export default FarmerDashboard;
