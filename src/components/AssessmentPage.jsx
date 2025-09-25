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
  const [currentIndex, setCurrentIndex] = useState(0); // ✅ track current question index

  useEffect(() => {
    let mounted = true;
    async function fetchAssessment() {
      try {
        const res = await axios.get(`${backend_url}/api/assessments/${slug}`);
        if (!mounted) return;

        setAssessment(res.data);

        const studentId = localStorage.getItem("studentId");
        if (studentId) {
          const statusRes = await axios.get(
            `${backend_url}/api/assessments/my/${studentId}`
          );
          const assigned = statusRes.data.find(
            (a) => a.assessmentId === res.data.id
          );
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

  if (loading) return <div className="p-6">Loading assessment...</div>;
  if (!assessment)
    return <div className="p-6 text-red-600">Assessment not found</div>;

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
          {/* ✅ Show only current question */}
          {assessment.questions.length > 0 && (
            <div className="mb-6 p-4 border rounded-xl shadow-sm">
              <p className="font-semibold mb-3">
                {currentIndex + 1}. {assessment.questions[currentIndex].text}
              </p>

              {assessment.questions[currentIndex].options?.length > 0 ? (
                assessment.questions[currentIndex].options.map((opt) => (
                  <label key={opt} className="block mb-2 cursor-pointer">
                    <input
                      type="radio"
                      name={assessment.questions[currentIndex].id}
                      value={opt}
                      checked={
                        answers[assessment.questions[currentIndex].id] === opt
                      }
                      onChange={() =>
                        handleAnswer(assessment.questions[currentIndex].id, opt)
                      }
                      className="mr-2"
                    />
                    {opt}
                  </label>
                ))
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
                  className="border p-2 w-full rounded"
                />
              )}
            </div>
          )}

          {/* ✅ Navigation buttons */}
          <div className="flex justify-between mt-4">
            {currentIndex > 0 && (
              <button
                onClick={handlePrevious}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl"
              >
                Previous
              </button>
            )}

            {currentIndex < assessment.questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl ml-auto"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl ml-auto"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
