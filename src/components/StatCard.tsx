import { StatTooltip } from "./StatTooltip";

type StatCardProps = {
  value: string | number;
  label: string;
  tooltip?: string;
};

export function StatCard({ value, label, tooltip }: StatCardProps) {
  return (
    <div className="stat-card">
      <strong className="stat-card-value">{value}</strong>
      <div className="stat-card-label">
        {label}
        {tooltip && <StatTooltip text={tooltip} />}
      </div>
    </div>
  );
}
