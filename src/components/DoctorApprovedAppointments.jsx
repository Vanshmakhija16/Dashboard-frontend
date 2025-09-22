import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import debounce from "lodash.debounce";

const backend_url = import.meta.env.VITE_API_BASE_URL;

export default function DoctorApprovedAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const token = localStorage.getItem("token");

  // Fetch approved appointments for the logged-in doctor
  const fetchAppointments = async (search = "") => {
    setLoading(true);
    try {
      const res = await axios.get(`${backend_url}/api/appointments/approved`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: "approved", search },
      });
      setAppointments(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch approved appointments:", err.response?.data || err.message);
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

  // Handle search input change
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchAppointmentsDebounced(value);
  };

  // Handle Enter key press for search
  const onEnterPress = (e) => {
    if (e.key === "Enter") {
      fetchAppointments(searchTerm);
    }
  };

  // Fetch appointments on component mount
  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-indigo-800 mb-6">My Approved Appointments</h1>

      {/* Search input */}
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
          Loading approved appointments...
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-indigo-600 font-semibold text-center py-20">
          No approved appointments found.
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
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-200 text-green-900">
                Approved
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
          </div>
        ))
      )}
    </div>
  );
}