import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>🌾 Krishi Sangam</h3>
          <p>Connecting Farmers and Labourers for a Better Future</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">About Us</a></li>
            <li><a href="/">Contact</a></li>
            <li><a href="/">Privacy Policy</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Contact</h4>
          <p>📧 shivrajsinghpipawad@gmail.com</p>
          <p>📱 +91 7974703801</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 Krishi Sangam. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
