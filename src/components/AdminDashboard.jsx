import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Menu,
  X,
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  User,
  FileText,
  LogOut,
  GraduationCap,
  UserCog,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const backend_url = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [assessments, setAssessments] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    async function fetchData() {
      try {
        const [doctorsRes, sessionsRes, assessmentsRes, resourcesRes] =
          await Promise.all([
            axios.get(`${backend_url}/api/doctors`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${backend_url}/api/admin/stats/sessions`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            // axios.get(`${backend_url}/api/assessments`, {
            //   headers: { Authorization: `Bearer ${token}` },
            // }),
            // axios.get(`${backend_url}/api/resources`, {
            //   headers: { Authorization: `Bearer ${token}` },
            // }),
          ]);
          console.log("helo")
        setTotalDoctors(doctorsRes.data.data?.length || 0);        
        // setAssessments(assessmentsRes.data || []);
        // setResources(resourcesRes.data || []);
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 p-6 
          bg-gradient-to-br from-white/10 via-teal-300/10 to-indigo-200/10
          backdrop-blur-xl border-r border-white/20 shadow-2xl ring-1 ring-white/10
          transition-transform duration-300 ease-in-out transform
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          rounded-r-3xl flex flex-col`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-extrabold tracking-wide flex items-center gap-3 drop-shadow-lg text-teal-500">
              <LayoutDashboard
                size={26}
                className="text-indigo-400 animate-spin-slow"
              />
              Admin Dashboard
            </h2>
            <button
              onClick={toggleSidebar}
              aria-label="Close sidebar"
              className="p-2 rounded-lg hover:bg-white/10 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-teal-300"
            >
              <X size={26} />
            </button>
          </div>

          {/* Navigation */}
<nav className="flex flex-col gap-3 font-semibold text-lg">
  {[
    { label: "Universities", path: "/admin/universities", icon: <GraduationCap size={20} /> },
    { label: "Doctors", path: "/admin-doctors", icon: <UserCog size={20} /> },
    { label: "Appointments", path: "/admin/appointments", icon: <CalendarDays size={20} /> },
  ].map((item) => (
    <button
      key={item.path}
      onClick={() => navigate(item.path)}
      className="flex items-center gap-4 px-4 py-3 rounded-xl
        bg-white/30 hover:bg-cyan-100/60
        text-slate-900 hover:text-cyan-900
        shadow-lg hover:shadow-cyan-200/30
        backdrop-blur-md transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-cyan-400 active:scale-95 group"
    >
      <span className="text-cyan-500 group-hover:text-cyan-700 drop-shadow-sm transform transition-transform duration-300">
        {item.icon}
      </span>
      <span className="flex-1 text-left drop-shadow-sm">{item.label}</span>
      <span className="text-xs opacity-60">›</span>
    </button>
  ))}
</nav>




          {/* Divider */}
          <div className="my-6 border-t border-white/20"></div>

          {/* Logout Button at Bottom */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 mt-auto px-6 py-3 
              rounded-2xl bg-gradient-to-r from-red-600 to-red-600 
              hover:from-red-700 hover:to-red-700
              shadow-lg hover:shadow-red-400/20
              font-semibold text-white transition-all duration-300 
              focus:outline-none focus:ring-2 focus:ring-red-400 active:scale-95"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-0 p-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 bg-white py-4 px-6 rounded shadow">
          <button onClick={toggleSidebar}>
            {sidebarOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
          <h1 className="text-3xl font-bold text-indigo-700">Welcome, Admin</h1>
        </header>

        {/* Dashboard Boxes (3 per row) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          {/* Doctors */}
          <div
            onClick={() => navigate("/admin-doctors")}
            className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl shadow-lg p-6 text-center hover:scale-105 transition transform duration-300 cursor-pointer"
          >
            <User size={48} className="text-indigo-600 mx-auto" />
            <h2 className="text-2xl font-bold mt-4">{totalDoctors}</h2>
            <p className="text-gray-600">Total Doctors</p>
          </div>

          {/* Appointments */}
          <div
            // onClick={() => navigate("/admin/appointments")}
            className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl shadow-lg p-6 text-center hover:scale-105 transition transform duration-300 cursor-pointer"
          >
            <CalendarDays size={48} className="text-green-600 mx-auto" />
            <h2 className="text-2xl font-bold mt-4">View</h2>
            <p className="text-gray-600">Appointments</p>
          </div>

          {/* Assessments */}
          <div
            // onClick={() => navigate("/admin/assessments")}
            className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl shadow-lg p-6 text-center hover:scale-105 transition transform duration-300 cursor-pointer"
          >
            <BookOpen size={48} className="text-purple-600 mx-auto" />
            <h2 className="text-2xl font-bold mt-4">{assessments.length}</h2>
            <p className="text-gray-600">Total Assessments</p>
          </div>

          {/* Resources */}
          <div
            // onClick={() => navigate("/admin/resources")}
            className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl shadow-lg p-6 text-center hover:scale-105 transition transform duration-300 cursor-pointer"
          >
            <FileText size={48} className="text-pink-600 mx-auto" />
            <h2 className="text-2xl font-bold mt-4">{resources.length}</h2>
            <p className="text-gray-600">Total Resources</p>
          </div>

          {/* Universities */}
          <div
            onClick={() => navigate("/admin/universities")}
            className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl shadow-lg p-6 text-center hover:scale-105 transition transform duration-300 cursor-pointer"
          >
            <GraduationCap size={48} className="text-yellow-600 mx-auto" />
            <h2 className="text-2xl font-bold mt-4">View</h2>
            <p className="text-gray-600">Universities</p>
          </div>
        </section>
      </main>
    </div>
  );
}
