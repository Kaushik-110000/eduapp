import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Register from "./page/auth/Register";
import Login from "./page/auth/Login";
import AuthLayout from "./page/auth/AuthLayout";
import StudentDashboard from "./page/student/Dashboard";
import TutorDashboard from './page/tutor/Dashboard';
import AdminDashboard from './page/admin/Dashboard';
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
        <Route path="/student/dashboard" element={<StudentDashboard />} />

        <Route path="/tutor/dashboard" element={<TutorDashboard />} />

        <Route path="/admin/dashboard" element={
          
            <AdminDashboard />
          
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
