import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { client } from "../services/api";

export function AddDoctorPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Doctor specific
  const [birthDate, setBirthDate] = useState("");
  const [educationHistory, setEducationHistory] = useState("");
  const [practiceStartDate, setPracticeStartDate] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [practiceLocationHistory, setPracticeLocationHistory] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await client.post("/staff/doctor", {
        username,
        password,
        full_name: fullName,
        is_active: isActive,
        birth_date: birthDate,
        education_history: educationHistory,
        practice_start_date: practiceStartDate,
        join_date: joinDate,
        practice_location_history: practiceLocationHistory,
      });
      navigate("/staff");
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menambahkan dokter");
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
            <p>Tambah Dokter</p>
            <h1>Registrasi Dokter Baru</h1>
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

          <div className="section-title detail-section-gap">
            <div>
              <p>Detail Profesional</p>
              <h2>Informasi Profil Dokter</h2>
            </div>
          </div>
          <label>
            Tanggal Lahir
            <input
              type="date"
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
              required
            />
          </label>
          <label>
            Pendidikan Terakhir
            <textarea
              value={educationHistory}
              onChange={(event) => setEducationHistory(event.target.value)}
              required
              placeholder="Contoh: S1 Kedokteran Hewan Universitas..."
            />
          </label>
          <label>
            Mulai Praktik
            <input
              type="date"
              value={practiceStartDate}
              onChange={(event) => setPracticeStartDate(event.target.value)}
              required
            />
          </label>
          <label>
            Tanggal Bergabung Klinik
            <input
              type="date"
              value={joinDate}
              onChange={(event) => setJoinDate(event.target.value)}
              required
            />
          </label>
          <label>
            Riwayat Lokasi Praktik
            <textarea
              value={practiceLocationHistory}
              onChange={(event) =>
                setPracticeLocationHistory(event.target.value)
              }
              required
              placeholder="Sebutkan lokasi praktik sebelumnya..."
            />
          </label>

          <div className="button-row">
            <Link className="secondary-button" to="/staff">
              Batal
            </Link>
            <button
              className="primary-button strong"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Dokter"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
