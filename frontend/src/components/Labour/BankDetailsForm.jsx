import { useState } from 'react';
import './BankDetailsForm.css';

const BankDetailsForm = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    accountHolderName: initialData?.accountHolderName || '',
    accountNumber: initialData?.accountNumber || '',
    ifscCode: initialData?.ifscCode || '',
    bankName: initialData?.bankName || '',
    upiId: initialData?.upiId || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/payouts/bank-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Bank details saved successfully!');
        onSubmit && onSubmit(data.user);
      } else {
        setError(data.message || 'Failed to save bank details');
      }
    } catch (err) {
      console.error('Bank details error:', err);
      setError('Failed to save bank details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bank-details-form-container">
      <div className="bank-details-header">
        <h2>🏦 Bank Account Details</h2>
        <p>Add your bank account to receive payments directly</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="bank-details-form">
        <div className="form-group">
          <label htmlFor="accountHolderName">
            Account Holder Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="accountHolderName"
            name="accountHolderName"
            value={formData.accountHolderName}
            onChange={handleChange}
            placeholder="Enter account holder name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="accountNumber">
            Account Number <span className="required">*</span>
          </label>
          <input
            type="text"
            id="accountNumber"
            name="accountNumber"
            value={formData.accountNumber}
            onChange={handleChange}
            placeholder="Enter account number"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="ifscCode">
            IFSC Code <span className="required">*</span>
          </label>
          <input
            type="text"
            id="ifscCode"
            name="ifscCode"
            value={formData.ifscCode}
            onChange={handleChange}
            placeholder="Enter IFSC code (e.g., SBIN0001234)"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="bankName">
            Bank Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="bankName"
            name="bankName"
            value={formData.bankName}
            onChange={handleChange}
            placeholder="Enter bank name"
            required
          />
        </div>

        <div className="form-divider">
          <span>OR</span>
        </div>

        <div className="form-group">
          <label htmlFor="upiId">
            UPI ID (Optional)
          </label>
          <input
            type="text"
            id="upiId"
            name="upiId"
            value={formData.upiId}
            onChange={handleChange}
            placeholder="Enter UPI ID (e.g., name@upi)"
          />
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? '⏳ Saving...' : '💾 Save Bank Details'}
        </button>

        <div className="security-note">
          <span className="lock-icon">🔒</span>
          <p>Your bank details are securely encrypted and will only be used for receiving payments.</p>
        </div>
      </form>
    </div>
  );
};

export default BankDetailsForm;
