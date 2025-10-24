// client/src/components/AssessmentPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";

const backend_url = import.meta.env.VITE_API_BASE_URL || "";

export default function AssessmentPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function fetchAssessment() {
      try {
        const res = await axios.get(`${backend_url}/api/assessments/${slug}`);
        if (!mounted) return;
        setAssessment(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error loading assessment:", err);
        setLoading(false);
      }
    }
    fetchAssessment();
    return () => (mounted = false);
  }, [slug]);

  const handleAnswer = (qid, value) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
    setTimeout(() => {
      setCurrentIndex((prev) => {
        if (prev < assessment.questions.length - 1) {
          return prev + 1;
        } else {
          handleSubmit();
          return prev;
        }
      });
    }, 200);
  };

  const handleNext = () => {
    if (currentIndex < assessment.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!assessment) return;
    const unanswered = assessment.questions.filter((q) => !answers[q.id]);
    // if (unanswered.length > 0) {
    //   // alert(`Please answer all ${assessment.questions.length} questions.`);
    //   return;
    // }
    setSubmitting(true);
    try {
      const res = await axios.post(`${backend_url}/api/assessments/${slug}/submit`, { answers });
      setReport(res.data);
    } catch (err) {
      console.error("Error submitting assessment:", err);
      alert("Failed to submit answers. Try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
      </div>
    );

  if (!assessment)
    return (
      <div className="p-6 text-red-600 text-center">
        Assessment not found
      </div>
    );

  const totalQuestions = assessment.questions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  // 🧮 Prepare chart data
  const chartData = report?.domainScores
    ? Object.entries(report.domainScores).map(([key, value]) => ({
        name: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        value: value,
      }))
    : [];

const COLORS = [
  "#2563EB", // Bright Blue
  "#10B981", // Emerald Green
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Violet
  "#0EA5E9", // Sky Blue
  "#F97316", // Orange
];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-gray-200 shadow-md p-8 sm:p-10">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
            {assessment.title}
          </h1>
          <p className="text-gray-500 mt-2 text-lg">{assessment.description}</p>
        </div>

        {report ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-3xl bg-gray-50 text-center border border-gray-200"
          >
            <h2 className="text-2xl font-semibold text-blue-700 mb-4">
              Your Results
            </h2>

            {/* ======= Summary Section (Gauge + Info) ======= */}
            {(() => {
              const percentage = report?.percentage || Math.round((report.score / (report.maxScore || 100)) * 100);
              const maxScore = report?.maxScore || 100;
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                  {/* Gauge */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col justify-center items-center">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Overall Score
                    </h3>
                    <div className="relative flex justify-center items-center">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle cx="64" cy="64" r="56" stroke="#E5E7EB" strokeWidth="12" fill="none" />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="#3B82F6"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={2 * Math.PI * 56}
                          strokeDashoffset={2 * Math.PI * 56 * (1 - percentage / 100)}
                          strokeLinecap="round"
                          className="transition-all duration-700 ease-out"
                        />
                      </svg>
                      <div className="absolute text-center">
                        <p className="text-3xl font-bold text-gray-800">{percentage}%</p>
                        <p className="text-sm text-gray-500">of Total</p>
                      </div>
                    </div>
                    <p className="mt-4 text-gray-700 font-medium">
                      Score: {report.score} / {maxScore}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{report.message}</p>
                  </div>

            {/* Personalized Narrative */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mt-6 text-left">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Personalized Narrative</h3>
              <p className="text-gray-700 text-sm mb-4">
                <strong className="text-blue-700">Insight:</strong> Your responses suggest that
                negative thinking patterns are influencing your current emotional state.
              </p>
            </div>
                </div>
              );
            })()}

            {/* ======= Domain Overview Charts ======= */}
            {chartData.length > 0 && (
              <>
                {/* Radar + Pie */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 text-left">
                  {/* Radar Chart */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 text-center">
                      🧭 Radar — Domain Profile
                    </h3>
                    <div className="h-64 flex justify-center">
                      <RadarChart
                        cx="50%"
                        cy="50%"
                        outerRadius="80%"
                        width={300}
                        height={250}
                        data={chartData}
                      >
                        <PolarGrid />
                        <PolarAngleAxis dataKey="name" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar
                          name="Profile"
                          dataKey="value"
                          stroke="#4F46E5"
                          fill="#4F46E5"
                          fillOpacity={0.5}
                          isAnimationActive
                        />
                      </RadarChart>
                    </div>
                  </div>

                  {/* Pie Chart */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col items-center">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 text-center">
                      🥧 Domain Proportions
                    </h3>
                    <div className="h-64">
                      <PieChart width={300} height={250}>
                        <Pie
                          data={chartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          label
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </div>
                  </div>
                </div>


{/* Bar Chart */}
<div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mt-10">
  <h3 className="text-lg font-semibold mb-3 text-gray-800 text-center">
    📊 Domain Score Distribution
  </h3>
  <div className="flex justify-center">
    <BarChart
      width={520}
      height={340}
      data={chartData}
      margin={{ top: 50, right: 30, left: 30, bottom: 70 }}
    >
      <XAxis
        dataKey="name"
        tick={{
          fill: "#1E293B",
          fontSize: 13,
          fontWeight: 500,
          dy: 35, // pushes labels down for space
        }}
        interval={0}
        angle={-20}
        textAnchor="end"
      />
      <YAxis
        tick={{ fill: "#64748B", fontSize: 12 }}
        tickLine={false}
        axisLine={{ stroke: "#E2E8F0" }}
      />
      <Tooltip
        cursor={{ fill: "rgba(79,70,229,0.06)" }}
        contentStyle={{
          backgroundColor: "#fff",
          borderRadius: "10px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      />
      <Legend />
      <Bar
        dataKey="value"
        barSize={45}
        radius={[10, 10, 0, 0]}
        label={{
          position: "top",
          fill: "#111827",
          fontSize: 12,
          fontWeight: 600,
          dy: -5, // adds margin between top of bar and label
        }}
      >
        {chartData.map((entry, index) => (
          <Cell
            key={`bar-${index}`}
            fill={COLORS[index % COLORS.length]}
          />
        ))}
      </Bar>
    </BarChart>
  </div>
</div>


              </>
            )}
<div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mt-10">
  <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
    ⚠️ Important Notes & Limitations
  </h3>
  <ul className="list-disc list-outside pl-5 text-gray-700 space-y-2 text-sm leading-relaxed">
    <li>
      This assessment is a <strong>screening tool</strong> and should not be used as the sole basis for diagnosis.
    </li>
    <li>
      Results should be interpreted by <strong>qualified mental health professionals</strong>.
    </li>
    <li>
      Individual <strong>circumstances and context</strong> should always be considered.
    </li>
    <li>
      If you have concerns about your mental health, please consult with a <strong>licensed healthcare provider</strong>.
    </li>
    <li>
      This report is <strong>confidential</strong> and should be shared only with appropriate healthcare professionals.
    </li>
  </ul>
</div>



            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate("/student-dashboard")}
              className="mt-8 bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-medium shadow-sm transition"
            >
              Back to Dashboard
            </motion.button>
          </motion.div>
        ) : (
          <>
            {/* Progress Tracker */}
            <div className="mb-8">
              <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
                <span>Question {currentIndex + 1} of {totalQuestions}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <motion.div
                  className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                ></motion.div>
              </div>
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="mb-10 bg-gray-50 border border-gray-200 rounded-2xl p-8"
              >
                <p className="font-semibold text-xl mb-6 text-gray-800">
                  {currentIndex + 1}. {assessment.questions[currentIndex].text}
                </p>
                {assessment.questions[currentIndex].options?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {assessment.questions[currentIndex].options.map((opt) => (
                      <motion.label
                        key={opt}
                        whileHover={{ scale: 1.02 }}
                        className={`p-4 rounded-xl border cursor-pointer text-gray-700 transition ${
                          answers[assessment.questions[currentIndex].id] === opt
                            ? "bg-blue-50 border-blue-400 text-blue-700 font-medium"
                            : "bg-white border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name={assessment.questions[currentIndex].id}
                          value={opt}
                          checked={answers[assessment.questions[currentIndex].id] === opt}
                          onClick={() => handleAnswer(assessment.questions[currentIndex].id, opt)}
                          className="hidden"
                        />
                        {opt}
                      </motion.label>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={answers[assessment.questions[currentIndex].id] || ""}
                    onChange={(e) => handleAnswer(assessment.questions[currentIndex].id, e.target.value)}
                    placeholder="Type your answer here..."
                    className="border border-gray-300 p-4 w-full rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none text-gray-800"
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              {currentIndex > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={handlePrevious}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-xl font-medium shadow-sm"
                >
                  ← Previous
                </motion.button>
              )}
              <div className="ml-auto flex gap-4">
                {currentIndex < assessment.questions.length - 1 ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleNext}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl font-medium shadow-sm"
                  >
                    Next →
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleSubmit}
                    disabled={submitting}
                    className={`${
                      submitting ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
                    } text-white px-6 py-2 rounded-xl font-medium shadow-sm`}
                  >
                    {submitting ? "Submitting..." : "Submit"}
                  </motion.button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
