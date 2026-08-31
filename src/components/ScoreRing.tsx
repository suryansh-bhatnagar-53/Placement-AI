export function gradeFor(score: number): "A" | "B" | "C" | "D" {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 50) return "C";
  return "D";
}

export function ScoreRing({
  score,
  size = 160,
  label = "Overall score",
}: {
  score: number;
  size?: number;
  label?: string;
}) {
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, score)) / 100;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} role="img" aria-label={`${label}: ${score} out of 100`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-secondary)"
          strokeWidth={10}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={`${circumference * progress} ${circumference}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x="50%"
          y="47%"
          textAnchor="middle"
          fill="var(--color-foreground)"
          fontSize={size / 4.5}
          fontWeight={600}
        >
          {score.toFixed(1)}
        </text>
        <text
          x="50%"
          y="66%"
          textAnchor="middle"
          fill="var(--color-muted-foreground)"
          fontSize={size / 11}
        >
          Grade {gradeFor(score)}
        </text>
      </svg>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}
