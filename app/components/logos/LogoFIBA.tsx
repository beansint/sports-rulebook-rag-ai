export function LogoFIBA({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 40"
      fill="currentColor"
      role="img"
      aria-label="FIBA"
      className={className}
    >
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Anton, Impact, sans-serif"
        fontSize="34"
        letterSpacing="3"
      >
        FIBA
      </text>
    </svg>
  );
}
