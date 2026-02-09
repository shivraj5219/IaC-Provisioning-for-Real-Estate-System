# 🌾 Krishi Sangam Frontend

A comprehensive React.js application connecting farmers with agricultural labourers, featuring job postings, weather forecasts, and crop prediction tools.

## ✨ Features

### For Farmers 👨‍🌾
- **User Registration & Login**: Secure authentication system
- **Job Management**: Create, view, and manage job postings
- **Weather Forecast**: Real-time weather information for farm planning
- **Crop Prediction**: AI-powered crop recommendations based on soil and environmental parameters
- **Dashboard**: Overview of posted jobs and applications

### For Labourers 👷
- **User Registration & Login**: Separate authentication for labourers
- **Job Browsing**: View all available agricultural jobs
- **Job Application**: Apply for suitable positions
- **Application Tracking**: Monitor status of submitted applications
- **Dashboard**: Personal statistics and recent job listings

## 📁 Project Structure

```
frontend/
├── public/                    # Static assets
├── src/
│   ├── assets/               # Images, icons, etc.
│   ├── components/           # Reusable components
│   │   ├── Common/          # Shared components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── Farmer/          # Farmer-specific components
│   │   └── Labour/          # Labour-specific components
│   ├── context/             # React Context
│   │   └── AuthContext.jsx # Authentication context
│   ├── pages/               # Page components
│   │   ├── Auth/           # Authentication pages
│   │   │   ├── FarmerRegister.jsx
│   │   │   ├── FarmerLogin.jsx
│   │   │   ├── LabourRegister.jsx
│   │   │   └── LabourLogin.jsx
│   │   ├── Farmer/         # Farmer pages
│   │   │   ├── FarmerDashboard.jsx
│   │   │   ├── CreateJob.jsx
│   │   │   ├── Weather.jsx
│   │   │   └── CropPrediction.jsx
│   │   ├── Labour/         # Labour pages
│   │   │   ├── LabourDashboard.jsx
│   │   │   ├── AllJobs.jsx
│   │   │   └── MyApplications.jsx
│   │   └── Home.jsx        # Landing page
│   ├── services/           # API services
│   │   └── api.js         # Axios configuration & API calls
│   ├── utils/             # Utility functions
│   │   └── constants.js   # App constants
│   ├── App.jsx            # Main App component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── .env.example           # Environment variables template
├── package.json
└── vite.config.js
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Krishi Sangam/frontend"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   
   Update the values in `.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_WEATHER_API_KEY=your_openweathermap_api_key
   ```
   
   Get your free Weather API key from: https://openweathermap.org/api

4. **Run the development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Tech Stack

- **React 19** - UI library
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **Vite** - Build tool
- **CSS3** - Styling

## 🌐 API Integration

The application integrates with:
- **Backend API**: For user authentication, job management
- **OpenWeather API**: For real-time weather data
- **Crop Prediction API**: For AI-powered crop recommendations

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile devices

## 🔐 Authentication Flow

1. Users register as either Farmer or Labour
2. Credentials stored securely with JWT tokens
3. Protected routes ensure proper access control
4. Persistent login with localStorage

## 🎯 Key Pages

### Public Pages
- **Home** (`/`) - Landing page with features overview
- **Registration/Login** - Separate auth flows for farmers and labourers

### Farmer Pages (Protected)
- **Dashboard** (`/farmer/dashboard`) - Job overview and statistics
- **Create Job** (`/farmer/create-job`) - Post new job requirements
- **Weather** (`/farmer/weather`) - Real-time weather information
- **Crop Prediction** (`/farmer/crop-prediction`) - AI crop recommendations

### Labour Pages (Protected)
- **Dashboard** (`/labour/dashboard`) - Application statistics and recent jobs
- **All Jobs** (`/labour/jobs`) - Browse and apply for jobs
- **My Applications** (`/labour/my-applications`) - Track application status

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For support, email support@krishisangam.com or create an issue in the repository.

---

Made with ❤️ for the farming community

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
