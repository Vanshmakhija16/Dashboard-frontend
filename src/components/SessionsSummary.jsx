// client/src/components/SessionsSummary.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const backend_url = import.meta.env.VITE_API_BASE_URL || "";

export default function SessionsSummary() {
  const [loading, setLoading] = useState(true);
  const [attendedCount, setAttendedCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");

    async function fetchData() {
      try {
        // Fetch attended sessions
        // const attendedRes = await axios.get(
        //   `${backend_url}/api/appointments/my/attended`,
        //   { headers: { Authorization: `Bearer ${token}` } }
        // );

        // Fetch upcoming sessions
        const upcomingRes = await axios.get(
          `${backend_url}/api/appointments/my/upcoming`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // set counts
        const attended = attendedRes.data.count || 0;
        const upcoming = upcomingRes.data.count || 0;
        const total = attended + upcoming;

        setAttendedCount(attended);
        setUpcomingCount(upcoming);
        setTotalCount(total);
      } catch (err) {
        console.error("Error fetching session data", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">Loading session stats...</div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
      {/* Total Sessions */}
      <div className="bg-blue-100/40 rounded-2xl shadow-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Sessions</h3>
        <p className="text-3xl font-bold text-blue-600">{totalCount}</p>
      </div>

      {/* Attended Sessions */}
      <div className="bg-green-100/40 rounded-2xl shadow-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Attended</h3>
        <p className="text-3xl font-bold text-green-600">{attendedCount}</p>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-yellow-100/40 rounded-2xl shadow-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Upcoming</h3>
        <p className="text-3xl font-bold text-yellow-600">{upcomingCount}</p>
      </div>
    </div>
  );
}
