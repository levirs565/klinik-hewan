interface StaffAccountFieldsProps {
  username: string;
  setUsername?: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  fullName: string;
  setFullName: (val: string) => void;
  isActive: boolean;
  setIsActive: (val: boolean) => void;
  isEdit?: boolean;
}

export function StaffAccountFields({
  username,
  setUsername,
  password,
  setPassword,
  fullName,
  setFullName,
  isActive,
  setIsActive,
  isEdit = false,
}: StaffAccountFieldsProps) {
  return (
    <>
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
          onChange={(event) => setUsername?.(event.target.value)}
          required={!isEdit}
          disabled={isEdit}
          minLength={4}
          placeholder={isEdit ? "Username tidak dapat diubah" : "Username akun"}
        />
      </label>
      <label>
        Password {isEdit && <small>(Kosongkan jika tidak ingin mengubah)</small>}
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required={!isEdit}
          minLength={6}
          placeholder={isEdit ? "Masukkan password baru jika ingin mengubah" : "Minimal 6 karakter"}
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
    </>
  );
}
