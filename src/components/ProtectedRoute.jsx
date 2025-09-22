// ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const location = useLocation();

  // 1️⃣ If not logged in → redirect to login/signup
  if (!token || !user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 2️⃣ If allowedRoles is specified, check if user's role matches
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect user based on their role
    if (user.role === "admin") return <Navigate to="/admin-dashboard" replace />;
    if (user.role === "university_admin") return <Navigate to="/university-dashboard" replace />;
    return <Navigate to="/student-dashboard" replace />; // default for students
  }

  // 3️⃣ If everything is fine → render the child page
  return children;
};

export default ProtectedRoute;
