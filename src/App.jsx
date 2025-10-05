// App.jsx
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import BookSession from "./components/BookSession";
import UniversityAdminDashboard from "./components/UniversityAdminDashboard";
import Doctors from "./components/Doctors";
import AdminStudentAppointments from "./components/AdminStudentAppointments";
import AssessmentPage from "./components/AssessmentPage";
import AdminDashboard from "./components/AdminDashboard";
import ApprovedAppointments from "./components/ApprovedAppointments";
import RejectedAppointments from "./components/RejectedAppointments";
import PendingAppointments from "./components/PendingAppointment";
import UniversitiesPage from "./components/UniversitiesPage";
import UniversityStudentsPage from "./components/UniversityStudentsPage";
import AssignDoctorsPage from "./components/AssignDoctorsPage";
import DoctorAppointments from "./components/DoctorAppointments";
import DoctorApprovedAppointments from "./components/DoctorApprovedAppointments";
import DoctorRejectedAppointments from "./components/DoctorRejectedAppointments";
import Reports from "./components/Reports";
import ReportDashboard from "./components/ReportDashboard"
import SessionsSummary from "./components/SessionsSummary";
import Profile from "./components/Profile"
import Resource from "./components/Resources";
function App() {
  return (
    <Router>
      <Routes>
        {/* Public route - Login / Signup */}
        <Route path="/" element={<Signup />} />

        {/* Protected Routes with Role-Based Access */}
        <Route
          path="/book-session"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <BookSession />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-doctors"
          element={
            <ProtectedRoute allowedRoles={["admin", "doctor"]}>
              <Doctors />
            </ProtectedRoute>
          }
        />

        <Route
          path="/university-dashboard"
          element={
            <ProtectedRoute allowedRoles={["university_admin"]}>
              <UniversityAdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-student-appointments"
          element={
            <ProtectedRoute allowedRoles={["admin", "university_admin"]}>
              <AdminStudentAppointments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assessments/:slug"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <AssessmentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/approved-appointments"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ApprovedAppointments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/rejected-appointments"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <RejectedAppointments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/appointments"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <PendingAppointments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/universities"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UniversitiesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/universities/:id/students"
          element={
            <ProtectedRoute allowedRoles={["admin", "university_admin"]}>
              <UniversityStudentsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/universities/:universityId/assign-doctors"
          element={
            <ProtectedRoute allowedRoles={["admin", "university_admin"]}>
              <AssignDoctorsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/appointments"
          element={
          
              <DoctorAppointments />
    
          }
        />

        <Route path="/doctor/approved-appointments" element={<DoctorApprovedAppointments />} />
        <Route path="/doctor/rejected-appointments" element={<DoctorRejectedAppointments />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/student-reports" element={<ReportDashboard />} />
        <Route path="/total-sessions" element={<SessionsSummary />} />
        <Route path="/resources" element={<Resource />} />
        
      </Routes>
    </Router>
  );
}

export default App;
