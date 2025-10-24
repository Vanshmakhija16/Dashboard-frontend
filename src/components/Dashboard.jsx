import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, LayoutDashboard, BookOpen, CalendarDays, LogOut } from "lucide-react";
import axios from "axios";
import minderyLogo from "../assets/mindery.png";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa";
import { Lock } from "lucide-react";


const backend_url = import.meta.env.VITE_API_BASE_URL;

// Sidebar Component
function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  if (!isOpen) return null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };
<a
        href="tel:+9180694640841"
        className="ml-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition shadow-sm"
      >
        {/* 📞 +9180694640841 */}
        📞Call Us
      </a>
  const menuItems = [
    { to: "/profile", label: "Profile", icon: LayoutDashboard },
    { to: "/resources", label: "Resources", icon: BookOpen },
    { to: "/book-session", label: "Session Booking", icon: CalendarDays },
    {to:"tel:+918959693642", label:"Contact Us" , icon : CalendarDays}
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
  const [loading, setLoading] = useState(true); // ✅ Fixes setLoading error
  const [assessments, setAssessments] = useState([]); // ✅ Fixes setAssessments error
  const [totalSessions, setTotalSessions] = useState(0); // ✅ Fixes setTotalSessions error
  const [upcomingSessions, setUpcomingSessions] = useState(0); // ✅ Fixes setUpcomingSessions error

  useEffect(() => {
    const token = localStorage.getItem("token");

    async function fetchData() {
      try {
        const res = await axios.get(
          `${backend_url}/api/assessments/my`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAssessments(res.data);

        const attendedRes = await axios.get(
          `${backend_url}/api/appointments/my/attended`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTotalSessions(attendedRes.data.count);

        const upcomingRes = await axios.get(
          `${backend_url}/api/appointments/my/upcoming`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUpcomingSessions(upcomingRes.data.count);
      } catch (err) {
        console.error("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // optional loader
  }

return(
<header className="bg-gradient-to-r from-white via-teal-50 to-indigo-50 backdrop-blur-md shadow-md border-b border-gray-200 sticky top-0 z-40">
  <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between">
    
    {/* ✅ Left: Logo & Brand */}
    <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
      <img
        src={minderyLogo}
        alt="Mindery Logo"
        className="w-11 h-11 flex-shrink-0 rounded-full shadow-sm border border-gray-200"
      />
      <div className="flex flex-col min-w-0">
        <span className="text-lg font-extrabold bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
          Mindery
        </span>
        <span className="text-xs text-gray-500 font-medium">
          Grow with clarity
        </span>
      </div>
    </div>

    {/* ✅ Center: Navigation (hidden on small screens) */}
    <nav className="hidden md:flex flex-1 justify-center items-center gap-6 font-medium">
      <Link
        to="/student-dashboard"
        className="px-4 py-2 rounded-full bg-gradient-to-r from-teal-600 to-indigo-600 text-white shadow-sm hover:shadow-md hover:scale-105 transition transform duration-200"
      >
        Home
      </Link>
      <Link
        to="/profile"
        className="px-4 py-2 rounded-full text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition duration-200"
      >
        Profile
      </Link>
      <Link
        to="/resources"
        className="px-4 py-2 rounded-full text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition duration-200"
      >
        Resources
      </Link>
      <Link
        to="/book-session"
        className="px-4 py-2 rounded-full text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition duration-200"
      >
        Find a Doctor
      </Link>
      <a
        href="tel:+9180694640841"
        className="ml-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:scale-105 hover:shadow-md transition transform duration-200"
      >
        📞Call Us
        {/* 📞 +91 80694 64084 */}
      </a>
    </nav>

    {/* ✅ Right: Student name + Menu button */}
    <div className="flex items-center gap-3">
      {studentName && (
        <div className="hidden sm:block font-semibold text-indigo-700 truncate max-w-[8rem] text-right">
          {studentName}
        </div>
      )}
      {/* Menu Button */}
      <button
        onClick={onToggle}
        className="p-2 rounded-xl bg-indigo-100 hover:bg-indigo-200 transition transform hover:scale-105 shadow-sm"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5 text-indigo-600" />
      </button>
    </div>
  </div>
</header>


)
}



export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalSessions, setTotalSessions] = useState(0);
  const [upcomingSessions, setUpcomingSessions] = useState(0);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      if (!storedUser.consentAccepted) {
        setShowConsentModal(true);
      }
    }

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

const handleConsentAccept = async () => {
  try {
    const token = localStorage.getItem("token");

    await axios.post(
      `${backend_url}/api/auth/consent`,
      { consentAccepted: true }, // ✅ send required field
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const updatedUser = { ...user, consentAccepted: true };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setShowConsentModal(false);
  } catch (err) {
    console.error("Error updating consent", err.response?.data || err.message);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-teal-50 to-teal-100 text-gray-900 flex relative">
      {/* Consent Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Consent Form</h2>

            <div className="mb-6 text-gray-700 max-h-96 overflow-y-scroll p-6 border rounded-xl bg-white shadow-inner">
              <div className="space-y-4 text-sm leading-relaxed whitespace-pre-wrap">
                <h2 className="text-lg font-bold text-gray-900">
                  Terms & Conditions for Counseling Services & Assessments
                </h2>
                <p className="text-xs text-gray-500">Last Updated: Sept 24, 2025</p>

                <p>
                  Welcome to <strong className="text-teal-700 font-bold">Mindery  </strong> We provides access to professional
                  counseling sessions and psychological assessments delivered by licensed
                  and qualified Psychologist.
                </p>

                <p>
                  By accessing/ using the Platform, booking an appointment, or
                  participating in any Services,User confirm
                  that you have read, understood, and agreed to be legally bound by these
                  Terms & Conditions.
                </p>

                {/* Section 1 */}
                <h3 className="font-semibold text-gray-800">1. Scope of Services</h3>
                <p>1.1 The Platform facilitates booking and provision of professional mental health Services, which may include:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Psychological assessments, screenings, and standardized tests.</li>
                  <li>Individual, group, couple, or family counseling/therapy sessions.</li>
                  <li>Psychoeducational support, therapeutic interventions, and referrals.</li>
                </ul>
                <p>
                  1.2 The Services are delivered by qualified Clinicians. The Platform
                  itself does not provide direct medical or psychiatric treatment and shall
                  not be construed as a healthcare provider.
                </p>
                <p>
                  1.3 The Services are intended for mental health support and
                  self-improvement purposes only and are not a substitute for psychiatric
                  hospitalization, emergency intervention, or specialized medical care.
                </p>

                {/* Section 2 */}
                <h3 className="font-semibold text-gray-800">2. Eligibility</h3>
                <p>2.1 Users must be at least 18 years of age to independently access the Services.</p>
                <p>2.2 Users under the age of 18 may only use the Services with the consent and active involvement of a parent or legal guardian.</p>
                <p>2.3 By using the Services, you represent and warrant that all information provided is accurate, truthful, and complete.</p>

                {/* Section 3 */}
                <h3 className="font-semibold text-gray-800">3. Informed Consent</h3>
                <p>
                  By booking an appointment, you voluntarily consent to participate in
                  counseling or assessments with full knowledge of:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>The nature and purpose of the Services.</li>
                  <li>The potential risks, benefits, and limitations.</li>
                  <li>The fact that results or outcomes cannot be guaranteed.</li>
                </ul>
                <p>
                  You have the right to withdraw consent and discontinue Services at any
                  time, subject to applicable cancellation policies.
                </p>

                {/* Continue same pattern for sections 4 → 14 */}

                <h3 className="font-semibold text-gray-800">14. Acceptance of Terms</h3>
                <p>
                  By proceeding with booking an appointment, creating an account, or
                  accessing the Services, you acknowledge that you:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Have read, understood, and agreed to these Terms & Conditions.</li>
                  <li>Are of legal age (or have guardian consent, if under 18).</li>
                  <li>Consent to participate in the Services provided under these terms.</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <input type="checkbox" id="consent" required />
              <label htmlFor="consent" className="text-sm text-gray-700">
                I agree to the terms and conditions.
              </label>
            </div>
            <button
              onClick={handleConsentAccept}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition"
            >
              Accept and Continue
            </button>
          </div>
        </div>
      )}

      {/* Main Dashboard Content (hidden under modal if not accepted) */}
      <div
        className={`flex flex-col flex-1 min-h-screen bg-gradient-to-b from-white to-[#fdfcff] transition-all duration-500 ease-in-out ${
          sidebarOpen ? "mr-72" : "mr-0"
        } ${showConsentModal ? "blur-sm pointer-events-none select-none" : ""}`}
      >
        {/* Navbar */}
        <Navbar onToggle={() => setSidebarOpen(true)} />

        {/* Main */}
        <main className="p-10 max-w-7xl mx-auto flex-grow">
          {/* <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
            Welcome to Mindery ✨
          </h2> */}

        {/* 🧠 Hero Section */}
<section className="w-full bg-gradient-to-r from-white via-blue-50 to-indigo-50 py-20 px-8 md:px-16 flex flex-col md:flex-row items-center justify-between rounded-3xl shadow-sm max-w-7xl mx-auto my-12">
  {/* Left Content */}
  <div className="flex-1 text-center md:text-left space-y-6">
    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
      We help students grow<br className="hidden md:block" /> 
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
        emotionally and mentally.
      </span>
    </h1>
    <p className="text-gray-600 max-w-md text-lg mx-auto md:mx-0">
      Mindery helps you assess, understand, and improve your mental wellness with guided sessions, self-assessments, and certified psychologists.
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
      <button
        onClick={() => navigate("/book-session")}
        className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition-transform hover:scale-105"
      >
        Book a Session
      </button>
      <button
        onClick={() => navigate("/resources")}
        className="border border-indigo-600 text-indigo-700 px-6 py-3 rounded-full font-semibold hover:bg-indigo-50 transition"
      >
        Explore Resources
      </button>
    </div>

    {/* Stats Row */}
    <div className="flex flex-wrap gap-8 mt-10 justify-center md:justify-start">
      <div>
        <p className="text-3xl font-bold text-indigo-600">10+</p>
        <p className="text-gray-600 text-sm">Licensed Psychologists</p>
      </div>
      <div>
        <p className="text-3xl font-bold text-indigo-600">100+</p>
        <p className="text-gray-600 text-sm">Successful Sessions</p>
      </div>
      <div>
        <p className="text-3xl font-bold text-indigo-600">98%</p>
        <p className="text-gray-600 text-sm">Positive Feedback</p>
      </div>
            <div>
        <p className="text-3xl font-bold text-indigo-600">24/7</p>
        <p className="text-gray-600 text-sm"> Service</p>
      </div>
    </div>
  </div>

  {/* Right Images */}
  <div className="flex-1 flex justify-center mt-12 md:mt-0">
    <div className="grid grid-cols-2 gap-6">
      <img
        src="https://imgs.search.brave.com/sxZuNBEfKCBFPN7Y_NMO1mxacRKBNFTnvLzfiMTq5mU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/ZnJlZS1waG90by9m/YW1pbHktdGhlcmFw/eS1wc3ljaG9sb2dp/c3Qtb2ZmaWNlXzIz/LTIxNDkxNzUxNTQu/anBnP3NlbXQ9YWlz/X2h5YnJpZA"
        alt="Doctor"
        className="rounded-3xl shadow-md bg-orange-700 object-cover h-64 w-48"
      />
      <div className="flex flex-col gap-6">
        <img
          src="https://imgs.search.brave.com/Y9s1BDpkn8dkepZVJy4XxyBGVXzP1VWPgHY-9Ozem_Y/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9wbHVz/LnVuc3BsYXNoLmNv/bS9wcmVtaXVtX3Bo/b3RvLTE2ODIxNDgz/ODA1NDMtYTZmZDQz/NjA3ZGVhP2ZtPWpw/ZyZxPTYwJnc9MzAw/MCZpeGxpYj1yYi00/LjEuMCZpeGlkPU0z/d3hNakEzZkRCOE1I/eHpaV0Z5WTJoOE1U/ZDhmSEJ6ZVdOb2FX/RjBjbWx6ZEh4bGJu/d3dmSHd3Zkh4OE1B/PT0"
          alt="Doctor"
          className="rounded-3xl shadow-md bg-purple-100 object-cover h-28 w-40"
        />
        <img
          src="https://imgs.search.brave.com/Caz-2cb_pRdstxmE_JHFU2LXI6Lqhgtr58hGqWD0xnQ/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9wc3lj/aG9sb2dpc3QtbGlz/dGVuaW5nLXRvLXBh/dGllbnQtY29uZmlk/ZW50LW1hdHVyZS1t/YWxlLXNjaG9vbC1l/eWVnbGFzc2VzLWxv/b2tpbmctdGVlbmFn/ZS10YWtpbmctbm90/ZXMtcGFwZXItZG9j/dW1lbnQtMzc3NjE1/MjY0LmpwZw"
          alt="Doctor"
          className="rounded-3xl shadow-md bg-cyan-100 object-cover h-28 w-40"
        />
      </div>
    </div>
  </div>
</section>

          {/* --- Stat Cards Section --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div
              onClick={() => navigate("/total-sessions")}
              className="bg-[#E8F0FF] rounded-2xl p-8 shadow-sm hover:shadow-md transition-all transform hover:scale-[1.02] cursor-pointer text-left"
            >
              <div className="text-blue-600 text-3xl mb-3">💙</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Total Sessions
              </h3>
              <p className="text-4xl font-bold text-blue-700">
                {totalSessions || "--"}
              </p>
            </div>

            <div className="bg-[#E8FBE8] rounded-2xl p-8 shadow-sm hover:shadow-md transition-all transform hover:scale-[1.02] text-left">
              <div className="text-green-600 text-3xl mb-3">🌿</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Upcoming Sessions
              </h3>
              <p className="text-4xl font-bold text-green-700">{upcomingSessions}</p>
            </div>

            <div className="bg-[#FFE8F0] rounded-2xl p-8 shadow-sm hover:shadow-md transition-all transform hover:scale-[1.02] text-left">
              <div className="text-pink-500 text-3xl mb-3">💖</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Availability              </h3>
              <p className="text-4xl font-bold text-pink-700">24/7</p>
            </div>
          </div>

{/* --- Assessments Section (Unlocked Version) --- */}
<section className="py-16 px-6 select-text">
  <div className="max-w-7xl mx-auto text-center">
    <h3 className="text-4xl font-bold mb-4 text-gray-900">🧠 Assessments</h3>
    <p className="text-gray-600 max-w-2xl mx-auto mb-12">
      Choose from our comprehensive collection of validated psychological instruments.
    </p>

    {loading ? (
      <div className="text-center text-gray-500">Loading assessments...</div>
    ) : (
      <div>
        {/* Scrollable Row (hidden scrollbar + reduced height cards) */}
        <div className="flex space-x-6 overflow-x-auto no-scrollbar px-2 pb-2">
          {assessments.map((a, i) => {
            const bgColors = [
              "bg-[#E8F0FF]", "bg-[#E8FBE8]", "bg-[#F3E8FF]",
              "bg-[#FFF4E5]", "bg-[#FFE8F0]", "bg-[#E8F0FF]",
            ];
            const iconColors = [
              "text-blue-500", "text-green-600", "text-purple-600",
              "text-orange-500", "text-pink-600", "text-indigo-600",
            ];
            const icons = ["❤️", "🌿", "👤", "🌡️", "💞", "⭐"];

            return (
              <div
                key={a.slug}
                onClick={() => navigate(`/assessments/${a.slug}`)} // ✅ Always clickable
                className={`${bgColors[i % bgColors.length]} shadow-md p-4 flex-shrink-0 w-[280px] h-[160px] text-left relative
                  hover:shadow-lg hover:scale-[1.03] cursor-pointer transition-transform duration-200`}
              >
                {/* Icon */}
                <div className={`text-2xl ${iconColors[i % iconColors.length]} mb-2`}>
                  {icons[i % icons.length]}
                </div>

                {/* Title */}
                <h4 className="text-base font-semibold text-gray-900 mb-3 line-clamp-1">
                  {a.title}
                </h4>

                {/* Description */}
                <p className="text-gray-700 text-xs line-clamp-2">
                  {a.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    )}
  </div>
</section>




          {/* --- Reports Button --- */}
          {/* <div className="text-center mt-0">
            <button
              onClick={() => navigate("/student-reports")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-2xl shadow-md font-semibold transition transform hover:scale-[1.03]"
            >
              📊 View Reports & Analytics
            </button>
          </div> */}
        </main>

        {/* Footer */}
  {/* Footer */}

{/* Footer */}
<footer className="bg-gradient-to-t from-gray-100 to-white border-t border-gray-300 mt-20 py-12 text-gray-700">
  <div className="max-w-7xl mx-auto px-6">
    {/* Top Section: 3 Columns */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">
      
      {/* Column 1 - About */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">About Mindery</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Mindery is your personal learning companion. Our mission is to provide
          personalized resources, guidance, and session booking to help you grow.
        </p>
      </div>

      {/* Column 2 - Quick Links */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Links</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li><a href="#" className="hover:text-indigo-600 transition-colors">Home</a></li>
          <li><a href="#" className="hover:text-indigo-600 transition-colors">Courses</a></li>
          <li><a href="#" className="hover:text-indigo-600 transition-colors">Book a Session</a></li>
          <li><a href="#" className="hover:text-indigo-600 transition-colors">Contact Us</a></li>
        </ul>
      </div>

      {/* Column 3 - Connect */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Get in Touch </h3>
        <p className="text-sm text-gray-600">
          Email: <a href="mailto:namastemindery@gmail.com" className="hover:text-indigo-600">namastemindery@gmail.com</a>
        </p>
        <div className="flex justify-center md:justify-start space-x-5 mt-5">
          <a
            href="https://www.instagram.com/mind.ery?igsh=MTFxdnM2a2Fuc291Mg=="
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-pink-600 transition-colors duration-200"
          >
            <FaInstagram size={20} />
          </a>
          
          <a href="#" className="text-gray-500 hover:text-blue-700 transition-colors duration-200">
            <FaLinkedinIn size={20} />
          </a>
        </div>
      </div>
    </div>

    {/* Bottom Section */}
    <div className="border-t border-gray-300 mt-10 pt-6 text-center text-xs text-gray-500">
      © {new Date().getFullYear()} <span className="font-medium text-gray-700">Mindery</span>. All rights reserved.
    </div>
  </div>
</footer>


      </div>


      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  );
}
