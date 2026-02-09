# Krishi Sangam Project Structure

## Complete Folder Structure

```
Krishi Sangam/
└── frontend/
    ├── public/
    │   └── vite.svg
    ├── src/
    │   ├── assets/
    │   │   └── react.svg
    │   ├── components/
    │   │   ├── Common/
    │   │   │   ├── Navbar.jsx
    │   │   │   ├── Navbar.css
    │   │   │   ├── Footer.jsx
    │   │   │   ├── Footer.css
    │   │   │   └── ProtectedRoute.jsx
    │   │   ├── Farmer/
    │   │   │   └── (Farmer-specific reusable components)
    │   │   └── Labour/
    │   │       └── (Labour-specific reusable components)
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Auth/
    │   │   │   ├── FarmerRegister.jsx
    │   │   │   ├── FarmerLogin.jsx
    │   │   │   ├── LabourRegister.jsx
    │   │   │   ├── LabourLogin.jsx
    │   │   │   └── Auth.css
    │   │   ├── Farmer/
    │   │   │   ├── FarmerDashboard.jsx
    │   │   │   ├── FarmerDashboard.css
    │   │   │   ├── CreateJob.jsx
    │   │   │   ├── CreateJob.css
    │   │   │   ├── Weather.jsx
    │   │   │   ├── Weather.css
    │   │   │   ├── CropPrediction.jsx
    │   │   │   └── CropPrediction.css
    │   │   ├── Labour/
    │   │   │   ├── LabourDashboard.jsx
    │   │   │   ├── LabourDashboard.css
    │   │   │   ├── AllJobs.jsx
    │   │   │   ├── AllJobs.css
    │   │   │   ├── MyApplications.jsx
    │   │   │   └── MyApplications.css
    │   │   ├── Home.jsx
    │   │   └── Home.css
    │   ├── services/
    │   │   └── api.js
    │   ├── utils/
    │   │   └── constants.js
    │   ├── App.jsx
    │   ├── App.css
    │   ├── main.jsx
    │   └── index.css
    ├── .env.example
    ├── .gitignore
    ├── eslint.config.js
    ├── index.html
    ├── package.json
    ├── README.md
    ├── vite.config.js
    └── PROJECT_STRUCTURE.md (this file)
```

## File Descriptions

### Root Level Files

- **index.html** - Main HTML template
- **package.json** - Project dependencies and scripts
- **vite.config.js** - Vite configuration
- **eslint.config.js** - ESLint configuration
- **.env.example** - Environment variables template
- **README.md** - Project documentation

### src/ Directory

#### Core Files
- **main.jsx** - Application entry point
- **App.jsx** - Root component with routing
- **App.css** - Global app styles
- **index.css** - Base CSS and utility classes

#### components/Common/
Shared components used across the application:
- **Navbar.jsx** - Navigation bar with role-based menu
- **Footer.jsx** - Site footer
- **ProtectedRoute.jsx** - Route protection wrapper

#### context/
React Context for state management:
- **AuthContext.jsx** - Authentication state and functions

#### pages/
Page components organized by feature:

**Auth/** - Authentication pages
- FarmerRegister.jsx - Farmer registration form
- FarmerLogin.jsx - Farmer login form
- LabourRegister.jsx - Labour registration form
- LabourLogin.jsx - Labour login form
- Auth.css - Shared authentication styles

**Farmer/** - Farmer-specific pages
- FarmerDashboard.jsx - Farmer dashboard with stats
- CreateJob.jsx - Job posting form
- Weather.jsx - Weather forecast display
- CropPrediction.jsx - Crop prediction tool

**Labour/** - Labour-specific pages
- LabourDashboard.jsx - Labour dashboard
- AllJobs.jsx - Job listings with filters
- MyApplications.jsx - Application tracking

**Home.jsx** - Landing page

#### services/
API integration:
- **api.js** - Axios instance and API endpoints

#### utils/
Utility functions and constants:
- **constants.js** - App-wide constants

## Component Hierarchy

```
App
├── Router
│   ├── Navbar
│   ├── Routes
│   │   ├── Home
│   │   ├── Auth Pages
│   │   │   ├── FarmerRegister
│   │   │   ├── FarmerLogin
│   │   │   ├── LabourRegister
│   │   │   └── LabourLogin
│   │   ├── Farmer Pages (Protected)
│   │   │   ├── FarmerDashboard
│   │   │   ├── CreateJob
│   │   │   ├── Weather
│   │   │   └── CropPrediction
│   │   └── Labour Pages (Protected)
│   │       ├── LabourDashboard
│   │       ├── AllJobs
│   │       └── MyApplications
│   └── Footer
```

## State Management

### AuthContext
Provides throughout the app:
- `user` - Current user object
- `userType` - 'farmer' or 'labour'
- `login(userData, type)` - Login function
- `logout()` - Logout function
- `isAuthenticated` - Authentication status
- `loading` - Loading state

## API Structure

### Endpoints Organization

**Auth APIs**
- POST /auth/farmer/register
- POST /auth/farmer/login
- POST /auth/labour/register
- POST /auth/labour/login

**Job APIs**
- POST /jobs - Create job
- GET /jobs - Get all jobs
- GET /jobs/:id - Get job by ID
- PUT /jobs/:id - Update job
- DELETE /jobs/:id - Delete job
- POST /jobs/:id/apply - Apply for job
- GET /jobs/my-jobs - Get farmer's jobs
- GET /jobs/my-applications - Get labour's applications

**Weather API**
- External: OpenWeather API

**Crop Prediction API**
- POST /crop/predict

## Styling Approach

- **CSS Modules per Component** - Each major component has its own CSS file
- **Shared Styles** - Global styles in index.css and App.css
- **Responsive Design** - Mobile-first approach with media queries
- **Color Scheme**:
  - Primary Green: #4caf50, #2e7d32
  - Secondary Blue: #2196f3
  - Accent Colors: #ff9800, #f44336
  - Neutral: #f5f5f5, #666

## Routing Structure

```
Public Routes:
  /                     - Home page
  /farmer/register      - Farmer registration
  /farmer/login         - Farmer login
  /labour/register      - Labour registration
  /labour/login         - Labour login

Protected Routes (Farmer):
  /farmer/dashboard     - Dashboard
  /farmer/create-job    - Create job post
  /farmer/weather       - Weather forecast
  /farmer/crop-prediction - Crop prediction

Protected Routes (Labour):
  /labour/dashboard     - Dashboard
  /labour/jobs          - All jobs
  /labour/my-applications - Applications
```

## Development Guidelines

1. **Component Naming**: PascalCase for components
2. **File Organization**: Group related files together
3. **CSS Naming**: BEM-like naming convention
4. **API Calls**: Always use the api.js service
5. **Error Handling**: Implement try-catch in all API calls
6. **Loading States**: Show loading indicators during async operations
7. **Responsive Design**: Test on mobile, tablet, and desktop

## Future Enhancements

- Profile management pages
- Job application review system for farmers
- Chat functionality between farmers and labourers
- Payment integration
- Rating and review system
- Notification system
- Advanced search and filters
- Analytics dashboard
