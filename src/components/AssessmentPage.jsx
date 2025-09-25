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
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function fetchAssessment() {
      try {
        // ✅ Fetch assessment data
        const res = await axios.get(`${backend_url}/api/assessments/${slug}`);
        if (!mounted) return;

        setAssessment(res.data);

        // ✅ Also check lock/unlock status from backend
        const studentId = localStorage.getItem("studentId"); // assumes login sets this
        if (studentId) {
          const statusRes = await axios.get(
            `${backend_url}/api/assessments/my/${studentId}`
          );
          const assigned = statusRes.data.find((a) => a.assessmentId === res.data.id);
          if (assigned && assigned.status === "locked") {
            setLocked(true);
          }
        }

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

  const handleSubmit = async () => {
    if (!assessment) return;

    // Check if all questions are answered
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

  if (loading) return <div className="p-6">Loading assessment...</div>;
  if (!assessment) return <div className="p-6 text-red-600">Assessment not found</div>;

  // ✅ If locked → show lock screen
  if (locked) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-gray-700 mb-4">🔒 Assessment Locked</h1>
        <p className="text-gray-600 mb-6">
          This assessment has been assigned to you but is currently locked.
          Please wait for your admin/university to unlock it.
        </p>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl shadow-lg"
          onClick={() => navigate("/student-dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-3">{assessment.title}</h1>
      <p className="text-gray-600 mb-6">{assessment.description}</p>

      {report ? (
        <div className="p-6 border rounded-xl bg-green-50 shadow-md">
          <h2 className="text-xl font-bold text-green-700 mb-2">Your Score</h2>
          <p className="text-lg font-semibold">{report.score}</p>
          <h1 className="mt-4 text-gray-700 font-bold">
            You have a {report.message}
          </h1>
          <button
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl"
            onClick={() => navigate("/student-dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      ) : (
        <>
          {assessment.questions.map((q, i) => (
            <div key={q.id} className="mb-6 p-4 border rounded-xl shadow-sm">
              <p className="font-semibold mb-3">
                {i + 1}. {q.text}
              </p>

              {q.options?.length > 0 ? (
                q.options.map((opt) => (
                  <label key={opt} className="block mb-2 cursor-pointer">
                    <input
                      type="radio"
                      name={q.id}
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={() => handleAnswer(q.id, opt)}
                      className="mr-2"
                    />
                    {opt}
                  </label>
                ))
              ) : (
                <input
                  type="text"
                  value={answers[q.id] || ""}
                  onChange={(e) => handleAnswer(q.id, e.target.value)}
                  className="border p-2 w-full rounded"
                />
              )}
            </div>
          ))}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl shadow-lg"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </>
      )}
    </div>
  );
}
