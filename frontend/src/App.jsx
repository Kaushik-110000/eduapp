import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import AuthLayout from './components/auth/AuthLayout';
// import StudentDashboard from './components/student/Dashboard';
// import TutorDashboard from './components/tutor/Dashboard';
// import AdminDashboard from './components/admin/Dashboard';
//import PrivateRoute from './components/common/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<AuthLayout />}>
          <Route index element={<Navigate to="/login" />} />
          <Route path="register" element={<Register />} />
          <Route path="login" element={<Login />} />
        </Route>
        
        {/* Protected Routes */}
        {/* <Route path="/student/dashboard" element={
          <PrivateRoute userType="student">
            <StudentDashboard />
          </PrivateRoute>
        } /> */}
        
        {/* <Route path="/tutor/dashboard" element={
          <PrivateRoute userType="tutor">
            <TutorDashboard />
          </PrivateRoute>
        } /> */}
        
        {/* <Route path="/admin/dashboard" element={
          <PrivateRoute userType="admin">
            <AdminDashboard />
          </PrivateRoute>
        } /> */}
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;