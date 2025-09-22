import React, { useState, useEffect } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const backend_url = import.meta.env.VITE_API_BASE_URL; 
const UniversityAdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalStudents, setTotalStudents] = useState(0);
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/"); // Redirect to login page after logout
  };

  // Fetch total students
  const fetchTotalStudents = async () => {
    try {
      const res = await axios.get(`${backend_url}/api/universities/my-university/students/count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTotalStudents(res.data.count || 0);
    } catch (err) {
      console.error("Failed to fetch total students:", err);
    }
  };

  // Fetch doctors assigned to this university
const fetchDoctors = async () => {
  try {
    const res = await axios.get(`${backend_url}/api/universities/my-university/doctors`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("✅ Doctors response:", res.data);

    setDoctors(res.data.data || []);
  } catch (err) {
    console.error("Failed to fetch doctors:", err);
  }
};

  useEffect(() => {
    fetchTotalStudents();
    fetchDoctors();
  }, [token]);

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl p-6 transform transition-transform duration-300 z-20 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-emerald-800">University Admin</h2>
          <button onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Sidebar Buttons */}
        <button
          onClick={() => navigate("/university-admin-dashboard")}
          className="w-full px-4 py-3 rounded-xl bg-emerald-500 text-white font-semibold mt-3 shadow hover:bg-emerald-600 transition"
        >
          Dashboard
        </button>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 rounded-xl bg-red-500 text-white font-semibold mt-3 shadow hover:bg-red-600 transition flex items-center justify-center gap-2"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col py-12 px-4 sm:px-8 transition-all duration-500">
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="mb-4 p-3 rounded-full bg-white shadow-lg hover:scale-105 transition w-fit"
        >
          <Menu size={22} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-extrabold text-emerald-800 tracking-tight drop-shadow-lg">
            Welcome, University Admin 🎓
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your university, students, and statistics here.
          </p>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total Students */}
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-lg flex flex-col justify-center items-center">
            <p className="text-gray-500 font-semibold">Total Students</p>
            <h2 className="text-4xl font-bold text-emerald-800">{totalStudents}</h2>
          </div>

          {/* Total Doctors */}
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-lg">
            <p className="text-gray-500 font-semibold mb-4">Doctors Assigned</p>
            {doctors.length === 0 ? (
              <p className="text-gray-700">No doctors assigned yet.</p>
            ) : (
              <ul className="space-y-3 max-h-64 overflow-y-auto">
                {doctors.map((doc) => (
                  <li
                    key={doc._id}
                    className="bg-white shadow-md rounded-xl p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">{doc.name}</p>
                      <p className="text-gray-500 text-sm">{doc.specialization}</p>
                    </div>
                    <p className="text-gray-500 text-sm">{doc.email}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversityAdminDashboard;
