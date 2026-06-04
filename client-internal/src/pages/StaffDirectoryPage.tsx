import { useMemo, useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";

import { useStaffMembers } from "../hooks/useStaff";
import { useAuth } from "../context/AuthContext";
import { StaffCard } from "../components";
import type { StaffMember } from "../types";

export function StaffDirectoryPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { staffMembers, isLoading } = useStaffMembers(isAuthenticated);
  const [activeRole, setActiveRole] = useState<StaffMember["role"]>("doctor");

  const filteredStaff = useMemo(
    () => staffMembers.filter((staff) => staff.role === activeRole),
    [activeRole, staffMembers],
  );

  if (user && user.role !== "manager") {
    return <Navigate to="/" replace />;
  }

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
        <div className="button-row">
          <button
            className="secondary-button toolbar-action"
            onClick={() => navigate("/staff/new/receptionist")}
            type="button"
          >
            + Resepsionis
          </button>
          <button
            className="primary-button toolbar-action"
            onClick={() => navigate("/staff/new/doctor")}
            type="button"
          >
            + Dokter
          </button>
        </div>
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
