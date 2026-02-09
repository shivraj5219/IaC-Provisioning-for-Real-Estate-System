# 🌾 Krishi Sangam

**Krishi Sangam** is a comprehensive agricultural platform that connects farmers with labourers, provides intelligent crop recommendations, yield predictions, weather forecasts, and facilitates seamless job postings and work requests. Built with modern web technologies, it aims to revolutionize agricultural operations through AI-powered insights and efficient workforce management.

---

## 🚀 Features

### For Farmers
- **🌱 Crop Prediction**: AI-powered crop recommendations based on soil parameters (N, P, K, pH, rainfall, temperature, humidity)
- **📊 Yield Prediction**: Estimate crop yield based on area, season, crop type, and environmental factors
- **👷 Labour Recommendation**: Smart labour matching system with ML-based recommendations
- **💼 Job Posting**: Create and manage agricultural job listings
- **🌤️ Weather Information**: Real-time weather data and farming tips
- **📨 Work Requests**: Send direct work requests to available labourers
- **💰 Payment Integration**: Razorpay integration for secure payments

### For Labourers
- **🔍 Job Discovery**: Browse and filter available agricultural jobs
- **📋 Application Management**: Track job applications (pending, accepted, rejected)
- **💬 Work Requests**: Receive and respond to work requests from farmers
- **👤 Profile Management**: Showcase skills, experience, and availability
- **💳 Bank Details**: Secure bank account management for payments
- **📬 Notifications**: Real-time notifications for job updates and requests

### General Features
- **🔐 Secure Authentication**: JWT-based authentication for farmers and labourers
- **📱 Responsive Design**: Fully mobile-responsive interface
- **🎨 Modern UI**: Glass-morphism design with smooth animations
- **🔔 Real-time Notifications**: Stay updated with instant notifications
- **📍 Location-based Matching**: Find workers in your area

---

## 🛠️ Tech Stack

### Frontend
- **React 18+** - Modern UI library
- **Vite** - Lightning-fast build tool
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **CSS3** - Custom styling with animations

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing

### ML/AI Integration
- **Python** - Machine learning models
- **Scikit-learn** - Crop and yield prediction models
- **Pandas & NumPy** - Data processing

### Payment Integration
- **Razorpay** - Payment gateway for transactions

---

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Python 3.8+ (for ML models)
- Razorpay Account (for payment features)

### Clone Repository
```bash
git clone https://github.com/shivraj-io/Krishi-Sangam.git
cd Krishi-Sangam
```

### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
EOF

# Start backend server
npm start
# or for development
npm run dev
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
EOF

# Start frontend
npm run dev
```

### Python ML Setup
```bash
cd ai-models

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

## 🗂️ Project Structure

```
Krishi-Sangam/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── Common/      # Navbar, Footer, Loading, etc.
│   │   │   ├── Farmer/      # Farmer-specific components
│   │   │   └── Labour/      # Labour-specific components
│   │   ├── pages/           # Page components
│   │   │   ├── Auth/        # Login & Registration
│   │   │   ├── Farmer/      # Farmer dashboard & features
│   │   │   └── Labour/      # Labour dashboard & features
│   │   ├── context/         # React Context (AuthContext)
│   │   ├── routes/          # Route configurations
│   │   ├── services/        # API service layer
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── package.json
│
├── backend/                  # Express backend
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   ├── middlewares/     # Authentication, validation
│   │   ├── ml/              # Python ML integration
│   │   └── config/          # Database configuration
│   ├── server.js            # Entry point
│   └── package.json
│
├── ai-models/               # Machine learning models
│   ├── crop_recommendaton_model.ipynb
│   ├── Crop_recommendation.csv
│   ├── indian_agri_labour_full_dataset.csv
│   └── Yiel_prediction_dataset.csv
│
└── README.md
```

---

## 🔑 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/krishi-sangam
JWT_SECRET=your_super_secret_jwt_key
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

---

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register/farmer` - Register as farmer
- `POST /api/auth/register/labour` - Register as labour
- `POST /api/auth/login/farmer` - Farmer login
- `POST /api/auth/login/labour` - Labour login

### Farmer Routes
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create new job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `GET /api/jobs/:id/applications` - Get job applications

### Labour Routes
- `GET /api/jobs/all` - Browse available jobs
- `POST /api/jobs/:id/apply` - Apply for job
- `GET /api/labour/applications` - Get my applications
- `GET /api/work-requests/received` - Get work requests

### Prediction Routes
- `POST /api/predict/crop` - Get crop recommendations
- `POST /api/predict/yield` - Get yield predictions
- `POST /api/predict/labour` - Get labour recommendations

### Weather Routes
- `GET /api/weather/:city` - Get weather by city
- `GET /api/weather/coordinates` - Get weather by coordinates

---

## 🎨 Screenshots

### Landing Page
Modern landing page with smooth animations and feature showcase.

### Farmer Dashboard
Comprehensive dashboard with stats, quick actions, and job management.

### Labour Dashboard
Browse jobs, manage applications, and track work requests.

### Crop Prediction
AI-powered crop recommendations based on soil parameters.

### Labour Recommendation
Smart labour matching with ML-based scoring.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Shivraj**
- GitHub: [@shivraj-io](https://github.com/shivraj-io)

---

## 🙏 Acknowledgments

- Inspired by the need to modernize agricultural operations
- Thanks to the open-source community for amazing tools and libraries
- Special thanks to farmers and agricultural workers who provided insights

---

## 📞 Support

For support, email shivrajsinghpipawa@gmail.com or create an issue in the repository.

---

## 🚧 Roadmap

- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Weather-based crop alerts
- [ ] Marketplace for agricultural products
- [ ] Video call integration for interviews
- [ ] Contract management system
- [ ] Insurance integration

---

## ⚠️ Known Issues

- Backend server may need manual restart after route changes
- Python ML models require separate environment setup
- Payment integration requires Razorpay test/live credentials

---

## 📊 Status

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-1.0.0-orange)

---

Made with ❤️ for the farming community
