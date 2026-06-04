import type { ServiceRequest } from '../types'
import { formatDate, statusIcon, statusLabel } from '../utils/serviceRequest'

export function RequestCard({
  isActive,
  onClick,
  request,
}: {
  isActive: boolean
  onClick: () => void
  request: ServiceRequest
}) {
  return (
    <button className={isActive ? 'request-card active' : 'request-card'} onClick={onClick} type="button">
      <img src={request.image} alt={request.petName} />
      <div>
        <div className="request-head">
          <strong>{request.petName}</strong>
          <span className={`status ${request.status}`}>{statusLabel[request.status]}</span>
        </div>
        <p>
          {request.breed} • {request.owner}
        </p>
        <small>
          {request.service} • {formatDate(request.date)} • {request.time}
        </small>
      </div>
      <span className="material-symbols-outlined">{statusIcon[request.status]}</span>
    </button>
  )
}
