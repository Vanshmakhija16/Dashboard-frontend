// client/src/components/ReportsPage.jsx
import React, { useState, useEffect } from "react";
import { Calendar, FileText, LogOut, X, Plus, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const backend_url = import.meta.env.VITE_API_BASE_URL;

export default function ReportsPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [reports, setReports] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "male",
    mode: "offline",
    problems: "",
    analysis: "",
    metrics: "",
    nextSessionDate: "",
    daysToAttend: "",
    attendedDate: "",
  });

  // Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get(`${backend_url}/api/reports`);
        setReports(res.data);
      } catch (err) {
        console.error("Error fetching reports", err);
      }
    };
    fetchReports();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const toInputDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toISOString().split("T")[0];
  };

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (editingId) {
        res = await axios.put(`${backend_url}/api/reports/${editingId}`, form);
        setReports((prev) =>
          prev.map((r) => (r._id === editingId ? res.data : r))
        );
        setEditingId(null);
      } else {
        res = await axios.post(`${backend_url}/api/reports`, form);
        setReports((prev) => [...prev, res.data]);
      }
      setForm({
        name: "",
        age: "",
        gender: "male",
        mode: "offline",
        problems: "",
        analysis: "",
        metrics: "",
        nextSessionDate: "",
        daysToAttend: "",
        attendedDate: "",
      });
      setShowForm(false);
    } catch (err) {
      console.error("Error saving report:", err);
      alert("Failed to save report.");
    }
  };

  function handleEdit(report) {
    setEditingId(report._id);
    setForm({
      ...report,
      nextSessionDate: toInputDate(report.nextSessionDate),
      attendedDate: toInputDate(report.attendedDate),
    });
    setShowForm(true);
  }

  async function handleDelete(id) {
    try {
      await axios.delete(`${backend_url}/api/reports/${id}`);
      setReports((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Error deleting report:", err);
      alert("Failed to delete report.");
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 text-gray-800">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white/60 backdrop-blur-lg shadow-xl transform transition-transform duration-300 z-50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-blue-600">Dashboard</h2>
          <X
            className="cursor-pointer text-gray-600"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
        <nav className="flex flex-col justify-between h-[calc(100%-64px)] px-6 py-6">
          <div className="flex flex-col gap-4">
            <button
              onClick={() => navigate("/doctor/appointments")}
              className="flex items-center gap-3 bg-blue-100 text-blue-700 rounded-lg px-4 py-3 hover:bg-blue-200 transition shadow-sm"
            >
              <Calendar /> My Sessions
            </button>
            <button
              onClick={() => navigate("/reports")}
              className="flex items-center gap-3 bg-purple-100 text-purple-700 rounded-lg px-4 py-3 hover:bg-purple-200 transition shadow-sm"
            >
              <FileText size={20} /> Reports
            </button>
          </div>
          <button
            className="flex items-center gap-3 bg-red-100 text-red-600 rounded-lg px-4 py-3 hover:bg-red-200 transition shadow-sm"
            onClick={() => navigate("/")}
          >
            <LogOut /> Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <Menu
              className="cursor-pointer text-gray-600"
              onClick={() => setSidebarOpen(true)}
            />
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Student Reports
            </h1>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-400 to-purple-400 text-white px-6 py-3 rounded-xl shadow-md hover:opacity-90 transition"
          >
            <Plus size={18} /> Add Report
          </button>
        </div>

        <div className="max-w-7xl mx-auto space-y-10">
          {/* Form Modal */}
          {showForm && (
            <div className="relative bg-white/80 backdrop-blur-xl p-10 rounded-2xl shadow-2xl border border-gray-200">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X size={22} />
              </button>

              <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                {editingId ? "Update Report" : "Create Report"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleFormChange}
                      className="glass-input-light border-2 rounded-xl p-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={form.age}
                      onChange={handleFormChange}
                      className="glass-input border-2 rounded-xl p-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleFormChange}
                      className="glass-input-light border-2 rounded-xl p-1"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mode
                    </label>
                    <select
                      name="mode"
                      value={form.mode}
                      onChange={handleFormChange}
                      className="glass-input-light border-2 rounded-xl p-1"
                    >
                      <option value="offline">Offline</option>
                      <option value="online">Online</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Problems
                  </label>
                  <input
                    type="text"
                    name="problems"
                    value={form.problems}
                    onChange={handleFormChange}
                    className="glass-input-light border-2 rounded-xl p-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Analysis / Notes / Prescription
                  </label>
                  <textarea
                    name="analysis"
                    value={form.analysis}
                    onChange={handleFormChange}
                    rows={3}
                    className="glass-input-light border-2 rounded-xl p-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Treatments / Metrics
                  </label>
                  <input
                    type="text"
                    name="metrics"
                    value={form.metrics}
                    onChange={handleFormChange}
                    className="glass-input-light border-2 rounded-xl p-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upcoming Session Date
                    </label>
                    <input
                      type="date"
                      name="nextSessionDate"
                      value={form.nextSessionDate}
                      onChange={handleFormChange}
                      className="glass-input-light border-2 rounded-xl p-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium  text-gray-700 mb-1">
                      Days to Attend
                    </label>
                    <input
                      type="number"
                      name="daysToAttend"
                      value={form.daysToAttend}
                      onChange={handleFormChange}
                      className="glass-input-light border-2 rounded-xl p-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Attended Date
                    </label>
                    <input
                      type="date"
                      name="attendedDate"
                      value={form.attendedDate}
                      onChange={handleFormChange}
                      className="glass-input-light border-2 rounded-xl p-1"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-400 to-blue-400 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition shadow-md"
                >
                  {editingId ? "Update Report" : "Create Report"}
                </button>
              </form>
            </div>
          )}

          {/* Reports Table */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 overflow-x-auto">
            <table className="w-full table-auto border-collapse text-sm text-gray-700">
              <thead className="bg-gradient-to-r from-blue-400 to-purple-400 text-white">
                <tr>
                  <th className="px-6 py-4 text-left">Name</th>
                  <th className="px-6 py-4 text-left">Age</th>
                  <th className="px-6 py-4 text-left">Gender</th>
                  <th className="px-6 py-4 text-left">Mode</th>
                  <th className="px-6 py-4 text-left">Problems</th>
                  <th className="px-6 py-4 text-left">Analysis</th>
                  <th className="px-6 py-4 text-left">Treatments</th>
                  <th className="px-6 py-4 text-left">Next Session</th>
                  <th className="px-6 py-4 text-left">Days</th>
                  <th className="px-6 py-4 text-left">Attended</th>
                  <th className="px-6 py-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr
                    key={r._id}
                    className="hover:bg-blue-50 transition duration-200"
                  >
                    <td className="px-6 py-3">{r.name}</td>
                    <td className="px-6 py-3">{r.age}</td>
                    <td className="px-6 py-3">{r.gender}</td>
                    <td className="px-6 py-3">{r.mode}</td>
                    <td className="px-6 py-3">{r.problems}</td>
                    <td className="px-6 py-3">{r.analysis}</td>
                    <td className="px-6 py-3">{r.metrics}</td>
                    <td className="px-6 py-3">
                      {formatDate(r.nextSessionDate)}
                    </td>
                    <td className="px-6 py-3">{r.daysToAttend}</td>
                    <td className="px-6 py-3">
                      {formatDate(r.attendedDate)}
                    </td>
                    <td className="px-6 py-3 flex gap-4">
                      <button
                        onClick={() => handleEdit(r)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(r._id)}
                        className="text-red-500 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

/* Extra CSS (add in index.css or globals.css)
------------------------------------------------
.glass-input-light {
  @apply border rounded-lg p-3 w-full bg-white/60 backdrop-blur-md 
         text-gray-700 placeholder-gray-400 
         focus:outline-none focus:ring-2 focus:ring-blue-300;
}
*/
