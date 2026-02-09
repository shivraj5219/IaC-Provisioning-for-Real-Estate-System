import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const LabourRegister = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    village: '',
    district: '',
    state: '',
    skills: '',
    experience: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'firstName':
        if (!value.trim()) {
          error = 'First name is required';
        } else if (value.trim().length < 2) {
          error = 'First name must be at least 2 characters';
        } else if (!/^[a-zA-Z]+$/.test(value)) {
          error = 'First name can only contain letters';
        }
        break;

      case 'lastName':
        if (value && !/^[a-zA-Z]+$/.test(value)) {
          error = 'Last name can only contain letters';
        }
        break;

      case 'email':
        if (!value) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;

      case 'phone':
        if (!value) {
          error = 'Phone number is required';
        } else if (!/^[6-9]\d{9}$/.test(value)) {
          error = 'Please enter a valid 10-digit Indian mobile number';
        }
        break;

      case 'address':
        if (!value.trim()) {
          error = 'Address is required';
        } else if (value.trim().length < 10) {
          error = 'Please enter a complete address (minimum 10 characters)';
        }
        break;

      case 'village':
        if (!value.trim()) {
          error = 'Village is required';
        } else if (value.trim().length < 2) {
          error = 'Please enter a valid village name';
        }
        break;

      case 'district':
        if (!value.trim()) {
          error = 'District is required';
        } else if (value.trim().length < 2) {
          error = 'Please enter a valid district name';
        }
        break;

      case 'state':
        if (!value.trim()) {
          error = 'State is required';
        } else if (value.trim().length < 2) {
          error = 'Please enter a valid state name';
        }
        break;

      case 'experience':
        if (value && (isNaN(value) || parseInt(value) < 0)) {
          error = 'Experience must be a positive number';
        } else if (value && parseInt(value) > 50) {
          error = 'Please enter valid years of experience';
        }
        break;

      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 6) {
          error = 'Password must be at least 6 characters';
        } else if (!/(?=.*[a-z])/.test(value)) {
          error = 'Password must contain at least one lowercase letter';
        } else if (!/(?=.*[A-Z])/.test(value)) {
          error = 'Password must contain at least one uppercase letter';
        } else if (!/(?=.*\d)/.test(value)) {
          error = 'Password must contain at least one number';
        }
        break;

      case 'confirmPassword':
        if (!value) {
          error = 'Please confirm your password';
        } else if (value !== formData.password) {
          error = 'Passwords do not match';
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });

    // Real-time validation
    const error = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate all fields
    const errors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) errors[key] = error;
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please fix all errors before submitting');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Convert skills string to array
      const skillsArray = formData.skills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);

      const response = await authAPI.registerLabour({
        fullName: {
          firstName: formData.firstName,
          lastName: formData.lastName
        },
        name: `${formData.firstName} ${formData.lastName}`, // For backward compatibility
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        location: {
          village: formData.village,
          district: formData.district,
          state: formData.state
        },
        skills: skillsArray,
        experience: formData.experience,
        role: 'labour'
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        login(response.data.user, 'labour');
        navigate('/labour/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Labour Registration</h2>
        <p className="auth-subtitle">Join Krishi Sangam as a Labour</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="Enter first name"
                className={fieldErrors.firstName ? 'input-error' : ''}
              />
              {fieldErrors.firstName && <span className="error-text">{fieldErrors.firstName}</span>}
            </div>

            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                className={fieldErrors.lastName ? 'input-error' : ''}
              />
              {fieldErrors.lastName && <span className="error-text">{fieldErrors.lastName}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              className={fieldErrors.email ? 'input-error' : ''}
            />
            {fieldErrors.email && <span className="error-text">{fieldErrors.email}</span>}
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="Enter 10-digit mobile number"
              maxLength="10"
              className={fieldErrors.phone ? 'input-error' : ''}
            />
            {fieldErrors.phone && <span className="error-text">{fieldErrors.phone}</span>}
          </div>

          <div className="form-group">
            <label>Full Address *</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="Enter your complete address"
              rows="2"
              className={fieldErrors.address ? 'input-error' : ''}
            />
            {fieldErrors.address && <span className="error-text">{fieldErrors.address}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Village *</label>
              <input
                type="text"
                name="village"
                value={formData.village}
                onChange={handleChange}
                required
                placeholder="Village name"
                className={fieldErrors.village ? 'input-error' : ''}
              />
              {fieldErrors.village && <span className="error-text">{fieldErrors.village}</span>}
            </div>

            <div className="form-group">
              <label>District *</label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                required
                placeholder="District name"
                className={fieldErrors.district ? 'input-error' : ''}
              />
              {fieldErrors.district && <span className="error-text">{fieldErrors.district}</span>}
            </div>

            <div className="form-group">
              <label>State *</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                placeholder="State name"
                className={fieldErrors.state ? 'input-error' : ''}
              />
              {fieldErrors.state && <span className="error-text">{fieldErrors.state}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Skills (comma separated)</label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g., Plowing, Harvesting, Irrigation, Weeding"
            />
            <small className="form-hint">Enter skills separated by commas</small>
          </div>

          <div className="form-group">
            <label>Experience (in years)</label>
            <input
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              placeholder="Years of work experience"
              min="0"
              max="50"
              className={fieldErrors.experience ? 'input-error' : ''}
            />
            {fieldErrors.experience && <span className="error-text">{fieldErrors.experience}</span>}
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Min 6 chars, 1 uppercase, 1 number"
              minLength="6"
              className={fieldErrors.password ? 'input-error' : ''}
            />
            {fieldErrors.password && <span className="error-text">{fieldErrors.password}</span>}
          </div>

          <div className="form-group">
            <label>Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm password"
              className={fieldErrors.confirmPassword ? 'input-error' : ''}
            />
            {fieldErrors.confirmPassword && <span className="error-text">{fieldErrors.confirmPassword}</span>}
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/labour/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default LabourRegister;
