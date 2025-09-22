import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, LayoutDashboard, BookOpen, CalendarDays, LogOut } from "lucide-react";
import axios from "axios";
import minderyLogo from "../assets/mindery.png";

const backend_url = import.meta.env.VITE_API_BASE_URL;

// Sidebar Component
function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  if (!isOpen) return null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const menuItems = [
    { to: "/profile", label: "Profile", icon: LayoutDashboard },
    { to: "/resources", label: "Resources", icon: BookOpen },
    { to: "/book-session", label: "Session Booking", icon: CalendarDays },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
      <aside className="fixed top-0 right-0 w-72 h-full bg-white/20 backdrop-blur-xl text-gray-800 p-6 shadow-2xl flex flex-col z-50 rounded-l-3xl border border-white/30">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-bold tracking-wide">📊 Dashboard</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
            aria-label="Close sidebar"
          >
            <X />
          </button>
        </div>

        <nav className="flex flex-col gap-3 flex-1">
          {menuItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-xl transition ${
                  isActive
                    ? "bg-indigo-200 shadow-md"
                    : "hover:bg-white/30 hover:backdrop-blur-sm"
                }`
              }
              onClick={onClose}
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 transition px-4 py-2 rounded-xl shadow-md font-semibold text-white"
        >
          <LogOut size={18} /> Logout
        </button>
      </aside>
    </>
  );
}

// Navbar Component
function Navbar({ onToggle }) {
  const [studentName, setStudentName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get(`${backend_url}/api/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setStudentName(res.data.name))
        .catch((err) => console.error("Error fetching student:", err));
    }
  }, []);
return(
<header className="bg-white/50 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-40">
  <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
    
    {/* ✅ Left: Logo & Brand */}
    <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
      <img
        src={minderyLogo}
        alt="Mindery Logo"
        className="w-12 h-12 flex-shrink-0"
      />
      <div className="flex flex-col min-w-0">
        <span className="text-lg font-bold text-teal-600 truncate">
          Mindery
        </span>
        <span className="text-xs text-gray-500 truncate">
          Grow with clarity
        </span>
      </div>
    </div>

    {/* ✅ Center: Navigation (hidden on small screens) */}
    <nav className="hidden md:flex flex-1 justify-center items-center gap-6 font-medium text-gray-600">
      <Link
        to="/student-dashboard"
        className="px-4 py-2 rounded-full bg-teal-600 text-white hover:bg-teal-700 transition shadow-sm"
      >
        Home
      </Link>
      <Link to="/resources" className="hover:text-indigo-600 transition">
        Resources
      </Link>
      <Link to="/book-session" className="hover:text-indigo-600 transition">
        Book a Session
      </Link>
      <a
        href="tel:+919571404870"
        className="ml-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition shadow-sm"
      >
        📞 Call Us
      </a>
    </nav>

    {/* ✅ Right: Student name + Menu button */}
    <div className="flex items-center gap-3">
      {studentName && (
        <div className="hidden sm:block font-semibold text-indigo-600 truncate max-w-[8rem]">
          {studentName}
        </div>
      )}
      {/* Menu Button - Always visible */}
      <button
        onClick={onToggle}
        className="p-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 transition"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>
    </div>
  </div>
</header>


)
}

// Main Dashboard Component
export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalSessions, setTotalSessions] = useState(0);
  const [upcomingSessions, setUpcomingSessions] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    async function fetchData() {
      try {
        const assessmentsRes = await axios.get(`${backend_url}/api/assessments`);
        setAssessments(assessmentsRes.data);

        const attendedRes = await axios.get(`${backend_url}/api/appointments/my/attended`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTotalSessions(attendedRes.data.count);

        const upcomingRes = await axios.get(`${backend_url}/api/appointments/my/upcoming`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUpcomingSessions(upcomingRes.data.count);
      } catch (err) {
        console.error("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-teal-50 to-teal-100 text-gray-900 flex">
      <div className={`flex flex-col flex-1 min-h-screen transition-margin duration-300 ease-in-out ${sidebarOpen ? "mr-72" : "mr-0"}`}>
        <Navbar onToggle={() => setSidebarOpen(true)} />

        <main className="p-8 max-w-7xl mx-auto flex-grow">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 select-none text-center">Welcome to Mindery ✨</h2>


<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
  <div className="bg-blue-100/40 backdrop-blur-xl rounded-3xl shadow-xl p-6 text-center hover:scale-105 transition transform duration-300">
    <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Sessions</h3>
    <p className="text-4xl font-extrabold text-indigo-600">{totalSessions}</p>
  </div>
  <div className="bg-green-100/40 backdrop-blur-xl rounded-3xl shadow-xl p-6 text-center hover:scale-105 transition transform duration-300">
    <h3 className="text-lg font-semibold text-gray-700 mb-2">Upcoming Sessions</h3>
    <p className="text-4xl font-extrabold text-green-600">{upcomingSessions}</p>
  </div>
  <div className="bg-pink-100/40 backdrop-blur-xl rounded-3xl shadow-xl p-6 text-center hover:scale-105 transition transform duration-300">
    <h3 className="text-lg font-semibold text-gray-700 mb-2">Leave Balance</h3>
    <p className="text-4xl font-extrabold text-pink-600">10</p>
  </div>
</div>

<section className="bg-yellow-100/40 backdrop-blur-xl rounded-3xl shadow-xl p-10 mb-12 select-text">
  <h3 className="text-3xl font-bold mb-4 text-gray-800">🧠 Assessments</h3>
  <p className="text-gray-700 max-w-2xl mx-auto mb-8">
    Take a quick test to check your mood, personality, and overall well-being.
  </p>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
    {loading ? (
      <div className="col-span-full text-center text-gray-500">Loading assessments...</div>
    ) : (
      assessments.map((a, i) => (
        <div
          key={a.slug}
          onClick={() => navigate(`/assessments/${a.slug}`)}
          className={`flex flex-col rounded-3xl p-6 shadow-md cursor-pointer transition transform hover:shadow-2xl hover:scale-[1.03] focus:outline-none focus:ring-4 focus:ring-teal-300 ${
            i % 3 === 0
              ? "bg-purple-100/40"
              : i % 3 === 1
              ? "bg-teal-100/40"
              : "bg-orange-100/40"
          }`}
          title={`Start ${a.title}`}
          aria-label={`Start ${a.title}`}
          tabIndex={0}
        >
          <h4 className="text-xl font-semibold text-teal-700 mb-3 text-left">{a.title}</h4>
          <p className="text-gray-700 flex-grow text-left">{a.description}</p>
          <span className="mt-6 inline-block text-teal-600 font-semibold hover:underline underline-offset-2">
            Start →
          </span>
        </div>
      ))
    )}
  </div>
</section>


          <div className="text-center">
            <button
              onClick={() => navigate("/reports")}
              className="bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white px-8 py-3 rounded-2xl shadow-lg font-semibold transition transform hover:scale-105"
            >
              📊 View Reports & Analytics
            </button>
          </div>
        </main>

        <footer className="bg-white/20 backdrop-blur-xl text-gray-700 mt-16 border-t border-gray-300 py-8">
          <div className="max-w-7xl mx-auto px-6 text-center select-text">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">About Mindery</h3>
            <p className="text-sm max-w-2xl mx-auto">
              Mindery is your personal learning companion. Our mission is to provide personalized resources, guidance,
              and session booking to help you grow.
            </p>
            <p className="text-xs text-gray-500 mt-6">&copy; {new Date().getFullYear()} Mindery. All rights reserved.</p>
          </div>
        </footer>
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  );
}
