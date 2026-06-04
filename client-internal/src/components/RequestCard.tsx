import { Link } from "react-router-dom";

import type { ServiceRequest } from "../types";
import { formatDate, statusIcon, statusLabel } from "../utils/serviceRequest";

type RequestCardProps = {
  request: ServiceRequest;
};

export function RequestCard({ request }: RequestCardProps) {
  return (
    <Link className="request-card" to={`/requests/${request.id}`}>
      <div className="request-card-info">
        <img src={request.pet.avatar_url} alt={request.pet.name} />
        <div>
          <div className="request-card-header">
            <strong>{request.pet.name}</strong>
            <span className={`status ${request.status}`}>
              {statusLabel[request.status]}
            </span>
          </div>
          <p className="request-card-details">{request.pet.breed}</p>
          <p className="request-card-meta">
            {request.service_type} • {formatDate(request.appointment_date)}
          </p>
        </div>
      </div>
      <span className="material-symbols-outlined">
        {statusIcon[request.status]}
      </span>
    </Link>
  );
}
