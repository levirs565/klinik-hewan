import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { client } from "../services/api";

export function AddReceptionistPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await client.post("/staff/receptionist", {
        username,
        password,
        full_name: fullName,
        is_active: isActive,
      });
      navigate("/staff");
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menambahkan resepsionis");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="app">
      <header className="top-bar">
        <div className="brand">
          <Link className="icon-button" to="/staff" aria-label="Kembali">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <p>Tambah Resepsionis</p>
            <h1>Registrasi Resepsionis Baru</h1>
          </div>
        </div>
      </header>

      <section className="column staff-form-page">
        <form className="stack-form" onSubmit={handleSubmit}>
          {error && <p className="form-error">{error}</p>}

          <div className="section-title">
            <div>
              <p>Akun</p>
              <h2>Informasi Login</h2>
            </div>
          </div>

          <label>
            Username
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              minLength={4}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
            />
          </label>
          <label>
            Nama Lengkap
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
          </label>

          <div className="switch-group">
            <span>Status Akun Aktif</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="button-row">
            <Link className="secondary-button" to="/staff">
              Batal
            </Link>
            <button
              className="primary-button strong"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Resepsionis"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
