import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Logo from "../assets/logo-removebg-preview.png";

const backend_url = import.meta.env.VITE_API_BASE_URL;

export default function Signup() {
  const [isSignup, setIsSignup] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [role, setRole] = useState("student"); // Default role
  const [universities, setUniversities] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const res = await axios.get(`${backend_url}/api/universities`);
        setUniversities(res.data.data || []);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch universities");
      }
    };
    fetchUniversities();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isSignup
        ? `${backend_url}/api/auth/signup`
        : `${backend_url}/api/auth/login`;

      const { name, email, password, phone } = form;
      const payload = isSignup
        ? { name, email: email.trim(), password: password.trim(), phone: String(phone).trim(), role } // Trim email/password and ensure phone is string
        : { email: email.trim(), password: password.trim() };

      const response = await axios.post(url, payload);

      if (isSignup) {
        alert("Signup successful! Please login.");
        setIsSignup(false);
        setForm({ name: "", email: "", password: "", phone: "" });
      } else {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        const { role } = response.data.user;
        if (role === "admin") navigate("/admin-dashboard");
        else if (role === "university_admin") navigate("/university-dashboard");
        else if (role === "doctor") navigate("/doctor/appointments");
        else navigate("/student-dashboard");
      }
    } catch (error) {
      console.error(error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div
      className="w-screen min-h-screen flex flex-col md:flex-row font-sans relative"
      style={{
        fontFamily: "Poppins, sans-serif",
        background: "linear-gradient(135deg, #f8fafc, #e0f7fa, #f1f5f9)",
      }}
    >
      {/* Left Section */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center text-gray-800 p-10">
        <img
          src={Logo}
          alt="Mindery Logo"
          className="w-28 h-28 mb-6 drop-shadow-xl"
        />
        <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow-lg text-center text-teal-700">
          Mindery Technologies
        </h1>
        <p className="mt-4 text-lg text-gray-600 text-center max-w-md">
          Empowering you with{" "}
          <span className="font-semibold text-teal-600">
            mental wellness solutions
          </span>
          .
        </p>
      </div>

      {/* Right Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div
          className="w-full max-w-md rounded-3xl p-10 space-y-6 border border-white/30 backdrop-blur-2xl"
          style={{
            background: "rgba(255, 255, 255, 0.8)",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.15)",
          }}
        >
          {/* Toggle Buttons */}
          <div className="flex justify-center mb-6 bg-white/40 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setIsSignup(false)}
              className={`flex-1 py-2 rounded-xl font-semibold transition-all duration-300 mr-2 ${
                !isSignup
                  ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsSignup(true)}
              className={`flex-1 py-2 rounded-xl font-semibold transition-all duration-300 ${
                isSignup
                  ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Sign Up
            </button>
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-800 drop-shadow-sm">
            {isSignup ? "Create Your Account" : "Login to Your Account"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/70 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-teal-400 focus:outline-none shadow-sm"
                  required
                />
                <input
                  type="text"
                  name="phone"
                  placeholder="Mobile Number"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/70 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-teal-400 focus:outline-none shadow-sm"
                  required
                />
                {/* Hidden role select for backend */}
                <select
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="hidden"
                >
                  <option value="student">Student</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Admin</option>
                </select>
              </>
            )}

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/70 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-teal-400 focus:outline-none shadow-sm"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/70 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-teal-400 focus:outline-none shadow-sm"
              required
            />

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-lg font-bold text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:to-teal-800 transition-all duration-300 shadow-md"
            >
              {isSignup ? "Sign Up" : "Login"}
            </button>
          </form>

          <p className="text-center text-gray-700 text-sm">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-teal-600 font-semibold hover:underline"
            >
              {isSignup ? "Login" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
