import { createRoot } from "react-dom/client";
import "../index.css";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { createBrowserRouter } from "react-router";
import store from "./store/store.js";
import App from "./App.jsx";
import Register from "./page/auth/Register.jsx";
import Login from "./page/auth/Login.jsx";
import AdminDashboard from "./page/admin/Dashboard.jsx";
import TutorDashboard from "./page/tutor/Dashboard.jsx";
import StudentDashboard from "./page/student/Dashboard.jsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/admin/dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "/tutor/dashboard",
        element: <TutorDashboard />,
      },
      {
        path: "/student/dashboard",
        element: <StudentDashboard />,
      },
    ],
  },
]);
createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);
