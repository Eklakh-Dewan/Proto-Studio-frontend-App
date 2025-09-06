interface DonutChartProps {
  value: number;
  label: string;
  size?: number;
}

export default function DonutChart({ value, label, size = 200 }: DonutChartProps) {
  const circumference = 2 * Math.PI * 40; // radius of 40
  const strokeDasharray = `${(value / 100) * circumference} ${circumference}`;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="var(--muted)"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="8"
            strokeDasharray={strokeDasharray}
            strokeDashoffset="0"
            className="donut-chart transition-all duration-500"
            data-testid="donut-progress"
          />
          {/* Center text */}
          <text
            x="50"
            y="50"
            textAnchor="middle"
            dy="0.3em"
            className="text-lg font-bold fill-current transform rotate-90"
            style={{ transformOrigin: '50px 50px' }}
            data-testid="donut-percentage"
          >
            {value}%
          </text>
        </svg>
      </div>
      <div className="text-center mt-2">
        <span className="text-sm text-muted-foreground" data-testid="donut-label">
          {label}
        </span>
      </div>
    </div>
  );
}
