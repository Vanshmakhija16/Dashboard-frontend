import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

const backend_url = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function AssignDoctorsPage() {
  const { universityId } = useParams();
  const navigate = useNavigate();

  const [allDoctors, setAllDoctors] = useState([]);
  const [assignedDoctors, setAssignedDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [assigning, setAssigning] = useState(null);
  const [unassigning, setUnassigning] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Fetch all doctors
      const allRes = await axios.get(`${backend_url}/api/universities/doctors/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allDocs = allRes.data.data || [];

      // Fetch assigned doctors for this university
      const assignedRes = await axios.get(`${backend_url}/api/universities/${universityId}/doctors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const assignedDocs = assignedRes.data.data || [];

      // Separate assigned and unassigned doctors
      const assignedIds = assignedDocs.map((d) => d._id);
      const unassignedDoctors = allDocs.filter((d) => !assignedIds.includes(d._id));

      setAssignedDoctors(assignedDocs);
      setAllDoctors(unassignedDoctors);
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
      alert("Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDoctor = async (doctorId) => {
    setAssigning(doctorId);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${backend_url}/api/universities/${universityId}/doctors`,
        { doctorId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ Refetch to stay in sync with DB
      await fetchDoctors();
    } catch (err) {
      console.error("Failed to assign doctor:", err);
      alert(err.response?.data?.error || "Failed to assign doctor");
    } finally {
      setAssigning(null);
    }
  };

  const handleUnassignDoctor = async (doctorId) => {
    setUnassigning(doctorId);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${backend_url}/api/universities/${universityId}/doctors/${doctorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ Refetch to stay in sync with DB
      await fetchDoctors();
    } catch (err) {
      console.error("Failed to unassign doctor:", err);
      alert(err.response?.data?.error || "Failed to unassign doctor");
    } finally {
      setUnassigning(null);
    }
  };

  return (
    <div className="min-h-screen flex bg-blue-200">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl p-6 transform transition-transform duration-300 z-20 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-emerald-800">Sidebar</h2>
          <button onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <button
          onClick={() => navigate("/admin-dashboard")}
          className="w-full px-4 py-3 rounded-xl bg-emerald-500 text-white font-semibold mt-3 shadow hover:bg-emerald-600 transition"
        >
          Dashboard
        </button>
        <button
          onClick={() => navigate("/universities")}
          className="w-full px-4 py-3 rounded-xl bg-emerald-500 text-white font-semibold mt-3 shadow hover:bg-emerald-600 transition"
        >
          Universities
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col py-12 px-4 sm:px-8 transition-all duration-500">
        <button
          onClick={() => setSidebarOpen(true)}
          className="mb-4 p-3 rounded-full bg-white shadow-lg hover:scale-105 transition w-fit"
        >
          <Menu size={22} />
        </button>

        <div className="max-w-3xl mx-auto w-full border border-teal-300 rounded-3xl shadow-2xl bg-white/60 backdrop-blur-xl p-6 animate-fadein">
          <h1 className="text-4xl font-extrabold text-emerald-800 mb-6">
            Assign Doctors
          </h1>

          {loading ? (
            <p className="text-center text-gray-600">Loading doctors...</p>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-teal-700 mb-3">
                  Assigned Doctors
                </h2>
                {assignedDoctors.length === 0 ? (
                  <p>No doctors assigned yet.</p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {assignedDoctors.map((doc) => (
                      <li
                        key={doc._id}
                        className="flex justify-between items-center p-3 bg-white rounded-xl shadow"
                      >
                        <span>
                          {doc.name} ({doc.email})
                        </span>
                        <button
                          onClick={() => handleUnassignDoctor(doc._id)}
                          disabled={unassigning === doc._id}
                          className="px-3 py-1 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
                        >
                          {unassigning === doc._id ? "Removing..." : "Remove"}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-teal-700 mb-3">
                  All Doctors
                </h2>
                {allDoctors.length === 0 ? (
                  <p>No doctors available to assign.</p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {allDoctors.map((doc) => (
                      <li
                        key={doc._id}
                        className="flex justify-between items-center p-3 bg-white rounded-xl shadow"
                      >
                        <span>
                          {doc.name} ({doc.email})
                        </span>
                        <button
                          onClick={() => handleAssignDoctor(doc._id)}
                          disabled={assigning === doc._id}
                          className="px-3 py-1 bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
                        >
                          {assigning === doc._id ? "Assigning..." : "Assign"}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn { 
            from { opacity: 0; transform: translateY(30px);} 
            to { opacity: 1; transform: none; } 
          }
          .animate-fadein { 
            animation: fadeIn 0.7s cubic-bezier(.41,-0.01,.68,1.01) both; 
          }
        `}
      </style>
    </div>
  );
}
