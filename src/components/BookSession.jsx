import React, { useState, useEffect, useRef } from "react";
import { Menu, X, CalendarDays, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import minderyLogo from "../assets/mindery.png";

const backend_url = import.meta.env.VITE_API_BASE_URL;

// -----------------------------
// Doctor Card Component
// -----------------------------
const DoctorCard = ({ doctor, onBookClick }) => {
  const getAvailabilityBadge = (type) => {
    const badges = {
      online: { text: "Online", color: "bg-blue-100 text-blue-800" },
      offline: { text: "In-Person", color: "bg-green-100 text-green-800" },
      both: { text: "Both Available", color: "bg-purple-100 text-purple-800" },
    };
    return badges[type] || badges.both;
  };

  const badge = getAvailabilityBadge(doctor.availabilityType);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 min-h-[120px] flex flex-col space-y-3 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{doctor.name}</h3>
          <div className="text-teal-600 text-sm font-medium mb-1">{doctor.specialization}</div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${badge.color}`}>
          {badge.text}
        </span>
      </div>

      {doctor.hospital && <p className="text-gray-600 mb-1">{doctor.hospital}</p>}

      <div className="mt-2">
        <p className="text-sm font-medium text-blue-700">📅 Available for Booking</p>
      </div>

    <button
      className="mt-4 py-2 font-semibold rounded-lg transition-colors bg-teal-700 hover:bg-teal-800 text-white"
      onClick={() => onBookClick(doctor)}
      disabled={doctor.isAvailable !== "available"} // disable if not available
    >
      {doctor.isAvailable === "available" ? "Book Appointment" : "Not Available"} 
    </button>

    </div>
  );
};

// -----------------------------
// Main BookSession Component
// -----------------------------
export default function BookSession() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [form, setForm] = useState({ date: "", slot: "", notes: "", mode: "online" });
  const [message, setMessage] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const dateScrollRef = useRef(null);
  const slotScrollRef = useRef(null);

  const scrollContainer = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollBy({
        left: direction === "right" ? 150 : -150,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(`${backend_url}/api/doctors/my-university`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctors(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDoctors();
  }, [token]);

  const fetchDoctorAvailability = async (doctorId, date) => {
    try {
      const res = await axios.get(`${backend_url}/api/doctors/${doctorId}/availability/${date}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAvailableSlots(res.data.data.slots || []);
    } catch (err) {
      console.error("Error fetching slots:", err);
      setAvailableSlots([]);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleDateChange = (date) => {
    setForm({ ...form, date: date, slot: "" });
    if (selectedDoctor) {
      fetchDoctorAvailability(selectedDoctor._id, date);
    }
  };

  const handleBookClick = (doctor) => {
    setSelectedDoctor(doctor);
    setModalOpen(true);
    setForm({
      date: "",
      slot: "",
      notes: "",
      mode: doctor.availabilityType === "offline" ? "offline" : "online",
    });
    setMessage("");
    setAvailableSlots([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !form.date || !form.slot) {
      setMessage("❌ Please select a date and slot");
      return;
    }

    try {
      const [startTimeStr, endTimeStr] = form.slot.split("|");
      const slotStart = new Date(`${form.date}T${startTimeStr}:00`).toISOString();
      const slotEnd = new Date(`${form.date}T${endTimeStr}:00`).toISOString();

      await axios.post(
        `${backend_url}/api/appointments`,
        {
          doctorId: selectedDoctor._id,
          slotStart,
          slotEnd,
          notes: form.notes,
          mode: form.mode.toLowerCase(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("✅ Appointment booked successfully!");
      setModalOpen(false);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setMessage("❌ Error booking appointment");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

const filteredDoctors = {
  online: doctors.filter((d) => d.availabilityType === "online" && d.isAvailable === "available"),
  offline: doctors.filter((d) => d.availabilityType === "offline" && d.isAvailable === "available"),
  both: doctors.filter((d) => d.availabilityType === "both" && d.isAvailable === "available"),
};

  const displayedDoctors =
    activeTab === "all"
      ? doctors
      : activeTab === "online"
      ? filteredDoctors.online
      : activeTab === "offline"
      ? filteredDoctors.offline
      : filteredDoctors.both;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-100 text-gray-900 relative">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 backdrop-blur-lg bg-white/30 border-r border-white/40 shadow-xl transform transition-transform duration-300 z-50 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-5 border-b border-white/30">
          <img src={minderyLogo} alt="Logo" className="h-8 drop-shadow" />
          <h1 className="text-2xl text-teal-600 font-bold">Mindery</h1>
          <button onClick={() => setSidebarOpen(false)}>
            <X size={24} className="text-gray-800 hover:text-red-600 transition" />
          </button>
        </div>

        <nav className="flex flex-col flex-1 p-4 gap-4">
          <button
            onClick={() => {
              navigate("/student-dashboard");
              setSidebarOpen(false);
            }}
            className="text-left px-4 py-2 rounded-lg hover:bg-white/30 text-teal-800 font-medium transition"
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => {
              navigate("/book-session");
              setSidebarOpen(false);
            }}
            className="text-left px-4 py-2 rounded-lg hover:bg-white/30 text-teal-800 font-medium transition"
          >
            👨‍⚕️ Session Booking
          </button>
          <button
            onClick={() => {
              navigate("/resources");
              setSidebarOpen(false);
            }}
            className="text-left px-4 py-2 rounded-lg hover:bg-white/30 text-teal-800 font-medium transition"
          >
            📚 Resources
          </button>
        </nav>

        <div className="p-4 border-t border-white/30">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 rounded-lg hover:bg-red-300/30 hover:scale-[1.02] text-red-700 font-medium transition-all"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-1 left-5 z-50 bg-teal-600 p-2 rounded-full shadow-lg hover:scale-105 transition"
        >
          <Menu size={20} className="text-white" />
        </button>
      )}

      <main className="relative max-w-4xl mx-auto px-3 pb-16">
        {/* Tabs */}
        <div className="sticky top-0 z-30 bg-white flex justify-center mb-8 rounded-xl p-1 shadow-md">
          {["all", "online", "offline", "both"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab ? "bg-teal-600 text-white" : "text-gray-600 hover:text-teal-700"
              }`}
            >
              {tab === "all"
                ? "All Doctors"
                : tab === "online"
                ? "Online Only"
                : tab === "offline"
                ? "In-Person"
                : "Both Available"}
            </button>
          ))}
        </div>

        <h1 className="text-2xl font-extrabold text-teal-600 mb-6 text-center">
          Find a Doctor & Book Appointment
        </h1>

        <section className="space-y-7">
          {displayedDoctors.length === 0 ? (
            <p className="text-center text-gray-400 text-lg mt-16">No doctors available.</p>
          ) : (
            displayedDoctors.map((doctor) => (
              <DoctorCard key={doctor._id} doctor={doctor} onBookClick={handleBookClick} />
            ))
          )}
        </section>

        {/* Booking Modal */}
        {modalOpen && selectedDoctor && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-3">
            <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6 relative">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
                aria-label="Close booking form"
              >
                <X size={24} />
              </button>
              <h2 className="text-xl font-bold mb-4">
                Book Appointment with {selectedDoctor.name}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Horizontal Date Picker */}
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <CalendarDays className="inline mr-2 text-teal-600" size={18} />
                    Select Date
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => scrollContainer(dateScrollRef, "left")}
                      className="absolute left-0 top-1/2 -translate-y-1/2 bg-white border rounded-full shadow p-1 z-10 hover:bg-gray-100"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <div ref={dateScrollRef} className="flex space-x-3 overflow-x-auto no-scrollbar px-6 pb-2">
                      {Array.from({ length: 14 }).map((_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() + i);
                        const formattedDate = date.toISOString().split("T")[0];
                        const isSelected = form.date === formattedDate;

                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleDateChange(formattedDate)}
                            className={`min-w-[70px] flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl border text-sm transition-all
                              ${
                                isSelected
                                  ? "bg-teal-600 text-white border-teal-600 shadow-md scale-[1.02]"
                                  : "bg-white hover:bg-teal-50 border-gray-300 text-gray-700"
                              }`}
                          >
                            <span className="font-bold">
                              {date.toLocaleDateString("en-US", { day: "numeric" })}
                            </span>
                            <span className="text-xs">
                              {date.toLocaleDateString("en-US", { month: "short" })}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => scrollContainer(dateScrollRef, "right")}
                      className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border rounded-full shadow p-1 z-10 hover:bg-gray-100"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

                {/* Scrollable Time Slots with fallback */}
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <Clock className="inline mr-2 text-teal-600" size={18} />
                    Select Time Slot
                  </label>

                  {!form.date ? (
                    <p className="text-gray-500 text-sm italic">Pick a date above to view slots</p>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-red-500 text-sm">No slots available for this date</p>
                  ) : (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => scrollContainer(slotScrollRef, "left")}
                        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white border rounded-full shadow p-1 z-10 hover:bg-gray-100"
                      >
                        <ChevronLeft size={18} />
                      </button>

                      <div ref={slotScrollRef} className="flex space-x-3 overflow-x-auto no-scrollbar px-6 pb-2">
                        {availableSlots.map((slot, i) => {
                          const slotValue = `${slot.startTime}|${slot.endTime}`;
                          const isSelected = form.slot === slotValue;

                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setForm({ ...form, slot: slotValue })}
                              className={`px-4 py-2 rounded-xl text-sm font-medium border shadow-sm transition-all whitespace-nowrap
                                ${
                                  isSelected
                                    ? "bg-teal-600 text-white border-teal-600 shadow-md scale-[1.02]"
                                    : "bg-white hover:bg-teal-50 border-gray-300 text-gray-700"
                                }`}
                            >
                              {slot.startTime} - {slot.endTime}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => scrollContainer(slotScrollRef, "right")}
                        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border rounded-full shadow p-1 z-10 hover:bg-gray-100"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Additional Notes (Optional)</label>
                  <textarea
                    name="notes"
                    placeholder="Write something about your appointment..."
                    value={form.notes}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition bg-white"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 shadow-md transition"
                  >
                    Book
                  </button>
                </div>

                {message && <p className="mt-2 text-sm text-center font-medium">{message}</p>}
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}