interface DoctorProfessionalFieldsProps {
  birthDate: string;
  setBirthDate: (val: string) => void;
  educationHistory: string;
  setEducationHistory: (val: string) => void;
  practiceStartDate: string;
  setPracticeStartDate: (val: string) => void;
  joinDate: string;
  setJoinDate: (val: string) => void;
  practiceLocationHistory: string;
  setPracticeLocationHistory: (val: string) => void;
}

export function DoctorProfessionalFields({
  birthDate,
  setBirthDate,
  educationHistory,
  setEducationHistory,
  practiceStartDate,
  setPracticeStartDate,
  joinDate,
  setJoinDate,
  practiceLocationHistory,
  setPracticeLocationHistory,
}: DoctorProfessionalFieldsProps) {
  return (
    <>
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
          onChange={(event) => setPracticeLocationHistory(event.target.value)}
          required
          placeholder="Sebutkan lokasi praktik sebelumnya..."
        />
      </label>
    </>
  );
}
