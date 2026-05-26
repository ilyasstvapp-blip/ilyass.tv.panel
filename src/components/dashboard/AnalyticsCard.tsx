interface AnalyticsCardProps {
  label: string
  value: number
  color: string
}

export default function AnalyticsCard({ label, value, color }: AnalyticsCardProps) {
  return (
    <div className="card p-6" style={{ background: "var(--surface)" }}>
      <p className="text-sm mb-2" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="text-3xl font-bold" style={{ color }}>{value.toLocaleString()}</p>
    </div>
  )
}
