import { useEffect, useState } from "react";
import axios from "axios";

const backend_url = import.meta.env.VITE_API_BASE_URL;

// Helper to generate initials for the avatar placeholder
const getInitials = (name) => {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
};

// Helper for a more visual spinner
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-48">
    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
    <p className="ml-3 text-gray-600">Loading profile data...</p>
  </div>
);

// Helper for the role badge styling
const RoleBadge = ({ role }) => {
  let colorClass = "";
  switch (role) {
    case "admin":
      colorClass = "bg-red-500";
      break;
    case "doctor":
      colorClass = "bg-green-500";
      break;
    case "university_admin":
      colorClass = "bg-yellow-500";
      break;
    case "student":
    default:
      colorClass = "bg-blue-500";
      break;
  }
  return (
    <span className={`inline-block px-3 py-1 text-xs font-semibold uppercase rounded-full text-white ${colorClass}`}>
      {role.replace('_', ' ')}
    </span>
  );
};


export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await axios.get(`${backend_url}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data.user);
      } catch (err) {
        console.error("❌ Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!user) return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-xl rounded-lg mt-10 text-center">
      <p className="text-xl text-red-600">
        ❌ Profile access denied or failed to load. Please log in.
      </p>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto mt-6">
      <div className="bg-white shadow-2xl rounded-xl overflow-hidden">
        
        {/* === HEADER & BASIC INFO === */}
        <div className="bg-gray-100 p-6 flex items-center border-b border-gray-200">
          {/* Avatar Placeholder */}
          <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mr-4 shadow-md">
            {getInitials(user.name)}
          </div>
          
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">{user.name}</h1>
            <div className="mt-1">
                <RoleBadge role={user.role} />
            </div>
          </div>
        </div>

        <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Account Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                <div className="border-l-4 border-blue-400 pl-3">
                    <p className="text-sm font-medium">Email Address</p>
                    <p className="text-base font-semibold text-gray-800">{user.email}</p>
                </div>
                
                <div className="border-l-4 border-blue-400 pl-3">
                    <p className="text-sm font-medium">Unique ID</p>
                    <p className="text-base font-semibold text-gray-800 break-words">{user._id || "N/A"}</p>
                </div>
            </div>
        </div>

        {/* === ROLE-SPECIFIC DASHBOARD SECTION === */}
        <div className="p-6 pt-0">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Role Dashboard Overview</h2>

          {user.role === "admin" && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <h3 className="text-lg font-bold text-red-700 mb-2">Admin Control Panel</h3>
              <p className="text-red-600">✅ **Full system oversight.** Manage all users, institutions, and core configurations.</p>
              <ul className="list-disc pl-6 mt-2 text-red-600">
                <li>Manage Universities & Admins</li>
                <li>Approve/Reject Doctor Applications</li>
                <li>System-wide Reporting & Audit Logs</li>
              </ul>
            </div>
          )}

          {user.role === "doctor" && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
              <h3 className="text-lg font-bold text-green-700 mb-2">Doctor Portal</h3>
              <p className="text-green-600">👩‍⚕️ **Welcome, Dr. {user.name}**! Get ready for your sessions.</p>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <p className="bg-green-100 p-2 rounded text-sm"><strong>Specialization:</strong> {user.specialization || "General Practice"}</p>
                <p className="bg-green-100 p-2 rounded text-sm"><strong>Status:</strong> {user.isApproved ? 'Approved' : 'Pending Review'}</p>
              </div>
              <p className="mt-3 text-green-600">📅 **Next Steps:** Review and manage your available time slots and patient appointments.</p>
            </div>
          )}

          {user.role === "university_admin" && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-md">
              <h3 className="text-lg font-bold text-yellow-700 mb-2">University Management</h3>
              <p className="text-yellow-600">🎓 Managing **{user.university?.name || "Unspecified University"}**.</p>
              <ul className="list-disc pl-6 mt-2 text-yellow-600">
                <li>Oversee user enrollment and access.</li>
                <li>Schedule and manage university-specific doctor sessions.</li>
                <li>Access institutional performance metrics.</li>
              </ul>
            </div>
          )}

          {user.role === "student" && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
              <h3 className="text-lg font-bold text-blue-700 mb-2">Student Activity</h3>
              <p className="text-blue-600">📚 **Welcome to your personal dashboard, {user.name}.**</p>
              <ul className="list-disc pl-6 mt-2 text-blue-600">
                <li>View your upcoming and past bookings.</li>
                <li>Quick access to booked session join links.</li>
                <li>Browse available doctors and specialists.</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}