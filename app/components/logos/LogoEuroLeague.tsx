export function LogoEuroLeague({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 32"
      fill="currentColor"
      role="img"
      aria-label="EuroLeague"
      className={className}
    >
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Anton, Impact, sans-serif"
        fontSize="26"
        letterSpacing="2"
      >
        EUROLEAGUE
      </text>
    </svg>
  );
}
