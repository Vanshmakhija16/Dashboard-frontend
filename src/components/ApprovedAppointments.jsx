import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import { Calendar, CheckCircle, XCircle, Menu, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const backend_url = import.meta.env.VITE_API_BASE_URL;

export default function ApprovedAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const fetchAppointments = async (search = "") => {
    setLoading(true);
    try {
      const res = await axios.get(`${backend_url}/api/admin/approved`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { search }, // search param for backend filtering
      });
      setAppointments(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch approved appointments:", err.response?.data || err.message);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search to limit frequent API calls
  const fetchAppointmentsDebounced = useCallback(
    debounce((search) => {
      fetchAppointments(search);
    }, 300),
    []
  );

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchAppointmentsDebounced(value);
  };

  const onEnterPress = (e) => {
    if (e.key === "Enter") {
      fetchAppointments(searchTerm);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [token]);

  return (
    <div className="flex h-screen bg-gradient-to-tr from-indigo-50 via-white to-indigo-100">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-2xl transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-30 md:translate-x-0 md:static md:shadow-none rounded-r-3xl`}
      >
        <div className="flex flex-col h-full">
          <div className="px-6 py-6 border-b border-indigo-200 flex items-center justify-between">
            <h1 className="text-2xl font-extrabold text-indigo-700 flex items-center gap-3 select-none">
              <Calendar size={28} className="text-indigo-500" /> Admin Panel
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-indigo-600 hover:text-indigo-800 rounded-lg transition"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>
          <nav className="flex flex-col flex-grow p-6 space-y-5 text-indigo-700 text-lg font-semibold select-none">
            <button
              onClick={() => navigate("/admin-dashboard")}
              className="flex items-center gap-3 py-3 px-4 rounded-2xl bg-indigo-100 cursor-default"
            >
              <Calendar size={22} /> Dashboard
            </button>
            <button
              className="flex items-center gap-3 py-3 px-4 rounded-2xl hover:bg-indigo-50 transition-colors"
              onClick={() => navigate("/admin/appointments")}
            >
              <Calendar size={22} /> Pending Requests
            </button>
            <button
              className="flex items-center gap-3 py-3 px-4 rounded-2xl bg-indigo-100 shadow-inner cursor-default"
              aria-current="page"
            >
              <CheckCircle size={22} /> Approved Sessions
            </button>
            <button
              className="flex items-center gap-3 py-3 px-4 rounded-2xl hover:bg-indigo-50 transition-colors"
              onClick={() => navigate("/admin/rejected-appointments")}
            >
              <XCircle size={22} /> Rejected Sessions
            </button>
            <button
              onClick={handleLogout}
              className="mt-auto bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-bold rounded-3xl px-7 py-3 shadow-lg transition transform hover:scale-105"
              aria-label="Logout"
            >
              Logout
            </button>
          </nav>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-lg flex items-center justify-between px-8 py-5 sticky top-0 z-10 rounded-b-3xl">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-md text-indigo-600 hover:text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-transform active:scale-95"
            aria-label="Open sidebar"
          >
            <Menu size={28} />
          </button>
          <h2 className="text-3xl font-extrabold text-indigo-800 tracking-tight select-none drop-shadow-sm">
            Approved Sessions
          </h2>
        </header>

        {/* Search input */}
        <div className="p-8 max-w-4xl w-full mx-auto flex gap-3">
          <input
            type="text"
            placeholder="Search by student or doctor"
            value={searchTerm}
            onChange={handleSearchInputChange}
            onKeyDown={onEnterPress}
            className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => fetchAppointments(searchTerm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
          >
            Search
          </button>
        </div>

        <main className="p-8 max-w-4xl w-full mx-auto space-y-6">
          {loading ? (
            <div className="text-center py-20 text-indigo-600 font-semibold">Loading approved sessions...</div>
          ) : appointments.length === 0 ? (
            <div className="text-center text-indigo-600 py-20 text-xl font-semibold select-none">
              No approved sessions found.
            </div>
          ) : (
            appointments.map((appt) => (
              <article
                key={appt._id}
                className="bg-white rounded-xl shadow-lg p-6 border border-indigo-200"
              >
                <header className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-extrabold text-xl text-indigo-900">
                     {appt.patientName || appt.student?.name || "Unknown Student"}
                    </h3>
                    <p className="text-sm text-indigo-500 mt-1 select-text">
                      {appt.phone || appt.student?.phone || "-"}
                    </p>
                  </div>
                  <span
                    className="text-xs px-3 py-1 rounded-full font-semibold tracking-wider bg-green-200 text-green-900 select-none"
                    aria-label="Status: approved"
                  >
                    approved
                  </span>
                </header>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-indigo-700 text-sm">
                  <div>
                    <p>
                      <strong>Doctor:</strong>{" "}
                      {appt.doctor?.name || "N/A"}{" "}
                      {appt.doctor?.specialization ? `(${appt.doctor.specialization})` : ""}
                    </p>
                    <p>
                      <strong>Mode:</strong> {appt.mode || "-"}
                    </p>
                    <p>
                      <strong>Notes:</strong> {appt.notes || "-"}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(appt.slotStart).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p>
                      <strong>Time:</strong>{" "}
                      {new Date(appt.slotStart).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {new Date(appt.slotEnd).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </article>
            ))
          )}
        </main>
      </div>
    </div>
  );
}
