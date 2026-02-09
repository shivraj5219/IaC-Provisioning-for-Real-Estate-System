import { Route } from 'react-router-dom';
import FarmerRegister from '../pages/Auth/FarmerRegister';
import FarmerLogin from '../pages/Auth/FarmerLogin';

const FarmerAuthRoutes = () => {
  return (
    <>
      <Route path="/farmer/register" element={<FarmerRegister />} />
      <Route path="/farmer/login" element={<FarmerLogin />} />
    </>
  );
};

export default FarmerAuthRoutes;
