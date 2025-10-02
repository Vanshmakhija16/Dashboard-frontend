import React, { useState, useEffect, useRef } from "react";
import { Menu, X, CalendarDays, Clock, ChevronLeft, ChevronRight } from "lucide-react"; 
import { Link } from "react-router-dom";
import axios from "axios";

const backend_url = import.meta.env.VITE_API_BASE_URL;

// Sidebar component
function Sidebar({ isOpen, onClose }) {
  if (!isOpen) return null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const menuItems = [
    { to: "/admin-dashboard", label: "Dashboard" },
    { to: "/admin-doctors", label: "Doctors" },
    { to: "/admin-student-appointments", label: "Appointments" },
    { to: "/admin-settings", label: "Settings" },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <aside className="fixed top-0 left-0 w-72 h-full bg-white/10 text-white p-8 shadow-2xl flex flex-col z-50 rounded-r-3xl backdrop-blur-lg backdrop-saturate-150">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold tracking-wide select-none">Admin Panel</h2>
          <button onClick={onClose} className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition" aria-label="Close sidebar">
            <X />
          </button>
        </div>
        <nav className="flex flex-col gap-6 flex-1">
          {menuItems.map(({ to, label }) => (
            <Link key={to} to={to} className="block px-6 py-3 rounded-3xl font-semibold text-lg transition-colors duration-300 bg-white/10 hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600" onClick={onClose}>
              {label}
            </Link>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="mt-auto bg-gradient-to-r from-purple-700 to-indigo-700 text-white font-bold rounded-3xl px-7 py-3 shadow-lg hover:from-purple-800 hover:to-indigo-800 transition"
          aria-label="Logout"
        >
          Logout
        </button>
      </aside>
    </>
  );
}

// Appointment modal
function AppointmentListModal({ doctor, appointments, onClose, onUpdateStatus }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center px-4 py-6">
      <div className="bg-white rounded-lg max-w-3xl w-full p-6 shadow-lg max-h-[80vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-gray-900" aria-label="Close appointment modal">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-6">Appointments for <span className="text-teal-900">{doctor.name}</span></h2>
        {appointments.length === 0 ? (
          <p className="text-gray-600">No appointments found.</p>
        ) : (
          <ul className="space-y-4">
            {appointments.map((appt) => (
              <li key={appt._id} className="border rounded p-4 flex flex-col md:flex-row md:justify-between md:items-center shadow-sm hover:shadow-md transition">
                <div>
                  <p><strong>Student:</strong> {appt.name}</p>
                  <p><strong>Mobile:</strong> {appt.phone || "N/A"}</p>
                  <p><strong>Date & Time:</strong>{" "} {new Date(appt.slotStart).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</p>
                  <p className="capitalize">
                    <strong>Status:</strong>{" "}
                    <span className={`font-semibold ${
                      appt.status === "approved" ? "text-green-600" : 
                      appt.status === "rejected" ? "text-red-600" : "text-yellow-600"}`}>
                      {appt.status}
                    </span>
                  </p>
                  {appt.notes && <p><strong>Notes:</strong> {appt.notes}</p>}
                </div>
                <div className="mt-3 md:mt-0 flex gap-3">
                  {appt.status === "requested" && (
                    <>
                      <button onClick={() => onUpdateStatus(appt._id, "approved")} className="bg-green-600 text-white rounded px-4 py-1 hover:bg-green-700 transition">Approve</button>
                      <button onClick={() => onUpdateStatus(appt._id, "rejected")} className="bg-red-600 text-white rounded px-4 py-1 hover:bg-red-700 transition">Reject</button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// Doctor Slots Display Component
function DoctorSlotsDisplay({ doctorSlots }) {
  const dates = Object.keys(doctorSlots || {});
  const [selectedDate, setSelectedDate] = useState(dates[0] || null);

  if (!doctorSlots || dates.length === 0) {
    return (
      <p className="text-sm text-gray-600 italic">No slots available</p>
    );
  }

  return (
    <div className="mt-4">
      {/* Date Selector */}
      <h4 className="text-sm font-semibold text-gray-700 mb-2">Select Date</h4>
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {dates.map((date) => {
          const d = new Date(date);
          const day = d.toLocaleDateString("en-US", { weekday: "short" });
          const dayNum = d.getDate();
          return (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`flex flex-col items-center px-3 py-2 rounded-lg border text-sm font-medium transition ${
                selectedDate === date
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-teal-50"
              }`}
            >
              <span>{day}</span>
              <span>{dayNum}</span>
            </button>
          );
        })}
      </div>

      {/* Slots for Selected Date */}
      <h4 className="text-sm font-semibold text-gray-700 mt-4 mb-2">Available Slots</h4>
      <div className="flex flex-wrap gap-2">
        {doctorSlots[selectedDate] && doctorSlots[selectedDate].length > 0 ? (
          doctorSlots[selectedDate].map((slot, idx) => (
            <span
              key={idx}
              className="px-4 py-2 rounded-lg text-sm font-medium border bg-white text-gray-700 border-gray-300 hover:bg-teal-50"
            >
              {slot.startTime} - {slot.endTime}
            </span>
          ))
        ) : (
          <span className="text-xs text-gray-500 italic">
            No slots available for this day.
          </span>
        )}
      </div>
    </div>
  );
}


export default function Doctors() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    name: "", specialization: "", email: "", phone: "", availability: "online",
    isAvailable: "available", selectedDay: ""
  });
  
  // Changed to handle multiple dates with their slots
  const [dateSlots, setDateSlots] = useState({}); // { "2024-01-18": [{startTime: "09:00", endTime: "09:15"}], "2024-01-19": [...] }
  const [currentDate, setCurrentDate] = useState("");
  const [currentSlots, setCurrentSlots] = useState([]);
  
  const [slotInput, setSlotInput] = useState({ start: "", end: "" });
  const [slotDuration, setSlotDuration] = useState(15);
  const [addingNew, setAddingNew] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [apptModalOpen, setApptModalOpen] = useState(false);
  const [selectedDoctorForAppt, setSelectedDoctorForAppt] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const token = localStorage.getItem("token");

  const dateScrollRef = useRef();
  const slotScrollRef = useRef();

  // Fetch doctors
  const fetchDoctors = async () => {
    try {
      const res = await axios.get(`${backend_url}/api/doctors`, { headers: { Authorization: `Bearer ${token}` } });
      setDoctors(res.data.data || []);
    } catch (err) { 
      console.error(err);
      alert("Failed to fetch doctors"); 
    }
  };
  useEffect(() => { fetchDoctors(); }, []);

  const fetchAppointments = async (doctorId) => {
    try {
      const res = await axios.get(`${backend_url}/api/appointments/doctor/${doctorId}`, { headers: { Authorization: `Bearer ${token}` } });
      setAppointments(res.data.data || []);
    } catch (err) { console.error(err); alert("Failed to fetch appointments"); setAppointments([]); }
  };

  // Fetch all slots for a doctor (multiple dates)
  const fetchDoctorAllSlots = async (doctorId) => {
    if (!doctorId) return;
    try {
      const res = await axios.get(`${backend_url}/api/doctors/${doctorId}/all-slots`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const payload = res.data?.data ?? res.data;
      if (payload && typeof payload === 'object') {
        setDateSlots(payload);
      }
    } catch (err) {
      console.warn("Could not fetch all slots for doctor:", err);
      setDateSlots({});
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "isAvailable" && value === "not_available") {
      setDateSlots({});
      setCurrentSlots([]);
    }
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleScroll = (ref, dir) => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir === "left" ? -120 : 120, behavior: "smooth" });
  };

  // Generate upcoming dates filtered by selected day
  const getUpcomingDates = (day) => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const temp = new Date(today);
      temp.setDate(today.getDate() + i);
      if (!day || temp.getDay() === parseInt(day)) dates.push(temp);
    }
    return dates;
  };

  // Generate slots for current date
  const generateSlots = (start, end, duration) => {
    if (!start || !end || !duration || !currentDate) {
      alert("Please select a date first");
      return;
    }
    
    const slots = [];
    let [startH, startM] = start.split(":").map(Number);
    let [endH, endM] = end.split(":").map(Number);

    let startDate = new Date(); startDate.setHours(startH, startM, 0, 0);
    let endDate = new Date(); endDate.setHours(endH, endM, 0, 0);

    while (startDate < endDate) {
      let slotEnd = new Date(startDate.getTime() + duration * 60000);
      if (slotEnd > endDate) break;
      slots.push({ 
        startTime: startDate.toTimeString().slice(0,5), 
        endTime: slotEnd.toTimeString().slice(0,5) 
      });
      startDate = slotEnd;
    }

    setCurrentSlots(slots);
    setDateSlots(prev => ({
      ...prev,
      [currentDate]: slots
    }));
  };

  // Handle date selection
  const handleDateSelect = (formattedDate) => {
    setCurrentDate(formattedDate);
    // Load existing slots for this date if available
    const existingSlots = dateSlots[formattedDate] || [];
    setCurrentSlots(existingSlots);
  };

  // Add or Update doctor
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    if (!form.name?.trim() || !form.specialization?.trim() || !form.email?.trim()) {
      alert("Name, specialization, and email are required");
      return;
    }

    // Prepare FormData for file + fields
    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("specialization", form.specialization.trim());
    formData.append("email", form.email.trim());
    if (form.phone?.trim()) formData.append("phone", form.phone.trim());
    formData.append(
      "availabilityType",
      ["online", "offline", "both"].includes(form.availability) ? form.availability : "both"
    );
    formData.append("isAvailable", form.isAvailable);

    // ✅ Append arrays/objects as JSON strings
    if (form.weeklySchedule) {
      formData.append("weeklySchedule", JSON.stringify(form.weeklySchedule));
    }
    if (form.todaySchedule) {
      formData.append("todaySchedule", JSON.stringify(form.todaySchedule));
    }
    if (form.universities) {
      formData.append("universities", JSON.stringify(form.universities));
    }

    // ✅ Append image if selected
    if (form.imageFile) {
      formData.append("profileImage", form.imageFile);// 👈 must match upload.single("profileImage")
    }

    // Determine slots to send based on availability
    const slotsToSave = form.isAvailable === "available" ? dateSlots : {};

    if (editingId) {
      // Update existing doctor (PUT with FormData)
      await axios.put(`${backend_url}/api/doctors/${editingId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ Update all date slots and availability
      await axios.patch(
        `${backend_url}/api/doctors/${editingId}/all-slots`,
        { dateSlots: slotsToSave, isAvailable: form.isAvailable },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } else {
      // Create new doctor
      const res = await axios.post(`${backend_url}/api/doctors`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const doctorId = res.data.data?._id;

      // ✅ Save all date slots and availability
      if (doctorId) {
        await axios.patch(
          `${backend_url}/api/doctors/${doctorId}/all-slots`,
          { dateSlots: slotsToSave, isAvailable: form.isAvailable },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      alert(
        `Doctor added! Temporary password: ${
          res.data.generatedPassword ||
          res.data.data?.generatedPassword ||
          "check response"
        }`
      );
    }

    // Reset form
    setForm({
      name: "",
      specialization: "",
      email: "",
      phone: "",
      availability: "online",
      isAvailable: "available",
      selectedDay: "",
      weeklySchedule: [],
      todaySchedule: null,
      universities: [],
      imageFile: null,
    });
    setDateSlots({});
    setCurrentSlots([]);
    setCurrentDate("");
    setSlotInput({ start: "", end: "" });
    setSlotDuration(15);
    setAddingNew(false);
    setEditingId(null);
    fetchDoctors();
  } catch (err) {
    console.error("Error saving doctor:", err.response?.data || err.message);
    alert(err.response?.data?.message || "Error saving doctor");
  }
};





  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;
    try { 
      await axios.delete(`${backend_url}/api/doctors/${id}`, { headers: { Authorization: `Bearer ${token}` } }); 
      fetchDoctors(); 
    }
    catch (err) { console.error(err); alert("Failed to delete doctor"); }
  };

  const openAppointments = async (doctor) => { 
    setSelectedDoctorForAppt(doctor); 
    await fetchAppointments(doctor._id); 
    setApptModalOpen(true); 
  };
  const closeAppointments = () => { setApptModalOpen(false); setSelectedDoctorForAppt(null); setAppointments([]); };

  const updateAppointmentStatus = async (apptId, status) => {
    try { 
      await axios.patch(`${backend_url}/api/appointments/${apptId}`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      if (selectedDoctorForAppt) await fetchAppointments(selectedDoctorForAppt._id);
    } catch (err) { console.error(err); alert("Failed to update appointment status"); }
  };

  // When clicking Edit on a doctor - prefill form and set editingId
  const handleEdit = (doctor) => {
    setAddingNew(true);
    setEditingId(doctor._id);

    setForm({
      name: doctor.name || "",
      specialization: doctor.specialization || "",
      email: doctor.email || "",
      phone: doctor.phone || "",
      availability: doctor.availabilityType || doctor.availability || "online",
      isAvailable: doctor.isAvailable || "available",
      selectedDay: ""
    });

    // Load all slots for this doctor
    fetchDoctorAllSlots(doctor._id);
    setCurrentDate("");
    setCurrentSlots([]);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Remove single slot from current date slots
  const removeSlotAt = (index) => {
    const updatedSlots = currentSlots.filter((_, i) => i !== index);
    setCurrentSlots(updatedSlots);
    if (currentDate) {
      setDateSlots(prev => ({
        ...prev,
        [currentDate]: updatedSlots
      }));
    }
  };

  // Remove all slots for a specific date
  const removeAllSlotsForDate = (date) => {
    const newDateSlots = { ...dateSlots };
    delete newDateSlots[date];
    setDateSlots(newDateSlots);
    if (currentDate === date) {
      setCurrentSlots([]);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 max-w-full mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setSidebarOpen(true)} className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition">
            <Menu size={24}/>
          </button>
          <h1 className="text-3xl font-bold text-indigo-700">Doctors</h1>
          <div className="bg-white/20 px-4 py-2 rounded-lg text-indigo-700 font-semibold">Admin</div>
        </div>

        {/* Add Doctor Button */}
        {!addingNew && (
          <button onClick={() => { 
            setAddingNew(true); 
            setEditingId(null); 
            setForm({ name:"", specialization:"", email:"", phone:"", availability:"online", isAvailable:"available", selectedDay:"" }); 
            setDateSlots({});
            setCurrentSlots([]);
            setCurrentDate("");
          }} className="mb-6 bg-white/20 backdrop-blur-md text-indigo-700 px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-2xl transition">
            + Add Doctor
          </button>
        )}

        {/* Add / Edit Doctor Form */}
        {addingNew && (
          <div className="bg-white/30 backdrop-blur-md rounded-3xl shadow-lg p-6 mb-6 max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500" name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
                <input className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500" name="specialization" placeholder="Specialization" value={form.specialization} onChange={handleChange} required />
                <input className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
                <input className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
             <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setForm({ ...form, imageFile: e.target.files[0] })} 
                className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
              />

                {/* Preview if selected */}
                {form.imageFile && (
                  <img 
                    src={URL.createObjectURL(form.imageFile)} 
                    alt="Preview" 
                    className="w-20 h-20 rounded-full object-cover mt-2"
                  />
                )}


              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Availability */}
                <div>
                  <label className="block mb-1 font-semibold">Availability</label>
                  <select name="availability" className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500" value={form.availability} onChange={handleChange}>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block mb-1 font-semibold">Status</label>
                  <select name="isAvailable" className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500" value={form.isAvailable} onChange={handleChange}>
                    <option value="available">Available</option>
                    <option value="not_available">Not Available</option>
                  </select>
                </div>

                {/* Day filter */}
                <div>
                  <label className="block mb-1 font-semibold">Filter by Day</label>
                  <select name="selectedDay" className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500" value={form.selectedDay} onChange={handleChange}>
                    <option value="">All Days</option>
                    <option value="0">Sunday</option>
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                  </select>
                </div>
              </div>

              {/* Date Picker */}
              <div className="space-y-4">
                <div className="relative">
                  <label className="text-sm font-semibold text-gray-700 flex items-center mb-2">
                    <CalendarDays className="mr-2 text-teal-600" size={18} />
                    Select Date for Slots
                  </label>
                  <div className="relative flex items-center">
                    <button type="button" onClick={() => handleScroll(dateScrollRef, "left")} className="absolute left-0 z-10 p-1 bg-white rounded-full shadow hover:bg-gray-100">
                      <ChevronLeft size={18} />
                    </button>
                    <div ref={dateScrollRef} className="flex space-x-3 overflow-x-auto no-scrollbar mx-7 pb-2">
                      {getUpcomingDates(form.selectedDay).map((date, i) => {
                        const formattedDate = date.toISOString().split("T")[0];
                        const isSelected = currentDate === formattedDate;
                        const hasSlots = dateSlots[formattedDate] && dateSlots[formattedDate].length > 0;
                        return (
                          <button 
                            key={i} 
                            type="button" 
                            onClick={() => handleDateSelect(formattedDate)} 
                            className={`min-w-[80px] flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl border text-sm transition-all relative ${
                              isSelected 
                                ? "bg-teal-600 text-white border-teal-600 shadow-md scale-[1.02]" 
                                : "bg-white hover:bg-teal-50 border-gray-300 text-gray-700"
                            }`}
                          >
                            <span className="font-bold">{date.toLocaleDateString("en-US", { day: "numeric" })}</span>
                            <span className="text-xs">{date.toLocaleDateString("en-US", { month: "short" })}</span>
                            {hasSlots && (
                              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${isSelected ? "bg-yellow-300" : "bg-green-500"}`}></div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <button type="button" onClick={() => handleScroll(dateScrollRef, "right")} className="absolute right-0 z-10 p-1 bg-white rounded-full shadow hover:bg-gray-100">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

                {/* Current selected date display */}
                {currentDate && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-800">
                      Selected Date: {new Date(currentDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Generate Slots for selected date */}
              {form.isAvailable === "available" && currentDate && (
                <div className="space-y-4 border-t pt-4">
                  <label className="block mb-1 font-semibold text-lg">Generate Time Slots for Selected Date</label>
                  <div className="flex flex-wrap items-center gap-2">
                    <input 
                      type="time" 
                      className="p-2 border rounded focus:ring-2 focus:ring-yellow-400" 
                      value={slotInput.start} 
                      onChange={(e) => setSlotInput(s => ({ ...s, start: e.target.value }))} 
                    />
                    <span>to</span>
                    <input 
                      type="time" 
                      className="p-2 border rounded focus:ring-2 focus:ring-yellow-400" 
                      value={slotInput.end} 
                      onChange={(e) => setSlotInput(s => ({ ...s, end: e.target.value }))} 
                    />
                    <input 
                      type="number" 
                      min={1} 
                      max={120} 
                      value={slotDuration} 
                      onChange={(e) => setSlotDuration(Number(e.target.value))} 
                      className="w-20 p-2 border rounded focus:ring-2 focus:ring-yellow-400" 
                      placeholder="Min" 
                    />
                    <button 
                      type="button" 
                      onClick={() => generateSlots(slotInput.start, slotInput.end, slotDuration)} 
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                      Generate
                    </button>
                  </div>

                  {/* Display slots for current selected date */}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800">Slots for {currentDate}:</h4>
                      {currentSlots.length > 0 && (
                        <button 
                          type="button" 
                          onClick={() => {
                            setCurrentSlots([]);
                            setDateSlots(prev => {
                              const newSlots = { ...prev };
                              delete newSlots[currentDate];
                              return newSlots;
                            });
                          }}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Clear All Slots
                        </button>
                      )}
                    </div>

                    <button type="button" onClick={() => handleScroll(slotScrollRef, "left")} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-white rounded-full shadow hover:bg-gray-100">
                      <ChevronLeft size={18} />
                    </button>

                    <div ref={slotScrollRef} className="flex space-x-2 overflow-x-auto no-scrollbar mx-7 pb-2 min-h-[2.5rem]">
                      {currentSlots.length > 0 ? (
                        currentSlots.map((slot, i) => (
                          <div key={i} className="bg-blue-100 text-blue-800 rounded-lg px-3 py-2 flex items-center gap-2 whitespace-nowrap text-sm">
                            {slot.startTime} - {slot.endTime}
                            <button 
                              type="button" 
                              onClick={() => removeSlotAt(i)} 
                              className="hover:text-red-600 ml-1" 
                              aria-label={`Remove slot ${i}`}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 italic pl-3 py-2">No slots generated for this date</p>
                      )}
                    </div>

                    <button type="button" onClick={() => handleScroll(slotScrollRef, "right")} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-white rounded-full shadow hover:bg-gray-100">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* Summary of all dates with slots */}
              {Object.keys(dateSlots).length > 0 && (
                <div className="border-t pt-4 space-y-2">
                  <h4 className="font-semibold text-gray-800">Summary - All Dates with Slots:</h4>
                  <div className="max-h-40 overflow-y-auto space-y-2 bg-gray-50 rounded-lg p-3">
                    {Object.entries(dateSlots).map(([date, slots]) => (
                      <div key={date} className="flex justify-between items-center bg-white rounded-lg p-2 shadow-sm">
                        <div>
                          <span className="font-medium text-sm text-gray-800">
                            {new Date(date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                          <span className="text-xs text-gray-600 ml-2">
                            ({slots.length} slots)
                          </span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeAllSlotsForDate(date)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 justify-end mt-6">
                <button type="submit" className="bg-indigo-700 text-white px-6 py-2 rounded shadow hover:bg-indigo-800 transition">
                  {editingId ? "Update Doctor" : "Add Doctor"}
                </button>
                <button 
                  type="button" 
                  onClick={() => { 
                    setAddingNew(false); 
                    setEditingId(null); 
                    setForm({ name: "", specialization: "", email: "", phone: "", availability: "online", isAvailable: "available", selectedDay: "" }); 
                    setDateSlots({});
                    setCurrentSlots([]);
                    setCurrentDate("");
                  }} 
                  className="px-6 py-2 rounded border hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Doctor List */}
<div className="relative px-4 flex flex-col gap-6">
  {doctors.map((doc) => (
    <div 
      key={doc._id} 
      className="relative bg-white/40 backdrop-blur-lg rounded-2xl shadow-lg p-6 hover:shadow-2xl transition max-w-3xl mx-auto w-full"
    >
      {/* Wrapper: Left (image) + Right (content) */}
      <div className="flex flex-row items-start gap-6">
        
        {/* Left: Profile Image */}
        {doc.imageUrl && (
          <div className="flex-shrink-0">
            <img
              src={`${backend_url}${doc.imageUrl}`}
              alt={doc.name}
              className="w-40 h-80 mt-auto rounded-2xl object-cover shadow-md"
            />
          </div>
        )}

        {/* Right: Info + Actions */}
        <div className="flex-1 flex flex-col justify-between">
          {/* Name + Details */}
          <div className="mb-4">
            <h3 className="text-2xl font-extrabold text-indigo-800 tracking-wide">
              {doc.name}
            </h3>
            <p className="text-base text-gray-700 font-medium">{doc.specialization}</p>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-semibold">Email:</span> {doc.email}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Phone:</span> {doc.phone}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Availability:</span>{" "}
              <span className="capitalize text-green-700 font-semibold">
                {doc.availabilityType || doc.availability}
              </span>
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 flex-wrap mb-4">
            <button
              onClick={() => openAppointments(doc)}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition text-sm font-semibold shadow"
            >
              Appointments
            </button>
            <button
              onClick={() => handleEdit(doc)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm font-semibold shadow"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(doc._id)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm font-semibold shadow"
            >
              Delete
            </button>
          </div>

          {/* Slots Box */}
          <div className="bg-gray-100  px-5 py-2 rounded-xl shadow-inner">
              <DoctorSlotsDisplay
              doctorSlots={doc.isAvailable === "available" ? (doc.slots || doc.dateSlots) : {}}
            />
          </div>
        </div>
      </div>
    </div>
  ))}
</div>


      </div>

      {/* Appointment Modal */}
      {apptModalOpen && selectedDoctorForAppt && (
        <AppointmentListModal
          doctor={selectedDoctorForAppt}
          appointments={appointments}
          onClose={closeAppointments}
          onUpdateStatus={updateAppointmentStatus}
        />
      )}
    </div>
  );
}