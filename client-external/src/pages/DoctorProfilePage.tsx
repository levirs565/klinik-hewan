// import { useEffect, useMemo, useState } from "react";
// import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
// import { Avatar, BottomNavigation } from "../components";
// import { apiClient } from "../services/api";
// import type { Appointment, Doctor, Pet } from "../types";

// const serviceLabels: Record<Appointment["service_type"], string> = {
//   vaksin: "Vaccination",
//   checkup: "General Checkup",
//   pengobatan: "Treatment",
// };

// export const DoctorProfilePage = () => {
//   const navigate = useNavigate();
//   const { id } = useParams();
//   const doctorId = Number(id);
//   const [doctors, setDoctors] = useState<Doctor[]>([]);
//   const [appointments, setAppointments] = useState<Appointment[]>([]);
//   const [pets, setPets] = useState<Pet[]>([]);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       try {
//         const [doctorRes, appointmentRes, petRes] = await Promise.all([
//           apiClient.getDoctors(),
//           apiClient.getAppointments(),
//           apiClient.getPets(),
//         ]);
//         if (!mounted) return;
//         setDoctors(doctorRes);
//         setAppointments(appointmentRes);
//         setPets(petRes);
//       } catch (error) {
//         console.error("Failed to load doctor profile:", error);
//       } finally {
//         if (mounted) setIsLoading(false);
//       }
//     })();
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   const doctor = useMemo(
//     () => doctors.find((item) => item.id === doctorId),
//     [doctorId, doctors],
//   );
//   // const serviceHistory = appointments.filter(
//   //   (appointment) => appointment.doctor_id === doctorId,
//   // );

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-surface flex items-center justify-center">
//         <p className="text-body-md text-on-surface">
//           Loading doctor profile...
//         </p>
//       </div>
//     );
//   }

//   if (!doctor) {
//     return <Navigate to="/appointments" replace />;
//   }

//   return (
//     <div className="min-h-screen bg-surface pb-24">
//       <header className="bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-10">
//         <div className="px-6 py-4 flex items-center justify-between">
//           <button
//             className="p-2 -ml-2 rounded-full hover:bg-surface-container-low"
//             onClick={() => navigate(-1)}
//             type="button"
//             aria-label="Go Back"
//           >
//             <span className="material-symbols-outlined text-primary">
//               arrow_back
//             </span>
//           </button>
//           <h1 className="text-headline-md font-bold text-primary">
//             Detail Dokter
//           </h1>
//           <span className="w-10" />
//         </div>
//       </header>

//       <main className="px-6 py-6 space-y-6">
//         <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 text-center">
//           <div className="mx-auto w-max mb-4">
//             <Avatar
//               src={doctor.image_url}
//               alt={doctor.name}
//               size="xl"
//               initials={doctor.name.substring(0, 2).toUpperCase()}
//             />
//           </div>
//           <h2 className="text-headline-md text-on-surface">{doctor.name}</h2>
//           <p className="text-body-md text-on-surface-variant">
//             {doctor.specialization}
//           </p>
//           <span className="inline-flex mt-4 bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full text-label-sm capitalize">
//             {doctor.status}
//           </span>
//         </section>

//         <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 space-y-4">
//           <h3 className="text-headline-sm text-primary">
//             Informasi Profesional
//           </h3>
//           <InfoLine label="Nama Dokter" value={doctor.name} />
//           <InfoLine
//             label="Riwayat Pendidikan"
//             value={doctor.education ?? "-"}
//           />
//           <InfoLine
//             label="Tanggal Mulai Praktik"
//             value={formatDate(doctor.practice_start)}
//           />
//           <InfoLine
//             label="Tanggal Masuk"
//             value={formatDate(doctor.joined_at)}
//           />
//           <InfoLine label="Jadwal" value={doctor.schedule} />
//           <InfoLine label="Email" value={doctor.email} />
//           <InfoLine label="Telepon" value={doctor.phone} />
//           <InfoLine
//             label="Riwayat Tempat Praktek"
//             value={doctor.practice_history?.join(", ") ?? "-"}
//           />
//         </section>

//         <section>
//           <h3 className="text-headline-sm text-on-surface mb-4">
//             Riwayat Pelayanan
//           </h3>
//           <div className="space-y-4">
//             {serviceHistory.length === 0 ? (
//               <p className="text-body-md text-on-surface-variant">
//                 Belum ada riwayat layanan.
//               </p>
//             ) : (
//               serviceHistory.map((appointment) => {
//                 const pet = pets.find((item) => item.id === appointment.pet_id);
//                 return (
//                   <Link
//                     key={appointment.id}
//                     to={`/appointments/${appointment.id}`}
//                     className="block bg-surface-container-lowest border border-outline-variant rounded-xl p-5 hover:bg-surface-container-low transition-colors"
//                   >
//                     <div className="flex items-start justify-between gap-4">
//                       <div className="flex items-center gap-3">
//                         <Avatar
//                           src={pet?.avatar_url}
//                           alt={pet?.name}
//                           size="md"
//                           initials={pet?.name.substring(0, 2).toUpperCase()}
//                         />
//                         <div>
//                           <h4 className="text-headline-sm text-on-surface">
//                             {pet?.name ?? "Unknown Pet"}
//                           </h4>
//                           <p className="text-body-sm text-on-surface-variant">
//                             {serviceLabels[appointment.service_type]}
//                           </p>
//                         </div>
//                       </div>
//                       <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-label-sm">
//                         {appointment.status.replace(/_/g, " ")}
//                       </span>
//                     </div>
//                     <div className="border-t border-outline-variant mt-4 pt-4">
//                       <p className="text-label-sm text-on-surface-variant">
//                         Date & Time
//                       </p>
//                       <p className="text-body-md text-on-surface font-semibold">
//                         {formatDateTime(appointment.appointment_date)}
//                       </p>
//                     </div>
//                   </Link>
//                 );
//               })
//             )}
//           </div>
//         </section>
//       </main>

//       <BottomNavigation />
//     </div>
//   );
// };

// function InfoLine({ label, value }: { label: string; value: string }) {
//   return (
//     <div className="border-b border-outline-variant pb-3 last:border-b-0 last:pb-0">
//       <p className="text-label-sm text-on-surface-variant mb-1">{label}</p>
//       <p className="text-body-md text-on-surface">{value}</p>
//     </div>
//   );
// }

// function formatDate(value?: string) {
//   if (!value) return "-";
//   return new Date(value).toLocaleDateString("id-ID", {
//     day: "2-digit",
//     month: "long",
//     year: "numeric",
//   });
// }

// function formatDateTime(value: string) {
//   return new Date(value).toLocaleString("id-ID", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// }
