import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, userType }) => {
  const isAuthenticated = localStorage.getItem('accessToken') !== null;
  const currentUserType = localStorage.getItem('userType');
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (userType && currentUserType !== userType) {
    // Redirect to appropriate dashboard if user type doesn't match
    return <Navigate to={`/${currentUserType}/dashboard`} />;
  }
  
  return children;
};

export default PrivateRoute;