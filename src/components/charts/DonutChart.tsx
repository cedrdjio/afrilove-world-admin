/** Dependency-free SVG donut chart. */
export function DonutChart({
  data,
  size = 180,
  thickness = 26,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#F0E6D9" strokeWidth={thickness} />
        {data.map((d, i) => {
          const len = (d.value / total) * circumference;
          const seg = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth={thickness}
              strokeDasharray={`${len} ${circumference - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += len;
          return seg;
        })}
      </svg>
      <ul className="space-y-2">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2 text-sm">
            <span className="h-3 w-3 rounded-full" style={{ background: d.color }} />
            <span className="font-medium text-espresso-600">{d.label}</span>
            <span className="ml-auto font-bold text-espresso">{d.value.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
