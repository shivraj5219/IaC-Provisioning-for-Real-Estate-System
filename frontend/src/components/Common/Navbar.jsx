import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import './Navbar.css';

const Navbar = () => {
  const { user, userType, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <div className="logo-container">
            <img src="/logo.png" alt="Krishi Sangam Logo" className="logo-icon" />
            <span className="logo-text">Krishi Sangam</span>
          </div>
        </Link>

        <ul className="navbar-menu">
          {!isAuthenticated ? (
            <>
              <li className="navbar-item">
                <Link to="/" className="navbar-link">Home</Link>
              </li>
              <li className="navbar-item dropdown">
                <span className="navbar-link">Farmer</span>
                <div className="dropdown-content">
                  <Link to="/farmer/register">Register</Link>
                  <Link to="/farmer/login">Login</Link>
                </div>
              </li>
              <li className="navbar-item dropdown">
                <span className="navbar-link">Labour</span>
                <div className="dropdown-content">
                  <Link to="/labour/register">Register</Link>
                  <Link to="/labour/login">Login</Link>
                </div>
              </li>
            </>
          ) : userType === 'farmer' ? (
            <>
              <li className="navbar-item">
                <Link to="/farmer/dashboard" className="navbar-link">Dashboard</Link>
              </li>
              <li className="navbar-item">
                <Link to="/farmer/create-job" className="navbar-link">Create Job</Link>
              </li>
              <li className="navbar-item dropdown">
                <span className="navbar-link">Features</span>
                <div className="dropdown-content">
                  <Link to="/farmer/weather">🌤️ Today's Weather</Link>
                  <Link to="/farmer/crop-prediction">🌾 Crop Prediction</Link>
                  <Link to="/farmer/yield-prediction">📊 Yield Prediction</Link>
                  <Link to="/farmer/labour-recommendation">🤖 Smart Labour</Link>
                  <Link to="/farmer/gov-schemes">🏛️ Govt Schemes</Link>
                </div>
              </li>
              <li className="navbar-item">
                <NotificationDropdown />
              </li>
              <li className="navbar-item">
                <span className="navbar-link user-profile">
                  <span className="user-avatar">👤</span>
                  <span className="user-name">{user?.name}</span>
                </span>
              </li>
              <li className="navbar-item">
                <button onClick={handleLogout} className="navbar-link logout-btn">Logout</button>
              </li>
            </>
          ) : (
            <>
              <li className="navbar-item">
                <Link to="/labour/dashboard" className="navbar-link">Dashboard</Link>
              </li>
              <li className="navbar-item">
                <Link to="/labour/jobs" className="navbar-link">All Jobs</Link>
              </li>
              <li className="navbar-item">
                <Link to="/labour/my-applications" className="navbar-link">My Applications</Link>
              </li>
              <li className="navbar-item">
                <Link to="/labour/work-requests" className="navbar-link">Work Requests</Link>
              </li>
              <li className="navbar-item">
                <NotificationDropdown />
              </li>
              <li className="navbar-item">
                <Link to="/labour/profile" className="navbar-link user-profile">
                  <span className="user-avatar">👤</span>
                  <span className="user-name">{user?.name}</span>
                </Link>
              </li>
              <li className="navbar-item">
                <button onClick={handleLogout} className="navbar-link logout-btn">Logout</button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
