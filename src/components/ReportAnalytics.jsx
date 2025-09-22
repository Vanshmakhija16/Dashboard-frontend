import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const backend_url = import.meta.env.VITE_API_BASE_URL;

export default function ReportsAnalytics() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await axios.get(`${backend_url}/api/reports/summary`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, []);

  if (loading) {
    return <div className="text-center mt-20 text-gray-600">Loading report data...</div>;
  }

  if (!data.length) {
    return <div className="text-center mt-20 text-gray-600">No report data available.</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-white rounded-2xl shadow-lg mt-8">
      <h1 className="text-3xl font-bold mb-8 text-indigo-700 select-none">📊 Reports & Analytics</h1>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="assessment" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="lowRisk" fill="#34d399" name="Low Risk" />
          <Bar dataKey="moderateRisk" fill="#fbbf24" name="Moderate Risk" />
          <Bar dataKey="highRisk" fill="#ef4444" name="High Risk" />
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-6 text-gray-700 max-w-2xl mx-auto text-center">
        Summary of assessment outcomes across users.
      </p>
    </div>
  );
}
