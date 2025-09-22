import React, { useEffect, useState } from "react";
import axios from "axios";
import { PlusCircle, Trash2, Menu, X, Eye, EyeOff, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const backend_url = import.meta.env.VITE_API_BASE_URL;

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState([]);
  const [newUniversity, setNewUniversity] = useState("");
  const [newDomainPatterns, setNewDomainPatterns] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${backend_url}/api/universities`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUniversities(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch universities:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUniversity = async (e) => {
    e.preventDefault();
    if (!newUniversity.trim() || !newDomainPatterns.trim() || !newAdminName.trim() || !newAdminEmail.trim() || !newAdminPassword.trim()) {
      alert("Please fill all fields.");
      return;
    }

    const domainsArray = newDomainPatterns
      .split(",")
      .map((d) => d.trim().toLowerCase())
      .filter((d) => d.length > 0);

    if (domainsArray.length === 0) {
      alert("Please enter at least one domain name.");
      return;
    }

    setAdding(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${backend_url}/api/universities`,
        {
          name: newUniversity.trim(),
          domainPatterns: domainsArray,
          adminName: newAdminName.trim(),
          adminEmail: newAdminEmail.trim(),
          adminPassword: newAdminPassword.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNewUniversity("");
      setNewDomainPatterns("");
      setNewAdminName("");
      setNewAdminEmail("");
      setNewAdminPassword("");
      setShowAddForm(false);
      await fetchUniversities();
    } catch (err) {
      console.error("Failed to add university:", err);
      alert(err.response?.data?.error || "Failed to add university");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteUniversity = async (id) => {
    if (!window.confirm("Are you sure you want to delete this university?")) return;

    try {
      setDeletingId(id);
      const token = localStorage.getItem("token");
      setUniversities((u) => u.filter((x) => x._id !== id));
      await axios.delete(`${backend_url}/api/universities/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Failed to delete university:", err);
      alert("Failed to delete university.");
      await fetchUniversities();
    } finally {
      setDeletingId(null);
    }
  };

  // Navigate to Assign Doctors Page
  const handleAssignDoctors = (universityId) => {
    navigate(`/universities/${universityId}/assign-doctors`);
  };

  return (
    <div className="min-h-screen flex bg-blue-200">
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl p-6 transform transition-transform duration-300 z-20 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-emerald-800">Sidebar</h2>
          <button onClick={() => setSidebarOpen(false)}><X size={24} /></button>
        </div>
        <button onClick={() => navigate("/admin-dashboard")} className="w-full px-4 py-3 rounded-xl bg-emerald-500 text-white font-semibold mt-3 shadow hover:bg-emerald-600 transition">Dashboard</button>
        <button onClick={() => navigate("/admin-doctors")} className="w-full px-4 py-3 rounded-xl bg-emerald-500 text-white font-semibold mt-3 shadow hover:bg-emerald-600 transition">Doctors</button>
        <button onClick={() => navigate("/admin/appointments")} className="w-full px-4 py-3 rounded-xl bg-emerald-500 text-white font-semibold mt-3 shadow hover:bg-emerald-600 transition">Appointments</button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col py-12 px-2 sm:px-8 transition-all duration-500">
        <button onClick={() => setSidebarOpen(true)} className="mb-4 p-3 rounded-full bg-white shadow-lg hover:scale-105 transition w-fit"><Menu size={22} /></button>

        <div className="max-w-3xl mx-auto w-full border border-teal-300 rounded-3xl shadow-2xl bg-white/60 backdrop-blur-xl p-0 overflow-hidden animate-fadein">
          {/* Header */}
          <div className="flex justify-between items-center py-6 px-8 border-b border-teal-100 bg-white/80 backdrop-blur-xl">
            <h1 className="text-4xl font-extrabold text-emerald-800 tracking-tight select-none drop-shadow-lg">🎓 Universities</h1>
            <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 text-white font-semibold shadow-lg hover:scale-105 transition-transform duration-300">
              <PlusCircle size={23} /> {showAddForm ? "Cancel" : "Add University"}
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <form onSubmit={handleAddUniversity} className="flex flex-col gap-4 px-8 py-6 border-b border-teal-100 bg-white/60 backdrop-blur-lg animate-slidefade">
              <input type="text" placeholder="University Name" value={newUniversity} onChange={(e) => setNewUniversity(e.target.value)} className="p-3 text-lg rounded-xl border border-emerald-200 shadow focus:ring-2 focus:ring-emerald-400 focus:outline-none transition bg-white" autoFocus />
              <input type="text" placeholder="Email Domains (comma separated)" value={newDomainPatterns} onChange={(e) => setNewDomainPatterns(e.target.value)} className="p-3 text-lg rounded-xl border border-emerald-200 shadow focus:ring-2 focus:ring-emerald-400 focus:outline-none transition bg-white" />
              <input type="text" placeholder="Admin Name" value={newAdminName} onChange={(e) => setNewAdminName(e.target.value)} className="p-3 text-lg rounded-xl border border-emerald-200 shadow focus:ring-2 focus:ring-emerald-400 focus:outline-none transition bg-white" />
              <input type="email" placeholder="Admin Email" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} className="p-3 text-lg rounded-xl border border-emerald-200 shadow focus:ring-2 focus:ring-emerald-400 focus:outline-none transition bg-white" />
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="Admin Password" value={newAdminPassword} onChange={(e) => setNewAdminPassword(e.target.value)} className="w-full p-3 text-lg rounded-xl border border-emerald-200 shadow focus:ring-2 focus:ring-emerald-400 focus:outline-none transition bg-white" />
                <span onClick={() => setShowPassword(!showPassword)} className="absolute top-3 right-3 cursor-pointer text-gray-600">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</span>
              </div>
              <button type="submit" disabled={adding} className={`px-6 py-3 rounded-xl text-lg text-white font-bold shadow-lg transition-all ${adding ? "bg-emerald-400 cursor-wait" : "bg-emerald-600 hover:bg-emerald-700 hover:scale-105"}`}>
                {adding ? "Adding..." : "Add University"}
              </button>
            </form>
          )}

          {/* University List */}
          <div className="px-6 py-5 bg-blue-30">
            {loading ? (
              <div className="flex flex-col justify-center items-center py-16 animate-fadein">
                <span className="w-10 h-10 border-4 border-teal-300 border-t-cyan-400 rounded-full animate-spin mb-3"></span>
                <p className="text-emerald-700 font-medium text-lg">Loading universities...</p>
              </div>
            ) : universities.length === 0 ? (
              <p className="text-center text-gray-400 text-lg py-12 animate-fadein">No universities found.</p>
            ) : (
              <ul className="flex flex-col gap-5">
                {universities.map((uni, i) => (
                  <li key={uni._id} className={`flex justify-between items-center border border-teal-00 bg-white/70 backdrop-blur-[6px] p-5 rounded-xl shadow-[0_3px_18px_0px_rgba(20,184,166,0.11)] hover:shadow-xl hover:bg-teal-50 transition-all duration-300 group animate-listpop`} style={{ animationDelay: `${i * 80}ms` }}>
                    <div>
                      <span className="text-xl font-semibold text-emerald-800 hover:text-teal-500 cursor-pointer transition duration-200" title="View Students" onClick={() => navigate(`/universities/${uni._id}/students`)}>
                        {uni.name}
                      </span>
                      {uni.adminName && <span className="ml-3 text-gray-600 text-sm">(Admin: {uni.adminName})</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleAssignDoctors(uni._id)} className="p-2 rounded-xl bg-gradient-to-tr from-blue-400 via-cyan-400 to-teal-500 text-white shadow-md hover:scale-110 transition" title="Assign Doctors">
                        <UserPlus size={20} />
                      </button>
                      <button onClick={() => handleDeleteUniversity(uni._id)} disabled={deletingId === uni._id} className={`p-2 rounded-xl shadow-md transition-all duration-200 ease-in ${deletingId === uni._id ? "bg-orange-200 text-white cursor-wait" : "bg-gradient-to-tr from-orange-400 via-pink-400 to-pink-500 text-white hover:scale-110 hover:brightness-105"}`} title="Delete University">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: none; } }
          .animate-fadein { animation: fadeIn 0.7s cubic-bezier(.41,-0.01,.68,1.01) both; }
          @keyframes slidefade { from { opacity: 0; transform: translateY(-15px);} to { opacity: 1; transform: none; } }
          .animate-slidefade { animation: slidefade 0.55s cubic-bezier(.41,-0.01,.68,1.01) both; }
          @keyframes listpop { 0% { opacity: 0; transform: translateY(35px) scale(.95);} 80%{opacity:0.65;} 100% { opacity: 1; transform: none;} }
          .animate-listpop { animation: listpop 0.65s cubic-bezier(.36,-0.16,.62,1.03) backwards; }
        `}
      </style>
    </div>
  );
}
