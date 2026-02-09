import { useState, useEffect } from 'react';
import { workRequestAPI } from '../../services/api';
import Navbar from '../../components/Common/Navbar';
import './WorkRequests.css';

const WorkRequests = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responding, setResponding] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await workRequestAPI.getReceivedRequests();
      if (response.data.success) {
        setRequests(response.data.requests);
      }
    } catch (err) {
      console.error('Fetch requests error:', err);
      setError('Failed to load work requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId, status) => {
    setResponding(requestId);
    try {
      const response = await workRequestAPI.respondToRequest({
        requestId,
        status
      });

      if (response.data.success) {
        alert(`Request ${status} successfully!`);
        fetchRequests(); // Refresh the list
      }
    } catch (err) {
      console.error('Respond error:', err);
      alert(err.response?.data?.message || 'Failed to respond to request');
    } finally {
      setResponding(null);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (activeTab === 'pending') return req.status === 'pending';
    if (activeTab === 'accepted') return req.status === 'accepted';
    if (activeTab === 'rejected') return req.status === 'rejected';
    return false;
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getFarmerName = (farmer) => {
    if (!farmer) return 'Unknown Farmer';
    if (farmer.fullName) {
      return `${farmer.fullName.firstName || ''} ${farmer.fullName.lastName || ''}`.trim();
    }
    return farmer.name || 'Unknown Farmer';
  };

  return (
    <>
      <Navbar />
      <div className="work-requests-container">
        <div className="page-header">
          <h1>📬 Work Requests</h1>
          <p>Manage work requests from farmers</p>
        </div>

        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            ⏳ Pending ({requests.filter(r => r.status === 'pending').length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'accepted' ? 'active' : ''}`}
            onClick={() => setActiveTab('accepted')}
          >
            ✅ Accepted ({requests.filter(r => r.status === 'accepted').length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'rejected' ? 'active' : ''}`}
            onClick={() => setActiveTab('rejected')}
          >
            ❌ Rejected ({requests.filter(r => r.status === 'rejected').length})
          </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading requests...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
            <button onClick={fetchRequests} className="retry-btn">Retry</button>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <h3>No {activeTab} requests</h3>
            <p>
              {activeTab === 'pending' 
                ? 'You have no pending work requests at the moment'
                : activeTab === 'accepted'
                ? 'You have not accepted any requests yet'
                : 'You have not rejected any requests'}
            </p>
          </div>
        ) : (
          <div className="requests-grid">
            {filteredRequests.map((request) => (
              <div key={request._id} className="request-card">
                <div className="card-header">
                  <div className="farmer-info">
                    <div className="farmer-avatar">
                      <span>{getFarmerName(request.farmer).charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <h3>{getFarmerName(request.farmer)}</h3>
                      <p className="request-date">
                        📅 Requested on {formatDate(request.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span className={`status-badge ${request.status}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>

                <div className="request-details">
                  <div className="detail-row">
                    <div className="detail-item">
                      <span className="detail-icon">🌾</span>
                      <div>
                        <strong>Job Type</strong>
                        <p>{request.jobType || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">🌱</span>
                      <div>
                        <strong>Crop</strong>
                        <p>{request.cropType || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="detail-row">
                    <div className="detail-item">
                      <span className="detail-icon">📏</span>
                      <div>
                        <strong>Farm Size</strong>
                        <p>{request.farmSize ? `${request.farmSize} acres` : 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">⏱️</span>
                      <div>
                        <strong>Duration</strong>
                        <p>{request.duration ? `${request.duration} days` : 'Not specified'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="detail-row">
                    <div className="detail-item">
                      <span className="detail-icon">💰</span>
                      <div>
                        <strong>Wage</strong>
                        <p>₹{request.wage ? `${request.wage}/day` : 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">📅</span>
                      <div>
                        <strong>Start Date</strong>
                        <p>{request.startDate ? formatDate(request.startDate) : 'Not specified'}</p>
                      </div>
                    </div>
                  </div>

                  {request.location && (
                    <div className="detail-full">
                      <span className="detail-icon">📍</span>
                      <div>
                        <strong>Location</strong>
                        <p>
                          {request.location.village && `${request.location.village}, `}
                          {request.location.district && `${request.location.district}, `}
                          {request.location.state}
                        </p>
                      </div>
                    </div>
                  )}

                  {request.requirements && (
                    <div className="detail-full">
                      <span className="detail-icon">📋</span>
                      <div>
                        <strong>Requirements</strong>
                        <p>{request.requirements}</p>
                      </div>
                    </div>
                  )}

                  {request.message && (
                    <div className="detail-full message-box">
                      <span className="detail-icon">💬</span>
                      <div>
                        <strong>Message from Farmer</strong>
                        <p>{request.message}</p>
                      </div>
                    </div>
                  )}

                  {request.farmer?.phone && activeTab === 'accepted' && (
                    <div className="contact-info">
                      <span className="detail-icon">📱</span>
                      <div>
                        <strong>Farmer Contact</strong>
                        <p>
                          {request.farmer.phone}
                          {request.farmer.email && ` • ${request.farmer.email}`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {activeTab === 'pending' && (
                  <div className="request-actions">
                    <button
                      className="btn-reject"
                      onClick={() => handleRespond(request._id, 'rejected')}
                      disabled={responding === request._id}
                    >
                      {responding === request._id ? 'Processing...' : 'Reject'}
                    </button>
                    <button
                      className="btn-accept"
                      onClick={() => handleRespond(request._id, 'accepted')}
                      disabled={responding === request._id}
                    >
                      {responding === request._id ? 'Processing...' : 'Accept'}
                    </button>
                  </div>
                )}

                {activeTab === 'accepted' && request.respondedAt && (
                  <div className="accepted-info">
                    ✅ Accepted on {formatDate(request.respondedAt)}
                  </div>
                )}

                {activeTab === 'rejected' && request.respondedAt && (
                  <div className="rejected-info">
                    ❌ Rejected on {formatDate(request.respondedAt)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default WorkRequests;
