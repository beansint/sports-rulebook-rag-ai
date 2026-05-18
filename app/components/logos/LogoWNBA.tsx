export function LogoWNBA({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 32"
      fill="currentColor"
      role="img"
      aria-label="WNBA"
      className={className}
    >
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Anton, Impact, sans-serif"
        fontSize="28"
        letterSpacing="2"
      >
        WNBA
      </text>
    </svg>
  );
}
