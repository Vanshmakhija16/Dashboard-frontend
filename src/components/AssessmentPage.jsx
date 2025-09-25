// client/src/components/AssessmentPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

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
    if (unanswered.length > 0) {
      alert(`Please answer all ${assessment.questions.length} questions.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post(
        `${backend_url}/api/assessments/${slug}/submit`,
        { answers }
      );
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
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  if (!assessment)
    return <div className="p-6 text-red-600">Assessment not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-teal-50 p-6">
      <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          {assessment.title}
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          {assessment.description}
        </p>

        {report ? (
          <div className="p-6 border rounded-2xl bg-gradient-to-r from-green-50 to-green-100 shadow-md text-center">
            <h2 className="text-2xl font-bold text-green-700 mb-4">
              🎉 Your Results
            </h2>
            <p className="text-5xl font-extrabold text-green-600 mb-2">
              {report.score}
            </p>
            <p className="text-lg text-gray-700 font-semibold mb-6">
              You have a {report.message}
            </p>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg transition transform hover:scale-105"
              onClick={() => navigate("/student-dashboard")}
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <>
            {/* ✅ Current Question */}
            {assessment.questions.length > 0 && (
              <div className="mb-6 p-6 border rounded-2xl shadow-md bg-gray-50 hover:shadow-lg transition">
                <p className="font-semibold text-lg mb-4 text-gray-800">
                  {currentIndex + 1}. {assessment.questions[currentIndex].text}
                </p>

                {assessment.questions[currentIndex].options?.length > 0 ? (
                  <div className="space-y-3">
                    {assessment.questions[currentIndex].options.map((opt) => (
                      <label
                        key={opt}
                        className={`block p-3 rounded-xl cursor-pointer border transition hover:shadow ${
                          answers[assessment.questions[currentIndex].id] === opt
                            ? "bg-blue-100 border-blue-500"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name={assessment.questions[currentIndex].id}
                          value={opt}
                          checked={
                            answers[assessment.questions[currentIndex].id] ===
                            opt
                          }
                          onChange={() =>
                            handleAnswer(
                              assessment.questions[currentIndex].id,
                              opt
                            )
                          }
                          className="mr-2 hidden"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={answers[assessment.questions[currentIndex].id] || ""}
                    onChange={(e) =>
                      handleAnswer(
                        assessment.questions[currentIndex].id,
                        e.target.value
                      )
                    }
                    placeholder="Type your answer here..."
                    className="border p-3 w-full rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            )}

            {/* ✅ Navigation Buttons */}
            <div className="flex justify-between mt-6">
              {currentIndex > 0 && (
                <button
                  onClick={handlePrevious}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-xl shadow-md transition transform hover:scale-105"
                >
                  ← Previous
                </button>
              )}

              {currentIndex < assessment.questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl shadow-md transition transform hover:scale-105 ml-auto"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl shadow-lg transition transform hover:scale-105 ml-auto disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Submit ✅"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
