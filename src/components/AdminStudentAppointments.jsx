// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import {
//   CheckCircle,
//   XCircle,
//   Menu,
//   Calendar,
//   User,
//   LogOut,
// } from "lucide-react";

// const backend_url = import.meta.env.VITE_API_BASE_URL;

// export default function AdminStudentAppointments() {
//   const [appointments, setAppointments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const token = localStorage.getItem("token");

//   // Logout function clears localStorage and redirects to home/login
//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     window.location.href = "/"; // Redirect to login or home page
//   };

//   useEffect(() => {
//     const fetchAppointments = async () => {
//       try {
//         const res = await axios.get(`${backend_url}/api/admin/appointments`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setAppointments(res.data.data || []);
//       } catch (err) {
//         console.error(
//           "Failed to fetch appointments:",
//           err.response?.data || err.message
//         );
//         setAppointments([]);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchAppointments();
//   }, [token]);

//   const handleUpdateStatus = async (id, newStatus) => {
//     if (!confirm(`Are you sure you want to ${newStatus} this appointment?`))
//       return;

//     try {
//       if (newStatus === "rejected") {
//         await axios.delete(`${backend_url}/api/admin/appointments/${id}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setAppointments((prev) => prev.filter((a) => a._id !== id));
//         alert("❌ Appointment rejected and deleted.");
//         return;
//       }

//       const res = await axios.patch(
//         `${backend_url}/api/admin/appointments/${id}/status`,
//         { status: "approved" },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       const updated = res.data.data;
//       setAppointments((prev) => prev.map((a) => (a._id === id ? updated : a)));
//       alert("✅ Appointment approved and notification sent.");
//     } catch (err) {
//       console.error(
//         "Failed to update status:",
//         err.response?.data || err.message
//       );
//       alert("❌ Failed to update status. See console.");
//     }
//   };

//   // Loading skeleton component for subtle smooth visual on loading
//   const LoadingSkeleton = () => (
//     <div className="space-y-6 animate-pulse">
//       {[...Array(3)].map((_, i) => (
//         <div
//           key={i}
//           className="h-40 bg-white rounded-2xl shadow-md border border-gray-200"
//         >
//           <div className="p-6">
//             <div className="h-6 w-40 bg-gray-300 rounded mb-4"></div>
//             <div className="h-4 w-24 bg-gray-300 rounded mb-3"></div>
//             <div className="h-4 w-32 bg-gray-300 rounded mb-1"></div>
//             <div className="h-4 w-20 bg-gray-300 rounded mb-1"></div>
//             <div className="h-4 w-28 bg-gray-300 rounded mb-2"></div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );

//   return (
//     <div className="flex h-screen bg-gradient-to-tr from-indigo-50 via-white to-indigo-100">
//       {/* Sidebar */}
//       <aside
//         className={`fixed inset-y-0 left-0 w-64 bg-white shadow-2xl transform ${
//           sidebarOpen ? "translate-x-0" : "-translate-x-full"
//         } transition-transform duration-300 ease-in-out z-30 md:translate-x-0 md:static md:shadow-none rounded-r-3xl`}
//       >
//         <div className="flex flex-col h-full">
//           <div className="px-6 py-6 border-b border-indigo-200 flex items-center justify-between">
//             <h1 className="text-2xl font-extrabold text-indigo-700 flex items-center gap-3 select-none">
//               <Calendar size={28} className="text-indigo-500" /> Admin Panel
//             </h1>
//             <button
//               onClick={() => setSidebarOpen(false)}
//               className="md:hidden text-indigo-600 hover:text-indigo-800 rounded-lg transition"
//               aria-label="Close sidebar"
//             >
//               ✕
//             </button>
//           </div>
//           <nav className="flex flex-col flex-grow p-6 space-y-5 text-indigo-700 text-lg font-semibold select-none">
//             <button
//               className="flex items-center gap-3 py-3 px-4 rounded-2xl bg-indigo-100 shadow-inner cursor-default"
//               aria-current="page"
//             >
//               <Calendar size={22} /> Appointments
//             </button>
//             <a
//               href="/admin-doctors"
//               className="flex items-center gap-3 hover:text-indigo-800 hover:bg-indigo-50 py-3 px-4 rounded-2xl transition-colors"
//               tabIndex={-1}
//             >
//               <User size={22} /> Doctors
//             </a>
//             <a
//               href="#"
//               className="flex items-center gap-3 hover:text-indigo-800 hover:bg-indigo-50 py-3 px-4 rounded-2xl transition-colors"
//               tabIndex={-1}
//             >
//               <User size={22} /> Settings
//             </a>
//             <button
//               onClick={handleLogout}
//               className="mt-auto bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-bold rounded-3xl px-7 py-3 shadow-lg transition transform hover:scale-105"
//               aria-label="Logout"
//             >
//               Logout
//             </button>
//           </nav>
//         </div>
//       </aside>

