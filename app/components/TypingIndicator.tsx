export function TypingIndicator() {
  return (
    <div
      aria-label="Loading answer…"
      className="flex items-center gap-1 px-4 py-3"
    >
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}
