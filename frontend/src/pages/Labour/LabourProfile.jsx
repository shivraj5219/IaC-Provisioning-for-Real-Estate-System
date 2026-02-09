import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Common/Navbar';
import BankDetailsForm from '../../components/Labour/BankDetailsForm';
import './LabourProfile.css';

const LabourProfile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBankDetailsSubmit = (updatedUser) => {
    setProfileData(prev => ({
      ...prev,
      bankDetails: updatedUser.bankDetails
    }));
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="profile-loading">Loading profile...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="labour-profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            {(profileData?.fullName?.firstName?.charAt(0) || user?.fullName?.firstName?.charAt(0) || user?.name?.charAt(0) || 'L').toUpperCase()}
          </div>
          <div className="profile-info">
            <h1>
              {profileData?.fullName?.firstName || user?.fullName?.firstName || user?.name || 'User'}{' '}
              {profileData?.fullName?.lastName || user?.fullName?.lastName || ''}
            </h1>
            <p className="profile-role">👷 Labour</p>
            <p className="profile-email">📧 {profileData?.email || user?.email}</p>
            <p className="profile-phone">📱 {profileData?.phone || user?.phone}</p>
          </div>
        </div>

        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            👤 Personal Info
          </button>
          <button
            className={`tab-button ${activeTab === 'bank' ? 'active' : ''}`}
            onClick={() => setActiveTab('bank')}
          >
            🏦 Bank Details
          </button>
          <button
            className={`tab-button ${activeTab === 'skills' ? 'active' : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            🛠️ Skills
          </button>
        </div>

        <div className="profile-content">
          {activeTab === 'personal' && (
            <div className="personal-info-section">
              <h2>Personal Information</h2>
              <div className="info-grid">
                <div className="info-item">
                  <label>Full Name</label>
                  <p>
                    {profileData?.fullName?.firstName || user?.fullName?.firstName || user?.name || 'Not provided'}{' '}
                    {profileData?.fullName?.lastName || user?.fullName?.lastName || ''}
                  </p>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <p>{profileData?.email || user?.email}</p>
                </div>
                <div className="info-item">
                  <label>Phone</label>
                  <p>{profileData?.phone || user?.phone}</p>
                </div>
                <div className="info-item">
                  <label>Location</label>
                  <p>
                    {(profileData?.location || user?.location)?.village && `${(profileData?.location || user?.location).village}, `}
                    {(profileData?.location || user?.location)?.district && `${(profileData?.location || user?.location).district}, `}
                    {(profileData?.location || user?.location)?.state || 'Not specified'}
                  </p>
                </div>
                {(profileData?.address || user?.address) && (
                  <div className="info-item full-width">
                    <label>Address</label>
                    <p>{profileData?.address || user?.address}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'bank' && (
            <div className="bank-details-section">
              {profileData?.bankDetails?.accountNumber ? (
                <div className="existing-bank-details">
                  <div className="bank-details-header">
                    <h2>🏦 Saved Bank Account</h2>
                    {profileData.bankDetails.verified && (
                      <span className="verified-badge">✅ Verified</span>
                    )}
                  </div>
                  
                  <div className="bank-info-grid">
                    <div className="bank-info-item">
                      <label>Account Holder Name</label>
                      <p>{profileData.bankDetails.accountHolderName}</p>
                    </div>
                    <div className="bank-info-item">
                      <label>Account Number</label>
                      <p className="account-number">
                        ••••••{profileData.bankDetails.accountNumber.slice(-4)}
                      </p>
                    </div>
                    <div className="bank-info-item">
                      <label>IFSC Code</label>
                      <p>{profileData.bankDetails.ifscCode}</p>
                    </div>
                    <div className="bank-info-item">
                      <label>Bank Name</label>
                      <p>{profileData.bankDetails.bankName}</p>
                    </div>
                    {profileData.bankDetails.upiId && (
                      <div className="bank-info-item">
                        <label>UPI ID</label>
                        <p>{profileData.bankDetails.upiId}</p>
                      </div>
                    )}
                  </div>

                  <button 
                    className="update-button"
                    onClick={() => setProfileData(prev => ({ ...prev, bankDetails: null }))}
                  >
                    ✏️ Update Bank Details
                  </button>
                </div>
              ) : (
                <BankDetailsForm 
                  onSubmit={handleBankDetailsSubmit}
                  initialData={profileData?.bankDetails}
                />
              )}
              
              <div className="bank-info-note">
                <h3>💡 Why add bank details?</h3>
                <ul>
                  <li>✅ Receive payments directly to your bank account</li>
                  <li>✅ Money transferred automatically after farmer pays</li>
                  <li>✅ Instant IMPS transfers (within 5-10 minutes)</li>
                  <li>✅ Secure & encrypted information</li>
                  <li>✅ Get SMS notification when money is credited</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="skills-section">
              <h2>Skills & Expertise</h2>
              <div className="skills-list">
                {(profileData?.skills || user?.skills) && (profileData?.skills || user?.skills).length > 0 ? (
                  (profileData?.skills || user?.skills).map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="no-skills">No skills added yet</p>
                )}
              </div>
              <button className="add-skill-button">+ Add Skills</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LabourProfile;
