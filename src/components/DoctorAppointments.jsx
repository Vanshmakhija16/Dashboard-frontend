import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, FileText, Menu, LogOut, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const backend_url = import.meta.env.VITE_API_BASE_URL;

export default function DoctorSessions() {
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [historySessions, setHistorySessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: null,
    day: "",
    startTime: "",
    endTime: "",
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch sessions from backend
  const fetchSessions = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        date: filters.date ? filters.date.toISOString().split("T")[0] : "",
      };

      const res = await axios.get(`${backend_url}/api/sessions/my-sessions`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setUpcomingSessions(res.data.upcoming || []);
      setHistorySessions(res.data.history || []);
    } catch (err) {
      console.error(
        "Failed to fetch sessions:",
        err.response?.data || err.message
      );
      setUpcomingSessions([]);
      setHistorySessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [token]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  // -----------------------
  // Frontend filtering logic
  // -----------------------
  const filterSessions = (sessions) => {
    return sessions.filter((s) => {
      const slotStart = new Date(s.slotStart);
      const slotEnd = new Date(s.slotEnd);

      // Filter by exact date
      if (filters.date) {
        const filterDate = new Date(filters.date);
        if (
          slotStart.getFullYear() !== filterDate.getFullYear() ||
          slotStart.getMonth() !== filterDate.getMonth() ||
          slotStart.getDate() !== filterDate.getDate()
        ) {
          return false;
        }
      }

      // Filter by day of week
      if (filters.day) {
        const dayName = slotStart.toLocaleDateString("en-US", {
          weekday: "long",
        });
        if (dayName !== filters.day) return false;
      }

      // Filter by time range
      if (filters.startTime || filters.endTime) {
        const [startH, startM] = filters.startTime
          ? filters.startTime.split(":").map(Number)
          : [0, 0];
        const [endH, endM] = filters.endTime
          ? filters.endTime.split(":").map(Number)
          : [23, 59];

        const filterStart = new Date(slotStart);
        filterStart.setHours(startH, startM, 0, 0);

        const filterEnd = new Date(slotStart);
        filterEnd.setHours(endH, endM, 59, 999);

        if (slotEnd < filterStart || slotStart > filterEnd) return false;
      }

      return true;
    });
  };

  const SessionCard = ({ session }) => (
    <article className="bg-white rounded-xl shadow-lg p-6 border border-indigo-200 mb-4 hover:scale-100 transform transition-all duration-200">
      <header className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-extrabold text-xl text-indigo-900">
            {session.patientName || session.student?.name || "Unknown Student"}
          </h3>
          <p className="text-sm text-indigo-500 mt-1 select-text">
            {session.mobile || session.student?.mobile || "-"}
          </p>
        </div>
        <span
          className={`text-xs px-3 py-1 rounded-full font-semibold tracking-wider ${
            session.status === "approved"
              ? "bg-green-200 text-green-900"
              : session.status === "completed"
              ? "bg-blue-200 text-blue-900"
              : "bg-red-200 text-red-900"
          }`}
        >
          {session.status}
        </span>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-indigo-700 text-sm">
        <div>
          <p>
            <strong>Mode:</strong> {session.mode || "-"}
          </p>
          <p>
            <strong>Notes:</strong> {session.notes || "-"}
          </p>
        </div>
        <div>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(session.slotStart).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p>
            <strong>Time:</strong>{" "}
            {new Date(session.slotStart).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            -{" "}
            {new Date(session.slotEnd).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
    </article>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-tr from-indigo-50 via-white to-indigo-100">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 backdrop-blur-lg bg-white/30 shadow-xl transform transition-transform duration-300 z-50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center px-6 py-4">
          <h2 className="text-2xl font-bold text-indigo-800">Menu</h2>
          <X className="cursor-pointer" onClick={() => setSidebarOpen(false)} />
        </div>

        <nav className="flex flex-col justify-between h-[calc(100%-64px)] px-6">
          {/* Top menu items */}
          <div className="flex flex-col gap-4">
            <button className="flex items-center gap-2 bg-gray-700 text-white rounded-lg px-3 py-2 transition">
              <Calendar /> My Sessions
            </button>

            <button
              onClick={() => navigate("/reports")}
              className="flex items-center gap-2 bg-gray-700 text-white rounded-lg px-3 py-2 transition"
            >
              <FileText size={20} /> Reports
            </button>
          </div>

          {/* Logout button pinned at bottom */}
          <button
            className="flex items-center gap-2 bg-red-600 text-white rounded-2xl px-3 py-2 transition"
            onClick={handleLogout}
          >
            <LogOut /> Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Top Menu */}
        <header className="flex justify-between items-center mb-6">
          <Menu
            className="cursor-pointer text-indigo-800"
            onClick={() => setSidebarOpen(true)}
          />
          <h1 className="text-3xl font-extrabold text-indigo-800 drop-shadow-sm">
            My Sessions
          </h1>
        </header>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap items-center">
          {/* Custom Calendar */}
          <div className="relative">
            <DatePicker
              selected={filters.date}
              onChange={(date) => handleFilterChange("date", date)}
              placeholderText="Select date"
              className="border px-3 py-2 rounded-lg shadow-inner focus:ring-2 focus:ring-indigo-300 focus:outline-none"
              dateFormat="MMMM d, yyyy"
            />
            <Calendar
              className="absolute right-3 top-2.5 text-indigo-500 pointer-events-none"
              size={20}
            />
          </div>

          <select
            value={filters.day}
            onChange={(e) => handleFilterChange("day", e.target.value)}
            className="border px-3 py-2 rounded-lg shadow-inner focus:ring-2 focus:ring-indigo-300 focus:outline-none"
          >
            <option value="">All days</option>
            {[
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <input
            type="time"
            value={filters.startTime}
            onChange={(e) => handleFilterChange("startTime", e.target.value)}
            className="border px-3 py-2 rounded-lg shadow-inner focus:ring-2 focus:ring-indigo-300 focus:outline-none"
          />
          <input
            type="time"
            value={filters.endTime}
            onChange={(e) => handleFilterChange("endTime", e.target.value)}
            className="border px-3 py-2 rounded-lg shadow-inner focus:ring-2 focus:ring-indigo-300 focus:outline-none"
          />
        </div>

        {loading ? (
          <div className="text-center py-20 text-indigo-600 font-semibold">
            Loading sessions...
          </div>
        ) : (
          <>
            {/* Upcoming Sessions */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Upcoming Sessions</h2>
              {filterSessions(upcomingSessions).length === 0 ? (
                <p>No upcoming sessions</p>
              ) : (
                filterSessions(upcomingSessions).map((s) => (
                  <SessionCard key={s._id} session={s} />
                ))
              )}
            </section>

            {/* History */}
            <section className="mt-12">
              <h2 className="text-2xl font-bold mb-4">History</h2>
              {filterSessions(historySessions).length === 0 ? (
                <p>No past sessions</p>
              ) : (
                filterSessions(historySessions).map((s) => (
                  <SessionCard key={s._id} session={s} />
                ))
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
