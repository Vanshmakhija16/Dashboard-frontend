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
import { motion } from "framer-motion";

const backend_url = import.meta.env.VITE_API_BASE_URL || "";

export default function ReportDashboard() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await axios.get(`${backend_url}/api/reports`);
        setReportData(res.data.assessments?.[0] || null);
      } catch (err) {
        console.error("Error fetching reports:", err);
        // Fallback demo data
        setReportData({
          title: "Stress & Focus Assessment",
          score: 78,
          categories: [
            { name: "Stress", value: 40 },
            { name: "Anxiety", value: 25 },
            { name: "Focus", value: 13 },
          ],
          weeklyProgress: [
            { week: "Week 1", score: 50 },
            { week: "Week 2", score: 65 },
            { week: "Week 3", score: 78 },
            { week: "Week 4", score: 82 },
          ],
        });
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, []);

  const COLORS = ["#00b4d8", "#48cae4", "#90e0ef"];

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100">
        <p className="text-cyan-700 font-medium text-lg animate-pulse">
          Loading Report...
        </p>
      </div>
    );

  if (!reportData)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100">
        <p className="text-red-600 font-semibold">
          No report data found. Please take an assessment.
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100 p-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-cyan-900 mb-2">
          {reportData.title}
        </h1>
        <p className="text-gray-600 text-lg">
          Comprehensive mental wellness report overview
        </p>
      </div>

      {/* Main Report Container */}
      <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-lg shadow-xl rounded-3xl p-10 border border-white/30 space-y-10">
        {/* Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-cyan-600 to-cyan-400 text-white rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center"
          >
            <p className="text-lg font-medium">Total Score</p>
            <p className="text-5xl font-extrabold mt-2">{reportData.score}</p>
          </motion.div>

          {reportData.categories.map((cat, i) => (
            <motion.div
              whileHover={{ scale: 1.05 }}
              key={i}
              className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex flex-col items-center justify-center"
            >
              <p className="text-gray-600 font-medium">{cat.name}</p>
              <p className="text-3xl font-bold text-cyan-700 mt-2">
                {cat.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          {/* Pie Chart */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-xl font-semibold text-cyan-800 text-center mb-4">
              Category Breakdown
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportData.categories}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                  label
                >
                  {reportData.categories.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Bar Chart */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-xl font-semibold text-cyan-800 text-center mb-4">
              Weekly Progress Trend
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.weeklyProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="#00b4d8" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Analysis Section */}
        <div className="bg-gradient-to-br from-cyan-50 to-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-cyan-800 mb-3">
            🩺 Doctor’s Insights
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Based on the current assessment, your overall stress levels show a
            balanced improvement trajectory with consistent weekly growth. The
            anxiety index has slightly decreased, while focus retention has
            improved by 20%. Continue meditation and breathing sessions daily
            for optimal results.
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-gray-500 mt-10 text-sm">
        © {new Date().getFullYear()} MindBalance Analytics. All rights reserved.
      </p>
    </div>
  );
}
