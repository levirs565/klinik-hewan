import type { RequestStatus } from "../types";

export const statusLabel: Record<RequestStatus, string> = {
  new: "Baru",
  "doctor-pending": "Menunggu Dokter",
  confirmed: "Dikonfirmasi",
  rejected: "Ditolak",
  doctor_rejected: "Ditolak Dokter",
  completed: "Selesai",
  "Menunggu Konfirmasi": "Baru",
  "Menunggu Dokter": "Menunggu Dokter",
  Diterima: "Dikonfirmasi",
  Ditolak: "Ditolak",
  "Dalam Penanganan": "Dalam Penanganan",
  Selesai: "Selesai",
  "Selesai Administrasi": "Selesai",
};

export const statusIcon: Record<RequestStatus, string> = {
  new: "fiber_new",
  "doctor-pending": "hourglass_top",
  confirmed: "check_circle",
  rejected: "cancel",
  doctor_rejected: "block",
  completed: "task_alt",
  "Menunggu Konfirmasi": "fiber_new",
  "Menunggu Dokter": "hourglass_top",
  Diterima: "check_circle",
  Ditolak: "cancel",
  "Dalam Penanganan": "medical_services",
  Selesai: "task_alt",
  "Selesai Administrasi": "payments",
};

export const getStatusClass = (status: string) => {
  switch (status) {
    case "Menunggu Konfirmasi":
      return "new";
    case "Diterima":
    case "Dalam Penanganan":
    case "Selesai":
    case "Selesai Administrasi":
      return "confirmed";
    case "Ditolak":
      return "rejected";
    case "Menunggu Dokter":
      return "doctor-pending";
    default:
      return status.toLowerCase().replace(/\s+/g, "-");
  }
};

export const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
