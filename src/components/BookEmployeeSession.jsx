import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Calendar, Mail, PhoneCall, X, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { LuLoaderCircle } from "react-icons/lu";

const backend_url = import.meta.env.VITE_API_BASE_URL;

export default function BookEmployeeSession() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [form, setForm] = useState({ date: "", slot: "", notes: "", mode: "online" });
  const [message, setMessage] = useState("");
  const [booking, setBooking] = useState(false);
  const dateScrollRef = useRef(null);
  const slotScrollRef = useRef(null);

  const scrollContainer = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollBy({ left: direction === "right" ? 150 : -150, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${backend_url}/api/companies/assigned-doctors`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctors(res.data.data);
      } catch (err) {
        console.error("Failed to fetch assigned doctors:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleBookClick = async (doctor) => {
    setSelectedDoctor(doctor);
    try {
      // fetch available dates from doctor availability (fake for now)
      const res = await axios.get(`${backend_url}/api/doctors/${doctor._id}/available-dates?days=14`);
      setAvailableDates(res.data.data || []);
    } catch {
      setAvailableDates([]);
    }
    setMessage(""); // ✅ clear old message
 setForm({ date: "", slot: "", notes: "", mode: "online" }); // ✅ reset form

    setModalOpen(true);
  };

  const handleDateChange = (rawDate) => {
    const d = new Date(rawDate);
    const formatted = d.toISOString().split("T")[0];
    setForm({ ...form, date: formatted, slot: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date || !form.slot) return setMessage("❌ Please select date and time slot");
    setBooking(true);
    try {
      const token = localStorage.getItem("token");
      const [startTimeStr, endTimeStr] = form.slot.split("|");
      const slotStart = new Date(`${form.date}T${startTimeStr}`).toISOString();
      const slotEnd = new Date(`${form.date}T${endTimeStr}`).toISOString();

      await axios.post(
        `${backend_url}/api/companies`,
        {
          doctorId: selectedDoctor._id,
          slotStart,
          slotEnd,
          notes: form.notes,
          mode: form.mode,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage("✅ Session booked successfully!");
      setTimeout(() => setModalOpen(false), 1500);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to book appointment");
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-6">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-center text-blue-700 mb-10"
      >
        Book a Session with Your Assigned Doctor
      </motion.h2>

      {loading ? (
        <p className="text-center text-gray-600">Loading doctors...</p>
      ) : doctors.length === 0 ? (
        <p className="text-center text-gray-600">No doctors assigned yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doc, index) => (
            <motion.div
              key={doc._id || index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition"
            >
              <img
                src={
                  doc.imageUrl
                    ? doc.imageUrl.startsWith("/uploads")
                      ? `${backend_url}${doc.imageUrl}`
                      : doc.imageUrl
                    : "https://cdn-icons-png.flaticon.com/512/3774/3774299.png"
                }
                alt={doc.name}
                className="w-20 h-20 mx-auto rounded-full object-cover mb-4 border-2 border-blue-200"
              />

              <h3 className="text-xl font-semibold text-gray-800 text-center">
                {doc.name}
              </h3>
              <p className="text-gray-600 text-center mb-4">
                {doc.specialization || "General Psychologist"}
              </p>

              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => handleBookClick(doc)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition"
                >
                  <Calendar size={18} /> Book Session
                </button>
                <div className="flex gap-3 text-gray-600 mt-2">
                  <a href={`mailto:${doc.email}`}><Mail size={18} /></a>
                  <PhoneCall size={18} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {modalOpen && selectedDoctor && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-3 transition-opacity duration-300">
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
            >
              <X size={24} />
            </button>

            <div className="flex items-center space-x-4 mb-5">
              <img
                src={
                  selectedDoctor.imageUrl
                    ? selectedDoctor.imageUrl.startsWith("/uploads")
                      ? `${backend_url}${selectedDoctor.imageUrl}`
                      : selectedDoctor.imageUrl
                    : "https://cdn-icons-png.flaticon.com/512/3774/3774299.png"
                }
                alt={selectedDoctor.name}
                className="w-16 h-16 rounded-full object-cover border shadow"
              />
              <h2 className="text-2xl font-bold text-blue-700">
                Book with {selectedDoctor.name}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date selection */}
              <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center mb-2">
                  <Calendar size={18} className="mr-2 text-blue-600" />
                  Select Date
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => scrollContainer(dateScrollRef, "left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 border rounded-full shadow p-1"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div
                    ref={dateScrollRef}
                    className="flex space-x-3 overflow-x-auto no-scrollbar px-6 pb-2"
                  >
                    {availableDates.map((d, i) => {
                      const dateObj = new Date(d.date);
                      const formatted = dateObj.toISOString().split("T")[0];
                      const selected = form.date === formatted;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleDateChange(formatted)}
                          className={`px-3 py-2 rounded-lg border text-sm font-medium ${
                            selected
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white border-gray-300 text-gray-700 hover:bg-blue-50"
                          }`}
                        >
                          {dateObj.getDate()}{" "}
                          {dateObj.toLocaleString("en-US", { month: "short" })}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => scrollContainer(dateScrollRef, "right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 border rounded-full shadow p-1"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* Slot selection */}
              <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center mb-2">
                  <Clock size={18} className="mr-2 text-blue-600" />
                  Select Time Slot
                </label>
                {!form.date ? (
                  <p className="text-gray-500 text-sm italic">
                    Select a date first
                  </p>
                ) : (
                  <div ref={slotScrollRef} className="flex space-x-3 overflow-x-auto no-scrollbar px-1 pb-2">
                    {(
                      availableDates.find((d) => d.date === form.date)?.slots || []
                    ).map((slot, i) => {
                      const slotVal = `${slot.startTime}|${slot.endTime}`;
                      const selected = form.slot === slotVal;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setForm({ ...form, slot: slotVal })}
                          className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                            selected
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white border-gray-300 text-gray-700 hover:bg-blue-50"
                          }`}
                        >
                          {slot.startTime} - {slot.endTime}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  Additional Notes (optional)
                </label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  placeholder="Write a note..."
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={booking}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {booking && (
                    <LuLoaderCircle className="animate-spin mr-2" size={18} />
                  )}
                  {booking ? "Booking..." : "Book"}
                </button>
              </div>

              {message && (
                <p className="text-center mt-2 text-sm font-medium text-gray-700">
                  {message}
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
