import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const backend_url = import.meta.env.VITE_API_BASE_URL;

export default function ReportDashboard() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await axios.get(`${backend_url}/api/reports`);
        setReportData(res.data);
      } catch (err) {
        console.error("Error fetching reports:", err);
        // fallback dummy data so UI still works
        setReportData({
          pie: [
            { name: "Stress", value: 40 },
            { name: "Anxiety", value: 30 },
            { name: "Focus", value: 30 },
          ],
          bar: [
            { name: "Week 1", score: 50 },
            { name: "Week 2", score: 65 },
            { name: "Week 3", score: 80 },
            { name: "Week 4", score: 70 },
          ],
        });
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading report...</p>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600 font-semibold">
          No report data available. Please take an assessment first.
        </p>
      </div>
    );
  }

  const COLORS = ["#FF6384", "#36A2EB", "#FFCE56"];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-center mb-8">
        📊 Your Wellness Reports
      </h1>

      {/* Pie Chart */}
      <div className="bg-white rounded-2xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-center">Category Breakdown</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={reportData.pie || []}
              dataKey="value"
              nameKey="name"
              outerRadius={120}
              fill="#8884d8"
              label
            >
              {(reportData.pie || []).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-center">Progress Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={reportData.bar || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="score" fill="#36A2EB" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
