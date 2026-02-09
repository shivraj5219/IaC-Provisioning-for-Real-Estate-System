import { Route } from 'react-router-dom';
import LabourRegister from '../pages/Auth/LabourRegister';
import LabourLogin from '../pages/Auth/LabourLogin';

const LabourAuthRoutes = () => {
  return (
    <>
      <Route path="/labour/register" element={<LabourRegister />} />
      <Route path="/labour/login" element={<LabourLogin />} />
    </>
  );
};

export default LabourAuthRoutes;
