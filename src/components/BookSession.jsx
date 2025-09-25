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
 console.log("Doctor Image path:", doctor.profileImage);

  const badge = getAvailabilityBadge(doctor.availabilityType);

  return (  
<div
  className="
    bg-white border border-gray-200 rounded-2xl 
    p-4 sm:p-6   /* smaller padding on mobile, bigger on desktop */
    min-h-[120px]
    flex flex-col space-y-3 
    shadow-md hover:shadow-xl 
    transition-all duration-300 transform hover:-translate-y-1
    w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg
    mx-auto
  "
>
  {/* Image + Name + Specialization in one row */}
  <div className="flex items-center space-x-3 sm:space-x-4 mb-3">
    <img
      src={
        doctor.profileImage?.startsWith("http")
          ? doctor.profileImage
          : `${backend_url}${doctor.profileImage}`
      }
      alt={doctor.name}
      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shadow"
    />

    <div className="flex-1 min-w-0">
      <h3 className="text-base sm:text-xl font-bold text-gray-800 truncate">
        {doctor.name}
      </h3>
      <div className="text-teal-600 text-xs sm:text-sm font-medium break-words">
        {doctor.specialization}
      </div>
      {doctor.hospital && (
        <p className="text-gray-600 text-xs sm:text-sm break-words">
          {doctor.hospital}
        </p>
      )}
    </div>
  </div>

  {/* Availability Badge */}
  <div className="flex flex-wrap justify-between items-center gap-2">
    <p className="text-xs sm:text-sm font-medium text-blue-700">
      📅 Available for Booking
    </p>
    <span
      className={`text-xs sm:text-sm font-semibold px-2.5 py-0.5 rounded-full ${badge.color}`}
    >
      {badge.text}
    </span>
  </div>

  {/* Book button */}
  <button
    className="
      mt-4 py-2 px-3 sm:px-4 
      text-sm sm:text-base 
      font-semibold rounded-lg 
      transition-colors 
      bg-teal-700 hover:bg-teal-800 text-white 
      disabled:bg-gray-400 disabled:cursor-not-allowed
    "
    onClick={() => onBookClick(doctor)}
    disabled={doctor.isAvailable !== "available"}
  >
    {doctor.isAvailable === "available"
      ? "Book Appointment"
      : "Not Available"}
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
  const [availableDates, setAvailableDates] = useState([]); // [{date, slots}, ...]

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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleDateChange = (date) => {
    setForm({ ...form, date: date, slot: "" });
  };

  const handleBookClick = async (doctor) => {
    try {
      // fetch full doctor details
      const doctorRes = await axios.get(`${backend_url}/api/doctors/${doctor._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fullDoctor = doctorRes.data?.data || doctor;
      setSelectedDoctor(fullDoctor);

      // fetch available dates with slots
      const datesRes = await axios.get(
        `${backend_url}/api/doctors/${doctor._id}/available-dates?days=14`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const dates = datesRes.data?.data || [];
      setAvailableDates(dates);

      // preselect first available date
      let initialDate = "";
      if (dates.length > 0) {
        initialDate = dates[0].date;
      }

      setForm({
        date: initialDate,
        slot: "",
        notes: "",
        mode: doctor.availabilityType === "offline" ? "offline" : "online",
      });

      setMessage("");
      setModalOpen(true);
    } catch (err) {
      console.error("Error opening booking modal:", err);

      setSelectedDoctor(doctor);
      setAvailableDates([]);
      setForm({
        date: "",
        slot: "",
        notes: "",
        mode: doctor.availabilityType === "offline" ? "offline" : "online",
      });
      setMessage("");
      setModalOpen(true);
    }
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
        `${backend_url}/api/sessions`,
        {
          doctorId: selectedDoctor._id,
          slotStart,
          slotEnd,
          notes: form.notes,
          mode: form.mode.toLowerCase(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("✅ Session booked successfully!");
      setModalOpen(false);
    } catch (err) {
      console.log(err.response?.data || err.message);
      setMessage(`❌You can book only 'two' session per day.
      Try again tomorrow after 9AM.`);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-100 text-gray-900 relative overflow-hidden">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white/10 backdrop-blur-lg border-r border-white/20 shadow-xl transform transition-transform duration-500 ease-in-out z-50 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-5 border-b border-white/20">
          <img src={minderyLogo} alt="Logo" className="h-8 drop-shadow-md" />
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
            className="text-left px-4 py-2 rounded-lg hover:bg-white/20 text-teal-800 font-medium transition duration-200"
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => {
              navigate("/book-session");
              setSidebarOpen(false);
            }}
            className="text-left px-4 py-2 rounded-lg bg-white/20 text-teal-900 font-semibold transition duration-200"
          >
            👨‍⚕️ Session Booking
          </button>
          <button
            onClick={() => {
              navigate("/resources");
              setSidebarOpen(false);
            }}
            className="text-left px-4 py-2 rounded-lg hover:bg-white/20 text-teal-800 font-medium transition duration-200"
          >
            📚 Resources
          </button>
        </nav>

        <div className="p-4 border-t border-white/20">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 rounded-lg hover:bg-red-300/30 hover:scale-[1.02] text-red-700 font-medium transition-all duration-300"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 bg-teal-600 p-2 rounded-full shadow-lg hover:scale-105 transition-all duration-300"
        >
          <Menu size={20} className="text-white" />
        </button>
      )}

      <main className="relative max-w-4xl mx-auto px-3 pb-16">
        {/* Tabs */}
        <div className="sticky top-0 z-30 bg-white/30 backdrop-blur-md flex justify-center mb-8 rounded-xl p-1 shadow-md border border-gray-100 mt-4 transition-all duration-300">
          {["all", "online", "offline", "both"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                activeTab === tab ? "bg-teal-600 text-white shadow-sm" : "text-gray-600 hover:text-teal-700 hover:bg-white/50"
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

        <h1 className="text-3xl font-extrabold text-teal-700 mb-6 text-center animate-fade-in-down">
          Find a Doctor & Book Session
        </h1>

        <section className="space-y-7 animate-fade-in w-[55%] m-auto">
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
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-3 transition-opacity duration-300">
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl max-w-md w-full p-6 relative transform transition-all duration-300 scale-95 animate-slide-up-fade">
              {/* Close button */}
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition"
                aria-label="Close booking form"
              >
                <X size={24} />
              </button>

              {/* Doctor Info */}
              <div className="flex items-center space-x-4 mb-5">
<img
  src={
    selectedDoctor.profileImage?.startsWith("http")
      ? selectedDoctor.profileImage
      : `${backend_url}${selectedDoctor.profileImage}`
  }
  alt={selectedDoctor.name}
  className="w-16 h-16 rounded-full object-cover border shadow"
/>


                <h2 className="text-2xl font-bold text-teal-700">
                  Book Session with {selectedDoctor.name}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date Picker */}
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <CalendarDays className="inline mr-2 text-teal-600" size={18} />
                    Select Date
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => scrollContainer(dateScrollRef, "left")}
                      className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 border rounded-full shadow p-1 z-10 hover:bg-gray-100 transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <div ref={dateScrollRef} className="flex space-x-3 overflow-x-auto no-scrollbar px-6 pb-2">
                      {availableDates.map((day, i) => {
                        const d = new Date(day.date);
                        const formattedDate = day.date;
                        const isSelected = form.date === formattedDate;

                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleDateChange(formattedDate)}
                            className={`min-w-[70px] flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl border text-sm transition-all duration-200
                              ${
                                isSelected
                                  ? "bg-teal-600 text-white border-teal-600 shadow-lg scale-[1.05]"
                                  : "bg-white/50 backdrop-blur-sm hover:bg-teal-50 border-gray-300 text-gray-700 hover:shadow-md"
                              }`}
                          >
                            <span className="font-bold">
                              {d.toLocaleDateString("en-US", { day: "numeric" })}
                            </span>
                            <span className="text-xs">
                              {d.toLocaleDateString("en-US", { month: "short" })}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => scrollContainer(dateScrollRef, "right")}
                      className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 border rounded-full shadow p-1 z-10 hover:bg-gray-100 transition-colors"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

                {/* Slots */}
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <Clock className="inline mr-2 text-teal-600" size={18} />
                    Select Time Slot
                  </label>
                  {!form.date ? (
                    <p className="text-gray-500 text-sm italic">Pick a date above to view slots</p>
                  ) : (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => scrollContainer(slotScrollRef, "left")}
                        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 border rounded-full shadow p-1 z-10 hover:bg-gray-100 transition-colors"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <div ref={slotScrollRef} className="flex space-x-3 overflow-x-auto no-scrollbar px-6 pb-2">
                        {(availableDates.find((d) => d.date === form.date)?.slots || [])
                          .filter((slot) => {
                            const now = new Date();
                            const slotTime = new Date(`${form.date}T${slot.startTime}`);
                            return slotTime >= now;
                          })
                          .map((slot, i) => {
                            const slotValue = `${slot.startTime}|${slot.endTime}`;
                            const isSelected = form.slot === slotValue;
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setForm({ ...form, slot: slotValue })}
                                className={`px-4 py-2 rounded-xl text-sm font-medium border shadow-sm transition-all duration-200 whitespace-nowrap
                                  ${
                                    isSelected
                                      ? "bg-teal-600 text-white border-teal-600 shadow-md scale-[1.02]"
                                      : "bg-white/50 backdrop-blur-sm hover:bg-teal-50 border-gray-300 text-gray-700 hover:shadow-md"
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
                        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 border rounded-full shadow p-1 z-10 hover:bg-gray-100 transition-colors"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-gray-50/50"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 shadow-md transition-colors transform hover:scale-105"
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
