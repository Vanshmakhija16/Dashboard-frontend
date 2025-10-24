import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  User,
  Calendar,
  BookOpen,
  Phone,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import minderyLogo from "../assets/mindery.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const backend_url = import.meta.env.VITE_API_BASE_URL;

export default function EmployeeDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAssessments() {
      try {
        const res = await axios.get(`${backend_url}/api/assessments`);
        setAssessments(res.data);
      } catch (err) {
        console.error("Error fetching assessments", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAssessments();
  }, []);

  // ===== SAMPLE DATA for Charts =====
  const barData = [
    { name: "Stress", score: 70 },
    { name: "Sleep", score: 85 },
    { name: "Focus", score: 60 },
    { name: "Happiness", score: 90 },
  ];

  const pieData = [
    { name: "Completed", value: 65 },
    { name: "Pending", value: 25 },
    { name: "In Progress", value: 10 },
  ];

  const COLORS = ["#3b82f6", "#10b981", "#facc15"];

  // ===== CHALLENGES =====
  const challenges = [
    {
      title: "Mindful Breaks",
      desc: "Take 5-minute breathing sessions during work hours.",
      color: "bg-blue-100",
    },
    {
      title: "Sleep Challenge",
      desc: "Maintain a sleep journal for 7 days.",
      color: "bg-green-100",
    },
    {
      title: "Digital Detox",
      desc: "Avoid screens 1 hour before bed.",
      color: "bg-pink-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col relative">
      {/* ===== NAVBAR ===== */}
      <nav className="flex justify-between items-center px-6 py-4 bg-white/70 backdrop-blur-xl shadow-md sticky top-0 z-30 border-b border-blue-100">
        {/* Left: Menu Icon */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="text-gray-700 hover:text-blue-600 transition z-50 relative"
          >
            {sidebarOpen ? (
              <X size={28} strokeWidth={2.5} />
            ) : (
              <Menu size={28} strokeWidth={2.5} />
            )}
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <img
              src={minderyLogo}
              alt="Mindery Logo"
              className="w-10 h-10 object-contain"
            />
            <h1 className="text-2xl font-bold text-blue-700 tracking-tight">
              Mindery
            </h1>
          </div>
        </div>

        {/* Middle: Links */}
        <div className="hidden md:flex items-center gap-6 text-gray-700 font-medium">
          <button className="hover:text-blue-600 transition">Home</button>
          <button  onClick={() => navigate("/resources")} className="hover:text-blue-600 transition">Resources</button>
          <button
            className="hover:text-blue-600"
            onClick={() => navigate("/book-session-employee")}
          >
            Book Session
          </button>
          <button className="flex items-center gap-2 text-blue-700 hover:text-blue-800 transition">
            <Phone size={18} /> Call Us
          </button>
        </div>

        {/* Right: Login */}
        <button
          onClick={() => navigate("/login")}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
        >
          Login
        </button>
      </nav>

      {/* ===== SIDEBAR (Mobile) ===== */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 80 }}
            className="fixed top-0 left-0 w-64 h-full bg-white/90 backdrop-blur-xl shadow-2xl z-40 flex flex-col"
          >
            <div className="flex justify-between items-center px-5 py-4 border-b border-blue-100">
              <h2 className="text-lg font-bold text-blue-700">Mindery</h2>
              <button
                onClick={toggleSidebar}
                className="text-gray-600 hover:text-blue-600 transition"
              >
                <X size={22} />
              </button>
            </div>

            <nav className="flex-1 px-5 py-6 flex flex-col gap-5 text-gray-700 font-medium">
              <SidebarItem icon={<User />} text="Profile" />
              <SidebarItem icon={<Home />} text="Dashboard" active />
              <SidebarItem icon={<Calendar />} text="Session Booking" />
              <SidebarItem icon={<BookOpen />} text="Resources" />
            </nav>

            <div className="mt-auto px-5 py-4 border-t border-blue-100">
              <button className="flex items-center gap-3 text-red-500 hover:text-red-600 font-semibold transition">
                <LogOut size={20} /> Logout
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 flex flex-col items-center text-center mt-12 px-6">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4"
        >
          Welcome to Your Company Dashboard
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 max-w-2xl mb-8 leading-relaxed"
        >
          View your company’s assigned doctors, manage session bookings, and
          explore curated mental health resources.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <button  onClick={() => navigate("/book-session-employee")} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition">
            View Assigned Doctors
          </button>
          <button  onClick={() => navigate("/resources")} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg transition">
            Explore Resources
          </button>
        </motion.div>


                {/* ===== MAIN IMAGE ===== */}
        <motion.img
          src="https://imgs.search.brave.com/V6J2AMC1skmBdrlg-xCsqF9EdW_fiFlmRRcW0cG_XBs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/dHJhdmVsb3Byby5j/b20vcHVibGljL2lt/YWdlcy9jb250ZW50/cy9vbmxpbmUtYm9v/a2luZy1wb3J0YWxz/Mi5qcGc"
          alt="Mindery Dashboard Illustration"
          className="mt-14 w-full max-w-5xl rounded-3xl shadow-2xl border border-blue-100"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        />

        {/* ===== ASSESSMENTS SECTION ===== */}
        <section className="py-14 w-full text-center">
          <h3 className="text-3xl font-bold text-gray-800 mb-3">
            🧠 Assessments
          </h3>
          <p className="text-gray-600 mb-8">
            Explore wellbeing assessments curated for you.
          </p>

          {loading ? (
            <p className="text-gray-500">Loading assessments...</p>
          ) : (
            <div className="flex overflow-x-auto no-scrollbar space-x-6 px-4 justify-center">
              {assessments.map((a, i) => {
                const colors = [
                  "bg-blue-100",
                  "bg-green-100",
                  "bg-pink-100",
                  "bg-purple-100",
                  "bg-yellow-100",
                ];
                return (
                  <div
                    key={a.slug}
                    onClick={() => navigate(`/assessments/${a.slug}`)}
                    className={`${colors[i % colors.length]} shadow-md hover:shadow-lg p-4 rounded-xl w-[220px] flex-shrink-0 text-left cursor-pointer transition-transform hover:scale-[1.03]`}
                  >
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">
                      {a.title}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {a.description}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>



      </main>
    </div>
  );
}

// ===== Sidebar Component =====
const SidebarItem = ({ icon, text, active }) => (
  <button
    className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
      active
        ? "bg-blue-100 text-blue-700 font-semibold shadow-sm"
        : "hover:bg-blue-50 hover:text-blue-600"
    }`}
  >
    <span className="text-blue-600">{icon}</span> {text}
  </button>
);
