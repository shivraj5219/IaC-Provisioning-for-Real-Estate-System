import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Common/Navbar';
import './LabourDashboard.css';

const LabourDashboard = () => {
  const [stats, setStats] = useState({
    totalApplications: 0,
    pending: 0,
    accepted: 0,
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [applicationsRes, jobsRes] = await Promise.all([
        jobAPI.getMyApplications(),
        jobAPI.getAllJobs(),
      ]);

      const applications = applicationsRes.data;
      setStats({
        totalApplications: applications.length,
        pending: applications.filter(app => app.status === 'pending').length,
        accepted: applications.filter(app => app.status === 'accepted').length,
      });

      setRecentJobs(jobsRes.data.slice(0, 6));
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="labour-dashboard">
        <div className="dashboard-header">
          <h1>Welcome, {user?.name}!</h1>
          <p>Find and apply for agricultural jobs</p>
        </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <h3>{stats.totalApplications}</h3>
            <p>Total Applications</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{stats.accepted}</h3>
            <p>Accepted</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/labour/jobs" className="action-card">
            <div className="action-icon">🔍</div>
            <h3>Browse All Jobs</h3>
            <p>Find available job opportunities</p>
          </Link>
          <Link to="/labour/my-applications" className="action-card">
            <div className="action-icon">📋</div>
            <h3>My Applications</h3>
            <p>Track your job applications</p>
          </Link>
          <Link to="/labour/work-requests" className="action-card">
            <div className="action-icon">📬</div>
            <h3>Work Requests</h3>
            <p>View and manage work requests</p>
          </Link>
        </div>
      </div>

      <div className="recent-jobs-section">
        <div className="section-header">
          <h2>Recent Job Postings</h2>
          <Link to="/labour/jobs" className="view-all-link">View All →</Link>
        </div>

        {loading ? (
          <div className="loading">Loading jobs...</div>
        ) : recentJobs.length === 0 ? (
          <div className="empty-state">
            <p>No jobs available at the moment</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {recentJobs.map((job) => (
              <div key={job._id} className="job-card">
                <div className="job-header">
                  <h3>{job.title}</h3>
                  <span className="job-type">{job.type}</span>
                </div>
                <p className="job-description">{job.description}</p>
                <div className="job-details">
                  <div className="detail-item">
                    <span className="detail-icon">📍</span>
                    <span>
                      {typeof job.location === 'object' 
                        ? `${job.location.village}, ${job.location.district}`
                        : job.location}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">⏰</span>
                    <span>{job.duration} days</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">💰</span>
                    <span>₹{job.wage}/day</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">👥</span>
                    <span>{job.workersNeeded} workers needed</span>
                  </div>
                </div>
                <Link to={`/labour/jobs`} className="apply-btn">
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </>
  );
};

export default LabourDashboard;
