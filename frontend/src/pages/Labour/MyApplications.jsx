import { useState, useEffect } from 'react';
import { jobAPI, workRequestAPI } from '../../services/api';
import Navbar from '../../components/Common/Navbar';
import './MyApplications.css';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [workRequests, setWorkRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAllData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAllData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      const [applicationsRes, workRequestsRes] = await Promise.all([
        jobAPI.getMyApplications(),
        workRequestAPI.getReceivedRequests()
      ]);
      
      console.log('📦 Applications Data:', applicationsRes.data);
      console.log('📬 Work Requests Data:', workRequestsRes.data);
      
      applicationsRes.data.forEach((app, index) => {
        console.log(`Application ${index + 1}:`, {
          status: app.status,
          paymentStatus: app.paymentStatus,
          payoutStatus: app.payoutStatus,
          payoutUtr: app.payoutUtr,
          totalAmount: app.totalAmount
        });
      });
      
      setApplications(applicationsRes.data);
      setWorkRequests(workRequestsRes.data?.requests || []);
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('❌ Fetch Data Error:', err);
      
      if (err.response?.status === 403) {
        setError('Access Denied: ' + (err.response?.data?.message || 'You must be logged in as a Labour user to view applications. Please log out and log in with your Labour account.'));
      } else if (err.response?.status === 401) {
        setError('Session Expired: Please log in again');
      } else {
        setError('Failed to fetch applications. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchAllData();
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const filteredWorkRequests = workRequests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'accepted':
        return 'status-accepted';
      case 'rejected':
        return 'status-rejected';
      case 'pending':
      default:
        return 'status-pending';
    }
  };

  const stats = {
    total: applications.length + workRequests.length,
    pending: applications.filter(app => app.status === 'pending').length + 
             workRequests.filter(req => req.status === 'pending').length,
    accepted: applications.filter(app => app.status === 'accepted').length + 
              workRequests.filter(req => req.status === 'accepted').length,
    rejected: applications.filter(app => app.status === 'rejected').length + 
              workRequests.filter(req => req.status === 'rejected').length,
  };

  return (
    <>
      <Navbar />
      <div className="my-applications-container">
        <div className="applications-header">
          <div>
            <h1>My Job Applications</h1>
            <p>Track the status of your job applications</p>
          </div>
          <button onClick={handleRefresh} className="refresh-button" title="Refresh applications">
            🔄 Refresh
          </button>
        </div>

      <div className="application-stats">
        <div className="stat-box" onClick={() => setFilter('all')}>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-box pending" onClick={() => setFilter('pending')}>
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-box accepted" onClick={() => setFilter('accepted')}>
          <div className="stat-value">{stats.accepted}</div>
          <div className="stat-label">Accepted</div>
        </div>
        <div className="stat-box rejected" onClick={() => setFilter('rejected')}>
          <div className="stat-value">{stats.rejected}</div>
          <div className="stat-label">Rejected</div>
        </div>
      </div>

      <div className="filter-tabs">
        <button
          className={`tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({stats.total})
        </button>
        <button
          className={`tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({stats.pending})
        </button>
        <button
          className={`tab ${filter === 'accepted' ? 'active' : ''}`}
          onClick={() => setFilter('accepted')}
        >
          Accepted ({stats.accepted})
        </button>
        <button
          className={`tab ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Rejected ({stats.rejected})
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading applications...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (filteredApplications.length === 0 && filteredWorkRequests.length === 0) ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No applications found</h3>
          <p>{filter === 'all' 
            ? 'You haven\'t applied for any jobs yet' 
            : `You have no ${filter} applications`}
          </p>
        </div>
      ) : (
        <div className="applications-list">
          {/* Work Requests Section */}
          {filteredWorkRequests.length > 0 && (
            <>
              <div className="section-divider">
                <h2>📬 Work Requests from Farmers</h2>
              </div>
              {filteredWorkRequests.map((request) => (
                <div key={`request-${request._id}`} className="application-card work-request-card">
                  <div className="card-badge">Work Request</div>
                  <div className="application-header">
                    <div className="application-title">
                      <h3>{request.jobType || 'Work Request'} - {request.cropType || 'Farming'}</h3>
                      <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                        {request.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="application-date">
                      Received on: {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="farmer-info-section">
                    <span className="info-icon">👨‍🌾</span>
                    <span><strong>From:</strong> {request.farmer?.fullName 
                      ? `${request.farmer.fullName.firstName} ${request.farmer.fullName.lastName || ''}`.trim()
                      : 'Farmer'}</span>
                  </div>

                  {request.message && (
                    <p className="request-message">
                      <span className="message-icon">💬</span>
                      {request.message}
                    </p>
                  )}

                  <div className="application-details">
                    <div className="detail-row">
                      <div className="detail-item">
                        <span className="detail-icon">📍</span>
                        <span><strong>Location:</strong> {
                          request.location 
                            ? `${request.location.village || ''}, ${request.location.district || ''}, ${request.location.state || ''}`.replace(/, ,/g, ',').trim()
                            : 'Not specified'
                        }</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-icon">💰</span>
                        <span><strong>Wage:</strong> ₹{request.wage || 0}/day</span>
                      </div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-item">
                        <span className="detail-icon">⏰</span>
                        <span><strong>Duration:</strong> {request.duration || 0} days</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-icon">📅</span>
                        <span><strong>Start Date:</strong> {request.startDate ? new Date(request.startDate).toLocaleDateString() : 'TBD'}</span>
                      </div>
                    </div>
                    {request.farmSize && (
                      <div className="detail-row">
                        <div className="detail-item">
                          <span className="detail-icon">📏</span>
                          <span><strong>Farm Size:</strong> {request.farmSize} acres</span>
                        </div>
                        {request.requirements && (
                          <div className="detail-item">
                            <span className="detail-icon">📋</span>
                            <span><strong>Requirements:</strong> {request.requirements}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {request.status === 'accepted' && (
                    <div className="acceptance-message">
                      ✅ You accepted this work request on {new Date(request.respondedAt).toLocaleDateString()}
                      {request.farmer?.phone && (
                        <div className="contact-info-box">
                          <strong>📱 Contact Farmer:</strong> {request.farmer.phone}
                          {request.farmer.email && ` • ${request.farmer.email}`}
                        </div>
                      )}
                    </div>
                  )}

                  {request.status === 'rejected' && (
                    <div className="rejection-message">
                      ❌ You rejected this work request on {new Date(request.respondedAt).toLocaleDateString()}
                    </div>
                  )}

                  {request.status === 'pending' && (
                    <div className="pending-message">
                      ⏳ This request is pending. Go to <a href="/labour/work-requests">Work Requests</a> to respond.
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {/* Job Applications Section */}
          {filteredApplications.length > 0 && (
            <>
              {filteredWorkRequests.length > 0 && (
                <div className="section-divider">
                  <h2>📋 Job Applications</h2>
                </div>
              )}
              {filteredApplications.map((application) => (
            <div key={`app-${application._id}`} className="application-card">
              <div className="application-header">
                <div className="application-title">
                  <h3>{application.job?.title || 'Job Title'}</h3>
                  <span className={`status-badge ${getStatusBadgeClass(application.status)}`}>
                    {application.status.toUpperCase()}
                  </span>
                </div>
                <div className="application-date">
                  Applied on: {new Date(application.appliedAt).toLocaleDateString()}
                </div>
              </div>

              <p className="application-description">
                {application.job?.description || 'No description available'}
              </p>

              <div className="application-details">
                <div className="detail-row">
                  <div className="detail-item">
                    <span className="detail-icon">📍</span>
                    <span><strong>Location:</strong> {
                      typeof application.job?.location === 'object' 
                        ? `${application.job.location.village}, ${application.job.location.district}`
                        : application.job?.location
                    }</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">💰</span>
                    <span><strong>Wage:</strong> ₹{application.job?.wage}/day</span>
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-item">
                    <span className="detail-icon">⏰</span>
                    <span><strong>Duration:</strong> {application.job?.duration} days</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">📅</span>
                    <span><strong>Start Date:</strong> {new Date(application.job?.startDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {application.status === 'accepted' && (
                <>
                  <div className="acceptance-message">
                    🎉 Congratulations! Your application has been accepted. 
                    The farmer will contact you soon.
                  </div>
                  
                  {/* Debug Info - Remove this after testing */}
                  <div style={{ 
                    background: '#f0f0f0', 
                    padding: '10px', 
                    marginTop: '10px', 
                    borderRadius: '5px',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                  }}>
                    <strong>🔍 Debug Info:</strong><br/>
                    Payment Status: {application.paymentStatus || 'null'}<br/>
                    Payout Status: {application.payoutStatus || 'null'}<br/>
                    Total Amount: {application.totalAmount || 'null'}<br/>
                    UTR: {application.payoutUtr || 'null'}
                  </div>
                  
                  {/* Money in Account Banner - Shown when money is received */}
                  {application.payoutStatus === 'processed' && application.totalAmount && (
                    <div className="money-received-banner">
                      <div className="money-icon">💰</div>
                      <div className="money-details">
                        <h3>Money Received in Your Account!</h3>
                        <p className="money-amount">₹{application.totalAmount.toLocaleString('en-IN')}</p>
                        {application.payoutUtr && (
                          <p className="utr-info">
                            <strong>Bank UTR:</strong> {application.payoutUtr}
                          </p>
                        )}
                        <p className="success-message">✅ Amount successfully transferred to your bank account</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Payment Status Section */}
                  {application.paymentStatus && (
                    <div className={`payment-status-section ${application.paymentStatus}`}>
                      <div className="payment-header">
                        <span className="payment-icon">
                          {application.paymentStatus === 'completed' ? '✅' : 
                           application.paymentStatus === 'processing' ? '⏳' : 
                           application.paymentStatus === 'failed' ? '❌' : '⏰'}
                        </span>
                        <span className="payment-title">Payment Details</span>
                      </div>
                      <div className="payment-info">
                        <div className="payment-row">
                          <span className="payment-label">Payment Status:</span>
                          <span className={`payment-value status-${application.paymentStatus}`}>
                            {application.paymentStatus === 'pending' && '⏰ Awaiting Payment'}
                            {application.paymentStatus === 'processing' && '⏳ Processing Payment'}
                            {application.paymentStatus === 'completed' && '✅ Payment Completed'}
                            {application.paymentStatus === 'failed' && '❌ Payment Failed'}
                            {application.paymentStatus === 'refunded' && '🔄 Payment Refunded'}
                          </span>
                        </div>
                        {application.totalAmount && (
                          <div className="payment-row">
                            <span className="payment-label">Job Amount:</span>
                            <span className="payment-value amount">₹{application.totalAmount.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        {application.paymentStatus === 'completed' && application.job?.paymentDetails?.paidAt && (
                          <div className="payment-row">
                            <span className="payment-label">Paid on:</span>
                            <span className="payment-value">
                              {new Date(application.job.paymentDetails.paidAt).toLocaleString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        )}
                        {application.payoutStatus && (
                          <>
                            <div className="payment-row payout-status">
                              <span className="payment-label">Transfer Status:</span>
                              <span className={`payment-value status-${application.payoutStatus}`}>
                                {application.payoutStatus === 'processed' && '✅ Money in Account'}
                                {application.payoutStatus === 'processing' && '⏳ Transfer in Progress'}
                                {application.payoutStatus === 'pending' && '⏰ Transfer Pending'}
                                {application.payoutStatus === 'queued' && '📋 Transfer Queued'}
                                {application.payoutStatus === 'reversed' && '🔄 Transfer Reversed'}
                                {application.payoutStatus === 'cancelled' && '❌ Transfer Cancelled'}
                              </span>
                            </div>
                            {application.payoutStatus === 'processed' && application.payoutUtr && (
                              <div className="payment-row">
                                <span className="payment-label">UTR Number:</span>
                                <span className="payment-value utr">{application.payoutUtr}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {application.status === 'rejected' && (
                <div className="rejection-message">
                  Sorry, your application was not successful this time. 
                  Keep looking for other opportunities!
                </div>
              )}
            </div>
          ))}
            </>
          )}
        </div>
      )}
      </div>
    </>
  );
};

export default MyApplications;
