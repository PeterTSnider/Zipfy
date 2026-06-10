type StatTooltipProps = {
  text: string;
};

export function StatTooltip({ text }: StatTooltipProps) {
  return (
    <span className="stat-tooltip" tabIndex={0}>
      ?<span className="stat-tooltip-content">{text}</span>
    </span>
  );
}
