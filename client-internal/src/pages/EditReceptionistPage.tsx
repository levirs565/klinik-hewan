import { useState, type FormEvent, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { client } from "../services/api";
import { useReceptionistDetail } from "../hooks/useStaff";
import { StaffAccountFields } from "../components";

export function EditReceptionistPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { receptionist, isLoading } = useReceptionistDetail(id);

  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (receptionist) {
      setFullName(receptionist.full_name);
      setIsActive(receptionist.is_active);
    }
  }, [receptionist]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const payload: any = {
        full_name: fullName,
        is_active: isActive,
      };

      if (password) {
        payload.password = password;
      }

      await client.put(`/staff/receptionist/${id}`, payload);
      navigate(`/staff/receptionist/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal memperbarui resepsionis");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="app">
        <p className="empty">Memuat data resepsionis...</p>
      </main>
    );
  }

  if (!receptionist) {
    return (
      <main className="app">
        <p className="empty">Resepsionis tidak ditemukan.</p>
        <Link to="/staff" className="text-button">Kembali ke Daftar</Link>
      </main>
    );
  }

  return (
    <main className="app">
      <header className="top-bar">
        <div className="brand">
          <Link className="icon-button" to={`/staff/receptionist/${id}`} aria-label="Kembali">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <p>Edit Resepsionis</p>
            <h1>{receptionist.full_name}</h1>
          </div>
        </div>
      </header>

      <section className="column staff-form-page">
        <form className="stack-form" onSubmit={handleSubmit}>
          {error && <p className="form-error">{error}</p>}

          <StaffAccountFields
            isEdit
            username={receptionist.username}
            password={password}
            setPassword={setPassword}
            fullName={fullName}
            setFullName={setFullName}
            isActive={isActive}
            setIsActive={setIsActive}
          />

          <div className="button-row">
            <Link className="secondary-button" to={`/staff/receptionist/${id}`}>
              Batal
            </Link>
            <button
              className="primary-button strong"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
