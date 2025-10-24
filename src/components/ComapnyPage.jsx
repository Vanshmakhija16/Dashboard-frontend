import React, { useState, useEffect } from "react";
import { Plus, Trash2, UserPlus } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const backend_url = import.meta.env.VITE_API_BASE_URL;

const CompanyPage = () => {
  const navigate = useNavigate(); // ✅ move inside component

  const [companies, setCompanies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    domain: "",
    adminEmail: "",
    password: "",
  });

  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await axios.get(`${backend_url}/api/companies`);
        setCompanies(res.data);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };
    fetchCompanies();
  }, []);

  // Delete a company
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${backend_url}/api/companies/${id}`);
      setCompanies(companies.filter((c) => c._id !== id));
    } catch (error) {
      console.error("Error deleting company:", error);
    }
  };

  // Add new company
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.domain)
      return alert("Please fill all required fields");

    try {
      const res = await axios.post(`${backend_url}/api/companies/add`, {
        name: formData.name,
        domainPatterns: [formData.domain],
      });

      setCompanies([...companies, res.data.company]);
      setFormData({ name: "", domain: "", adminEmail: "", password: "" });
      setShowForm(false);
    } catch (error) {
      console.error("Error adding company:", error);
      alert(error.response?.data?.message || "Error adding company");
    }
  };

  const handleAssignDoctor = (companyId) => {
    navigate(`/companies/${companyId}/assign-doctors`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">🏢 Companies</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Add Company
        </button>
      </div>

      {/* Company Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <div
            key={company._id}
            className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold text-gray-800">{company.name}</h2>
            <p className="text-gray-600 mt-1">
              {company.domainPatterns?.join(", ")}
            </p>

            <div className="flex justify-between items-center mt-6">
              <button
                className="flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-800 transition"
                onClick={() => handleAssignDoctor(company._id)}
              >
                <UserPlus size={18} /> Assign Doctor
              </button>

              <button
                className="text-red-500 hover:text-red-700 transition"
                onClick={() => handleDelete(company._id)}
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg relative">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Company</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-gray-600 text-sm mb-1">Company Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g., MindHealth Inc"
                />
              </div>

              <div>
                <label className="block text-gray-600 text-sm mb-1">Email Domain</label>
                <input
                  type="text"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g., mindhealth.com"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition shadow"
                >
                  Add Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyPage;
