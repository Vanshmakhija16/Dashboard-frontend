import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import { Calendar, CheckCircle, XCircle, Menu, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const backend_url = import.meta.env.VITE_API_BASE_URL;

export default function PendingAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Sidebar hidden by default
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
          console.log("Fetching appointments with token:", !!token); // Add this

      const res = await axios.get(`${backend_url}/api/appointments/appointments/pending`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { search },
      });
      
      setAppointments(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch pending appointments:", err.response?.data || err.message);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function
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

  const handleUpdateStatus = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus} this appointment?`)) return;

    try {
      await axios.patch(
        `${backend_url}/api/admin/appointments/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAppointments((prev) => prev.filter((a) => a._id !== id));

      if (newStatus === "approved") navigate("/admin/approved-appointments");
      else if (newStatus === "rejected") navigate("/admin/rejected-appointments");
    } catch (err) {
      console.error("Failed to update status:", err.response?.data || err.message);
      alert("Failed to update appointment status. See console.");
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-tr from-indigo-50 via-white to-indigo-100">
      {/* Glassmorphism Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 
          bg-white/20 backdrop-blur-xl border-r border-white/30 
          shadow-2xl ring-1 ring-white/10
          transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          transition-transform duration-300 ease-in-out z-30 
          md:translate-x-0 md:static md:shadow-none 
          rounded-r-3xl backdrop-saturate-150`}
      >
        <div className="flex flex-col h-full">
          <div className="px-6 py-6 border-b border-white/20 flex items-center justify-between">
            <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-3 select-none drop-shadow-md">
              <Calendar size={28} className="text-indigo-500 drop-shadow-sm" /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Admin Panel
              </span>
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-700 hover:text-slate-900 rounded-lg transition"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>
          <nav className="flex flex-col flex-grow p-6 space-y-5 text-slate-800 text-lg font-semibold select-none">
            <button 
              onClick={() => {setSidebarOpen(false); navigate("/admin-dashboard");}}
              className="flex items-center gap-3 py-3 px-4 rounded-2xl 
                bg-white/40 backdrop-blur-md border border-white/30 
                hover:bg-white/50 shadow-lg hover:shadow-xl 
                transition-all duration-300 group"
            >
              <Calendar size={22} className="group-hover:scale-110 transition-transform duration-300" /> 
              Dashboard
            </button>
            <button
              className="flex items-center gap-3 py-3 px-4 rounded-2xl 
                bg-gradient-to-r from-indigo-200/60 to-purple-200/60 
                backdrop-blur-md border border-white/40 shadow-lg 
                ring-2 ring-indigo-300/30 cursor-default"
              aria-current="page"
            >
              <Calendar size={22} className="text-indigo-600" /> 
              Pending Requests
            </button>
            <button
              className="flex items-center gap-3 py-3 px-4 rounded-2xl 
                bg-white/30 backdrop-blur-md border border-white/20 
                hover:bg-white/50 hover:shadow-lg 
                transition-all duration-300 group"
              onClick={() => {setSidebarOpen(false); navigate("/admin/approved-appointments");}}
            >
              <CheckCircle size={22} className="group-hover:scale-110 transition-transform duration-300" /> 
              Approved Sessions
            </button>
            <button
              className="flex items-center gap-3 py-3 px-4 rounded-2xl 
                bg-white/30 backdrop-blur-md border border-white/20 
                hover:bg-white/50 hover:shadow-lg 
                transition-all duration-300 group"
              onClick={() => {setSidebarOpen(false); navigate("/admin/rejected-appointments");}}
            >
              <XCircle size={22} className="group-hover:scale-110 transition-transform duration-300" /> 
              Rejected Sessions
            </button>
            <button
              onClick={handleLogout}
              className="mt-auto bg-gradient-to-r from-pink-500/80 to-red-500/80 
                hover:from-pink-400 hover:to-red-400 text-white font-bold 
                rounded-3xl px-7 py-3 shadow-2xl backdrop-blur-lg 
                ring-2 ring-pink-300/30 hover:ring-red-300/50
                transition-all duration-300 transform hover:scale-105 active:scale-95"
              aria-label="Logout"
            >
              <LogOut size={20} className="inline mr-2" />
              Logout
            </button>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Header with Menu Icon for Sidebar */}
        <header className="bg-white/70 backdrop-blur-lg shadow-lg flex items-center justify-between px-8 py-5 sticky top-0 z-10 rounded-b-3xl border-b border-white/20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-md text-indigo-600 hover:text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-transform active:scale-95"
            aria-label="Open sidebar"
          >
            <Menu size={28} />
          </button>
          <h2 className="text-3xl font-extrabold text-indigo-800 tracking-tight select-none drop-shadow-sm">
            Pending Requests
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
            <div className="text-center py-20 text-indigo-600 font-semibold">Loading pending requests...</div>
          ) : appointments.length === 0 ? (
            <div className="text-center text-indigo-600 py-20 text-xl font-semibold select-none">
              No pending appointments found.
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
                    className="text-xs px-3 py-1 rounded-full font-semibold tracking-wider bg-yellow-200 text-yellow-900 select-none"
                    aria-label="Status: pending"
                  >
                    pending
                  </span>
                </header>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-indigo-700 text-sm">
                  <div>
                    <p>
                      <strong>Doctor:</strong> {appt.doctor?.name || "N/A"}{" "}
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
                <div className="flex gap-5 mt-6">
                  <button
                    onClick={() => handleUpdateStatus(appt._id, "approved")}
                    className="flex-1 py-3 flex items-center justify-center gap-3 bg-green-600 text-white rounded-3xl shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-green-300"
                    aria-label="Approve appointment"
                  >
                    <CheckCircle size={20} /> Approve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(appt._id, "rejected")}
                    className="flex-1 py-3 flex items-center justify-center gap-3 bg-red-600 text-white rounded-3xl shadow-lg hover:bg-red-700 transition-transform transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-300"
                    aria-label="Reject appointment"
                  >
                    <XCircle size={20} /> Reject
                  </button>
                </div>
              </article>
            ))
          )}
        </main>
      </div>
    </div>
  );
}