//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-30 z-20 md:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Main content */}
//       <div className="flex flex-col flex-1 overflow-y-auto">
//         {/* Header */}
//         <header className="bg-white shadow-lg flex items-center justify-between px-8 py-5 sticky top-0 z-10 rounded-b-3xl">
//           <button
//             onClick={() => setSidebarOpen(true)}
//             className="md:hidden p-2 rounded-md text-indigo-600 hover:text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-transform active:scale-95"
//             aria-label="Open sidebar"
//           >
//             <Menu size={28} />
//           </button>
//           <h2 className="text-3xl font-extrabold text-indigo-800 tracking-tight select-none drop-shadow-sm">
//             Student Appointments
//           </h2>
//         </header>

//         <main className="p-8 max-w-7xl w-full mx-auto">
//           {loading ? (
//             <LoadingSkeleton />
//           ) : appointments.length === 0 ? (
//             <div className="text-center text-indigo-600 mt-20 text-xl font-semibold select-none">
//               No appointments have been booked yet.
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//               {appointments.map((appt) => (
//                 <article
//                   key={appt._id}
//                   className="bg-white rounded-3xl shadow-xl p-6 cursor-default select-text transition-shadow duration-300 hover:shadow-2xl hover:-translate-y-1 ease-in-out"
//                 >
//                   <header className="flex justify-between items-start mb-4">
//                     <div>
//                       <h3 className="font-extrabold text-xl text-indigo-900">
//                         {appt.patientName || appt.student?.name || "Unknown Student"}
//                       </h3>
//                       <p className="text-sm text-indigo-500 mt-1 select-text">
//                         {appt.phone || appt.student?.phone || "-"}
//                       </p>
//                     </div>
//                     <span
//                       className={`text-xs px-4 py-1 rounded-full font-semibold tracking-wider ${
//                         appt.status === "approved"
//                           ? "bg-green-200 text-green-900"
//                           : appt.status === "rejected"
//                           ? "bg-red-200 text-red-900"
//                           : "bg-yellow-200 text-yellow-900"
//                       } select-none`}
//                       aria-label={`Status: ${appt.status}`}
//                     >
//                       {appt.status}
//                     </span>
//                   </header>
//                   <section className="text-indigo-700 text-sm space-y-2 mb-8 leading-relaxed">
//                     <p>
//                       <strong>Doctor:</strong>{" "}
//                       {appt.doctor?.name || "N/A"}{" "}
//                       {appt.doctor?.specialization ? `(${appt.doctor.specialization})` : ""}
//                     </p>
//                     <p>
//                       <strong>Date:</strong>{" "}
//                       {new Date(appt.slotStart).toLocaleDateString(undefined, {
//                         year: "numeric",
//                         month: "short",
//                         day: "numeric",
//                       })}
//                     </p>
//                     <p>
//                       <strong>Time:</strong>{" "}
//                       {new Date(appt.slotStart).toLocaleTimeString(undefined, {
//                         hour: "2-digit",
//                         minute: "2-digit",
//                       })}{" "}
//                       -{" "}
//                       {new Date(appt.slotEnd).toLocaleTimeString(undefined, {
//                         hour: "2-digit",
//                         minute: "2-digit",
//                       })}
//                     </p>
//                     <p>
//                       <strong>Mode:</strong> {appt.mode || "-"}
//                     </p>
//                     <p>
//                       <strong>Notes:</strong> {appt.notes || "-"}
//                     </p>
//                   </section>
//                   {appt.status === "pending" && (
//                     <div className="flex gap-5">
//                       <button
//                         onClick={() => handleUpdateStatus(appt._id, "approved")}
//                         className="flex-1 py-3 flex items-center justify-center gap-3 bg-green-600 text-white rounded-3xl shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-green-300"
//                         aria-label="Approve appointment"
//                       >
//                         <CheckCircle size={20} /> Approve
//                       </button>
//                       <button
//                         onClick={() => handleUpdateStatus(appt._id, "rejected")}
//                         className="flex-1 py-3 flex items-center justify-center gap-3 bg-red-600 text-white rounded-3xl shadow-lg hover:bg-red-700 transition-transform transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-300"
//                         aria-label="Reject appointment"
//                       >
//                         <XCircle size={20} /> Reject
//                       </button>
//                     </div>
//                   )}
//                 </article>
//               ))}
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }


