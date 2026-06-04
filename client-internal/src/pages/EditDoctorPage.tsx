import { useState, type FormEvent, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { client } from "../services/api";
import { useDoctorDetail } from "../hooks/useStaff";
import { StaffAccountFields, DoctorProfessionalFields } from "../components";

export function EditDoctorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { doctor, isLoading } = useDoctorDetail(id);

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

  useEffect(() => {
    if (doctor) {
      setFullName(doctor.full_name);
      setIsActive(doctor.is_active);
      setBirthDate(doctor.birth_date || "");
      setEducationHistory(doctor.education_history || "");
      setPracticeStartDate(doctor.practice_start_date || "");
      setJoinDate(doctor.join_date || "");
      setPracticeLocationHistory(doctor.practice_location_history || "");
    }
  }, [doctor]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const payload: any = {
        full_name: fullName,
        is_active: isActive,
        birth_date: birthDate,
        education_history: educationHistory,
        practice_start_date: practiceStartDate,
        join_date: joinDate,
        practice_location_history: practiceLocationHistory,
      };

      if (password) {
        payload.password = password;
      }

      await client.put(`/staff/doctor/${id}`, payload);
      navigate(`/staff/doctor/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal memperbarui dokter");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="app">
        <p className="empty">Memuat data dokter...</p>
      </main>
    );
  }

  if (!doctor) {
    return (
      <main className="app">
        <p className="empty">Dokter tidak ditemukan.</p>
        <Link to="/staff" className="text-button">Kembali ke Daftar</Link>
      </main>
    );
  }

  return (
    <main className="app">
      <header className="top-bar">
        <div className="brand">
          <Link className="icon-button" to={`/staff/doctor/${id}`} aria-label="Kembali">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <p>Edit Dokter</p>
            <h1>{doctor.full_name}</h1>
          </div>
        </div>
      </header>

      <section className="column staff-form-page">
        <form className="stack-form" onSubmit={handleSubmit}>
          {error && <p className="form-error">{error}</p>}

          <StaffAccountFields
            isEdit
            username={doctor.username}
            password={password}
            setPassword={setPassword}
            fullName={fullName}
            setFullName={setFullName}
            isActive={isActive}
            setIsActive={setIsActive}
          />

          <DoctorProfessionalFields
            birthDate={birthDate}
            setBirthDate={setBirthDate}
            educationHistory={educationHistory}
            setEducationHistory={setEducationHistory}
            practiceStartDate={practiceStartDate}
            setPracticeStartDate={setPracticeStartDate}
            joinDate={joinDate}
            setJoinDate={setJoinDate}
            practiceLocationHistory={practiceLocationHistory}
            setPracticeLocationHistory={setPracticeLocationHistory}
          />

          <div className="button-row">
            <Link className="secondary-button" to={`/staff/doctor/${id}`}>
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
