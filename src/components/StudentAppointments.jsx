// frontend/pages/StudentAppointments.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const backend_url = import.meta.env.VITE_API_BASE_URL;

export default function StudentAppointments() {
  const [appointments, setAppointments] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${backend_url}/api/appointments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointments(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetch();

    // optional: poll every 15 seconds to see status change
    const interval = setInterval(fetch, 15000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Booked Sessions</h1>
      {appointments.length === 0 && <p>No sessions yet.</p>}
      <div className="grid gap-4">
        {appointments.map(a => (
          <div key={a._id} className="bg-white p-4 rounded shadow">
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">{a.doctor?.name || "Doctor not assigned"}</p>
                <p className="text-sm text-gray-500">{a.doctor?.specialization || ""}</p>
              </div>
              <span className="text-sm text-gray-600">{a.status}</span>
            </div>
            <p className="mt-2">{new Date(a.slotStart).toLocaleString()} - {new Date(a.slotEnd).toLocaleTimeString()}</p>
            <p className="mt-1 text-sm">{a.notes || "-"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
