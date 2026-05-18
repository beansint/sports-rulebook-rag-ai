import clsx from "clsx";

const SPORT_LABELS: Record<string, string> = {
  nba: "NBA",
  nfl: "NFL",
  mlb: "MLB",
  fifa: "FIFA",
};

interface SportBadgeProps {
  sport: string;
  className?: string;
}

export function SportBadge({ sport, className }: SportBadgeProps) {
  const label = SPORT_LABELS[sport.toLowerCase()] ?? sport.toUpperCase();
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold tracking-wider uppercase",
        "bg-accent text-white font-[family-name:var(--font-barlow-condensed)]",
        className,
      )}
    >
      {label}
    </span>
  );
}