import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Menu,
  Calendar,
  User,
  LogOut,
} from "lucide-react";

const backend_url = import.meta.env.VITE_API_BASE_URL;

export default function AdminStudentAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Logout function clears localStorage and redirects to home/login
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/"; // Redirect to login or home page
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get(`${backend_url}/api/admin/appointments/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointments(res.data.data || []);
      } catch (err) {
        console.error(
          "Failed to fetch appointments:",
          err.response?.data || err.message
        );
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [token]);

  const handleUpdateStatus = async (id, newStatus) => {
    if (!confirm(`Are you sure you want to ${newStatus} this appointment?`))
      return;

    try {
      const res = await axios.patch(
        `${backend_url}/api/admin/appointments/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove from current list
      setAppointments((prev) => prev.filter((a) => a._id !== id));

      if (newStatus === "approved") {
        alert("✅ Appointment approved and notification sent.");
        navigate("/admin/approved-appointments");
      } else if (newStatus === "rejected") {
        alert("❌ Appointment rejected and notification sent.");
        navigate("/admin/rejected-appointments");
      }
    } catch (err) {
      console.error(
        "Failed to update status:",
        err.response?.data || err.message
      );
      alert("❌ Failed to update status. See console.");
    }
  };

  // Loading skeleton component for subtle smooth visual on loading
  const LoadingSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="h-40 bg-white rounded-2xl shadow-md border border-gray-200"
        >
          <div className="p-6">
            <div className="h-6 w-40 bg-gray-300 rounded mb-4"></div>
            <div className="h-4 w-24 bg-gray-300 rounded mb-3"></div>
            <div className="h-4 w-32 bg-gray-300 rounded mb-1"></div>
            <div className="h-4 w-20 bg-gray-300 rounded mb-1"></div>
            <div className="h-4 w-28 bg-gray-300 rounded mb-2"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex h-screen bg-gradient-to-tr from-indigo-50 via-white to-indigo-100">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-2xl transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-30 md:translate-x-0 md:static md:shadow-none rounded-r-3xl`}
      >
        <div className="flex flex-col h-full">
          <div className="px-6 py-6 border-b border-indigo-200 flex items-center justify-between">
            <h1 className="text-2xl font-extrabold text-indigo-700 flex items-center gap-3 select-none">
              <Calendar size={28} className="text-indigo-500" /> Admin Panel
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-indigo-600 hover:text-indigo-800 rounded-lg transition"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>
          <nav className="flex flex-col flex-grow p-6 space-y-5 text-indigo-700 text-lg font-semibold select-none">
            <button
              className="flex items-center gap-3 py-3 px-4 rounded-2xl bg-indigo-100 shadow-inner cursor-default"
              aria-current="page"
            >
              <Calendar size={22} /> Appointments
            </button>
            <a
              href="/admin-doctors"
              className="flex items-center gap-3 hover:text-indigo-800 hover:bg-indigo-50 py-3 px-4 rounded-2xl transition-colors"
              tabIndex={-1}
            >
              <User size={22} /> Doctors
            </a>
            <a
              href="#"
              className="flex items-center gap-3 hover:text-indigo-800 hover:bg-indigo-50 py-3 px-4 rounded-2xl transition-colors"
              tabIndex={-1}
            >
              <User size={22} /> Settings
            </a>
            <button
              onClick={handleLogout}
              className="mt-auto bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-bold rounded-3xl px-7 py-3 shadow-lg transition transform hover:scale-105"
              aria-label="Logout"
            >
              Logout
            </button>
          </nav>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-lg flex items-center justify-between px-8 py-5 sticky top-0 z-10 rounded-b-3xl">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-md text-indigo-600 hover:text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-transform active:scale-95"
            aria-label="Open sidebar"
          >
            <Menu size={28} />
          </button>
          <h2 className="text-3xl font-extrabold text-indigo-800 tracking-tight select-none drop-shadow-sm">
            Student Appointments
          </h2>
        </header>

        <main className="p-8 max-w-7xl w-full mx-auto">
          {loading ? (
            <LoadingSkeleton />
          ) : appointments.length === 0 ? (
            <div className="text-center text-indigo-600 mt-20 text-xl font-semibold select-none">
              No pending appointments.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {appointments.map((appt) => (
                <article
                  key={appt._id}
                  className="bg-white rounded-3xl shadow-xl p-6 cursor-default select-text transition-shadow duration-300 hover:shadow-2xl hover:-translate-y-1 ease-in-out"
                >
                  <header className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-extrabold text-xl text-indigo-900">
                        {appt.patientName || appt.student?.name || "Unknown Student"}
                      </h3>
                      <p className="text-sm text-indigo-500 mt-1 select-text">
                        {appt.phone || appt.student?.phone || "-"}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-4 py-1 rounded-full font-semibold tracking-wider ${
                        appt.status === "approved"
                          ? "bg-green-200 text-green-900"
                          : appt.status === "rejected"
                          ? "bg-red-200 text-red-900"
                          : "bg-yellow-200 text-yellow-900"
                      } select-none`}
                      aria-label={`Status: ${appt.status}`}
                    >
                      {appt.status}
                    </span>
                  </header>
                  <section className="text-indigo-700 text-sm space-y-2 mb-8 leading-relaxed">
                    <p>
                      <strong>Doctor:</strong>{" "}
                      {appt.doctor?.name || "N/A"}{" "}
                      {appt.doctor?.specialization ? `(${appt.doctor.specialization})` : ""}
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(appt.slotStart).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p>
                      <strong>Time:</strong>{" "}
                      {new Date(appt.slotStart).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {new Date(appt.slotEnd).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p>
                      <strong>Mode:</strong> {appt.mode || "-"}
                    </p>
                    <p>
                      <strong>Notes:</strong> {appt.notes || "-"}
                    </p>
                  </section>
                  {appt.status === "pending" && (
                    <div className="flex gap-5">
                      <button
                        onClick={() => handleUpdateStatus(appt._id, "approved")}
                        className="flex-1 py-3 flex items-center justify-center gap-3 bg-green-600 text-white rounded-3xl shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-green-300"
                        aria-label="Approve appointment"
                      >
                        <CheckCircle size={20} /> Approve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(appt._id, "rejected")}
                        className="flex-1 py-3 flex items-center justify-center gap-3 bg-red-600 text-white rounded-3xl shadow-lg hover:bg-red-700 transition-transform transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-300"
                        aria-label="Reject appointment"
                      >
                        <XCircle size={20} /> Reject
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
