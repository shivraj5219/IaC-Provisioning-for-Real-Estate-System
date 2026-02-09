import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import FarmerAuthRoutes from './FarmerAuthRoutes';
import LabourAuthRoutes from './LabourAuthRoutes';
import FarmerRoutes from './FarmerRoutes';
import LabourRoutes from './LabourRoutes';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      
      {/* Farmer Auth Routes */}
      {FarmerAuthRoutes()}
      
      {/* Labour Auth Routes */}
      {LabourAuthRoutes()}
      
      {/* Farmer Protected Routes */}
      {FarmerRoutes()}
      
      {/* Labour Protected Routes */}
      {LabourRoutes()}
    </Routes>
  );
};

export default AppRoutes;
