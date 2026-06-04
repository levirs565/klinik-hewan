import { useState } from "react";

interface RejectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isSubmitting: boolean;
}

export function RejectionDialog({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}: RejectionDialogProps) {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onConfirm(reason);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="section-title">
          <div>
            <p>Konfirmasi Pembatalan</p>
            <h2>Alasan Penolakan</h2>
          </div>
          <button className="icon-button" onClick={onClose} type="button">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="stack-form">
          <p>Silakan berikan alasan mengapa janji temu ini ditolak.</p>
          <label>
            Alasan
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Jadwal dokter penuh, klinik tutup, dsb."
              required
              minLength={5}
              autoFocus
            />
          </label>

          <div className="button-row mt-4">
            <button
              className="secondary-button"
              onClick={onClose}
              type="button"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              className="primary-button strong"
              type="submit"
              disabled={isSubmitting || !reason.trim()}
            >
              {isSubmitting ? "Mengirim..." : "Tolak Janji Temu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
