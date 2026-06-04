export function Metric({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <article className="metric">
      <span className="material-symbols-outlined">{icon}</span>
      <strong>{value}</strong>
      <small>{label}</small>
    </article>
  )
}
