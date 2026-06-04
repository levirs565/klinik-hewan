import { Link } from "react-router-dom";
import type { StaffMember } from "../types";

interface StaffCardProps {
  staff: StaffMember;
}

export function StaffCard({ staff }: StaffCardProps) {
  const avatarUrl =
    staff.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      staff.full_name,
    )}&background=random`;

  return (
    <Link className="staff-card staff-card-link" to={`/staff/${staff.id}`}>
      <img src={avatarUrl} alt={staff.full_name} />
      <div>
        <h2>{staff.full_name}</h2>
        <small>{staff.role}</small>
      </div>
      <span className="material-symbols-outlined">chevron_right</span>
    </Link>
  );
}
