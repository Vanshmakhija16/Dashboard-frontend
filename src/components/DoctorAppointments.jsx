import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import { CheckCircle, XCircle, Menu, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const backend_url = import.meta.env.VITE_API_BASE_URL;

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch pending appointments
  const fetchAppointments = async (search = "") => {
    setLoading(true);
    try {
      const res = await axios.get(`${backend_url}/api/appointments/appointments/pending`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: "pending", search },
      });
      setAppointments(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch pending appointments:", err.response?.data || err.message);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
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
  }, []);

  // Update appointment status
  const handleUpdateStatus = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus} this appointment?`)) return;

    try {
      await axios.patch(
        `${backend_url}/api/appointments/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (newStatus === "approved") {
        navigate("/doctor/approved-appointments");
      } else if (newStatus === "rejected") {
        navigate("/doctor/rejected-appointments");
      } else {
        fetchAppointments(searchTerm);
      }
    } catch (err) {
      console.error("Failed to update status:", err.response?.data || err.message);
      alert("Failed to update appointment status. See console.");
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl p-6 transform transition-transform duration-300 z-20 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <h2 className="text-xl font-bold text-indigo-800 mb-6">Doctor Dashboard</h2>

        {/* Links */}
        <button
          onClick={() => navigate("/doctor/approved-appointments")}
          className="w-full px-4 py-3 rounded-xl bg-indigo-500 text-white font-semibold mt-3 shadow hover:bg-indigo-600 transition"
        >
          Approved Requests
        </button>
        <button
          onClick={() => navigate("/doctor/rejected-appointments")}
          className="w-full px-4 py-3 rounded-xl bg-indigo-500 text-white font-semibold mt-3 shadow hover:bg-indigo-600 transition"
        >
          Rejected Requests
        </button>

        {/* Logout at bottom */}
        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 rounded-xl bg-red-500 text-white font-semibold mt-3 shadow hover:bg-red-600 transition flex items-center justify-center gap-2"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col p-8 transition-all duration-500">
        {/* Menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="mb-4 p-3 rounded-full bg-white shadow-lg hover:scale-105 transition w-fit"
        >
          <Menu size={22} />
        </button>

        <h1 className="text-3xl font-bold text-indigo-800 mb-6">My Pending Appointments</h1>

        {/* Search */}
        <div className="mb-6 flex gap-3">
          <input
            type="text"
            placeholder="Search by student or notes"
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

        {loading ? (
          <div className="text-indigo-600 font-semibold text-center py-20">
            Loading pending appointments...
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-indigo-600 font-semibold text-center py-20">
            No pending appointments found.
          </div>
        ) : (
          appointments.map((appt) => (
            <div
              key={appt._id}
              className="bg-white shadow-md rounded-xl p-6 mb-4 border border-indigo-200"
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-bold text-lg text-indigo-900">
                  {appt.student?.name || "Unknown Student"}
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-200 text-yellow-900">
                  Pending
                </span>
              </div>

              <p><strong>Email:</strong> {appt.student?.email || "-"}</p>
              <p><strong>Phone:</strong> {appt.student?.phone || "-"}</p>
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
                {new Date(appt.slotStart).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                -{" "}
                {new Date(appt.slotEnd).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p><strong>Mode:</strong> {appt.mode || "-"}</p>
              <p><strong>Notes:</strong> {appt.notes || "-"}</p>

              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => handleUpdateStatus(appt._id, "approved")}
                  className="flex-1 py-2 bg-green-600 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 transition"
                >
                  <CheckCircle size={20} /> Approve
                </button>
                <button
                  onClick={() => handleUpdateStatus(appt._id, "rejected")}
                  className="flex-1 py-2 bg-red-600 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-red-700 transition"
                >
                  <XCircle size={20} /> Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
