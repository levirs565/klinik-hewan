import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useStaffMembers } from "../hooks/useStaff";
import { useAuth } from "../context/AuthContext";
import { StaffCard } from "../components";
import type { StaffMember } from "../types";

export function StaffDirectoryPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { staffMembers, isLoading } = useStaffMembers(isAuthenticated);
  const [activeRole, setActiveRole] = useState<StaffMember["role"]>("doctor");

  const filteredStaff = useMemo(
    () => staffMembers.filter((staff) => staff.role === activeRole),
    [activeRole, staffMembers],
  );

  return (
    <main className="app">
      <header className="top-bar">
        <div className="brand">
          <Link className="icon-button" to="/" aria-label="Kembali">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <p>Pengelolaan Staf</p>
            <h1>Staff Directory</h1>
          </div>
        </div>
        <button
          className="primary-button toolbar-action"
          onClick={() => navigate("/staff/new")}
          type="button"
        >
          Tambah Staff
        </button>
      </header>

      <section className="column staff-page">
        <div className="tabs">
          <button
            className={activeRole === "doctor" ? "active" : ""}
            onClick={() => setActiveRole("doctor")}
            type="button"
          >
            Dokter
          </button>
          <button
            className={activeRole === "receptionist" ? "active" : ""}
            onClick={() => setActiveRole("receptionist")}
            type="button"
          >
            Resepsionis
          </button>
        </div>

        {isLoading ? <p className="empty">Memuat staff...</p> : null}

        <div className="staff-grid">
          {filteredStaff.map((staff) => (
            <StaffCard key={staff.id} staff={staff} />
          ))}
          {!isLoading && filteredStaff.length === 0 ? (
            <p className="empty">Tidak ada staff untuk peran ini.</p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
