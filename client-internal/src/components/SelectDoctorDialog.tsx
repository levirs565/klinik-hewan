import { useDoctors } from "../hooks/useStaff";

interface SelectDoctorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (doctorId: number) => void;
  isSubmitting: boolean;
}

export function SelectDoctorDialog({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}: SelectDoctorDialogProps) {
  const { doctors, isLoading } = useDoctors(isOpen);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="section-title">
          <div>
            <p>Penugasan Medis</p>
            <h2>Pilih Dokter</h2>
          </div>
          <button className="icon-button" onClick={onClose} type="button">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="modal-body">
          <p>Pilih dokter yang akan menangani janji temu ini.</p>

          {isLoading ? (
            <p className="empty">Memuat daftar dokter...</p>
          ) : (
            <div className="stack-list mt-4">
              {doctors.map((doctor) => (
                <button
                  key={doctor.id}
                  className="mini-row"
                  onClick={() => onConfirm(doctor.id)}
                  disabled={isSubmitting}
                  type="button"
                >
                  <img
                    src={
                      doctor.avatar_url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        doctor.full_name,
                      )}&background=random`
                    }
                    alt={doctor.full_name}
                  />
                  <div className="flex-grow text-left">
                    <strong>{doctor.full_name}</strong>
                    <span>Dokter Hewan</span>
                  </div>
                  <span className="material-symbols-outlined">add_circle</span>
                </button>
              ))}
              {doctors.length === 0 && (
                <p className="empty">Tidak ada dokter yang tersedia.</p>
              )}
            </div>
          )}
        </div>

        <div className="button-row mt-6">
          <button
            className="secondary-button"
            onClick={onClose}
            type="button"
            disabled={isSubmitting}
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
