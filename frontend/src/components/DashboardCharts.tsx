import React, { useState } from 'react';
import { VOLUME_CHART_DATA } from '../mockData';

export const VolumeLineChart: React.FC<{ timeRange: 'Last 30 Days' | 'Last Quarter' | 'Year to Date' }> = ({
  timeRange,
}) => {
  const data = VOLUME_CHART_DATA[timeRange] || VOLUME_CHART_DATA['Last 30 Days'];
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string; count: number } | null>(null);

  const width = 640;
  const height = 220;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const maxVal = Math.max(...data.map((d) => d.count), 90);
  const minVal = 0;

  // Grid ticks
  const yTicks = [0, 20, 40, 60, 80, 100];
  const effectiveMax = 100;

  const getX = (index: number) => {
    return paddingLeft + (index / (data.length - 1)) * (width - paddingLeft - paddingRight);
  };

  const getY = (val: number) => {
    const ratio = (val - minVal) / (effectiveMax - minVal);
    return height - paddingBottom - ratio * (height - paddingTop - paddingBottom);
  };

  // Build SVG Path
  const points = data.map((d, i) => ({ x: getX(i), y: getY(d.count), d }));
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cx = (prev.x + curr.x) / 2;
    pathD += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
  }

  // Area path
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

  return (
    <div className="w-full h-full relative select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-[220px] overflow-visible"
        preserveAspectRatio="none"
      >
        {/* Y Grid Lines */}
        {yTicks.map((tick) => {
          const yPos = getY(tick);
          return (
            <g key={tick}>
              <line
                x1={paddingLeft}
                y1={yPos}
                x2={width - paddingRight}
                y2={yPos}
                stroke="#e2e8f0"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 8}
                y={yPos + 4}
                fill="#64748B"
                fontSize="11"
                textAnchor="end"
                className="font-mono"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Gradient fill */}
        <defs>
          <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0F172A" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#0F172A" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        <path d={areaD} fill="url(#volumeGradient)" />
        <path d={pathD} fill="none" stroke="#0F172A" strokeWidth="2.5" />

        {/* Points */}
        {points.map((pt, i) => (
          <g key={i}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r="4.5"
              fill="#ffffff"
              stroke="#0F172A"
              strokeWidth="2.5"
              className="cursor-pointer transition-transform hover:scale-150"
              onMouseEnter={() =>
                setHoveredPoint({ x: pt.x, y: pt.y, label: pt.d.label, count: pt.d.count })
              }
              onMouseLeave={() => setHoveredPoint(null)}
            />
            {/* X Labels */}
            <text
              x={pt.x}
              y={height - 8}
              fill="#64748B"
              fontSize="11"
              textAnchor="middle"
              className="font-medium"
            >
              {pt.d.label}
            </text>
          </g>
        ))}
      </svg>

      {/* Hover tooltip */}
      {hoveredPoint && (
        <div
          className="absolute z-20 pointer-events-none bg-[#0F172A] text-white text-xs px-2.5 py-1.5 rounded shadow-lg -translate-x-1/2 -translate-y-full mb-2"
          style={{
            left: `${(hoveredPoint.x / width) * 100}%`,
            top: `${(hoveredPoint.y / height) * 100}%`,
          }}
        >
          <p className="font-semibold">{hoveredPoint.label}</p>
          <p className="text-emerald-400 font-mono font-bold">{hoveredPoint.count} apps</p>
        </div>
      )}
    </div>
  );
};

export const DecisionDoughnutChart: React.FC = () => {
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  // Values: 72% Approved, 12% Review, 16% Rejected
  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const approvedPerc = 0.72;
  const reviewPerc = 0.12;
  const rejectedPerc = 0.16;

  const approvedDash = approvedPerc * circumference;
  const reviewDash = reviewPerc * circumference;
  const rejectedDash = rejectedPerc * circumference;

  // Offsets
  const approvedOffset = 0;
  const reviewOffset = -approvedDash;
  const rejectedOffset = -(approvedDash + reviewDash);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="rotate-[-90deg]">
          {/* Approved: Green */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#16A34A"
            strokeWidth={strokeWidth}
            strokeDasharray={`${approvedDash} ${circumference}`}
            strokeDashoffset={approvedOffset}
            className="cursor-pointer transition-all duration-200 hover:opacity-90"
            onMouseEnter={() => setHoveredSlice('Approved: 72%')}
            onMouseLeave={() => setHoveredSlice(null)}
          />

          {/* Review: Amber */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#F59E0B"
            strokeWidth={strokeWidth}
            strokeDasharray={`${reviewDash} ${circumference}`}
            strokeDashoffset={reviewOffset}
            className="cursor-pointer transition-all duration-200 hover:opacity-90"
            onMouseEnter={() => setHoveredSlice('Review: 12%')}
            onMouseLeave={() => setHoveredSlice(null)}
          />

          {/* Rejected: Red */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#DC2626"
            strokeWidth={strokeWidth}
            strokeDasharray={`${rejectedDash} ${circumference}`}
            strokeDashoffset={rejectedOffset}
            className="cursor-pointer transition-all duration-200 hover:opacity-90"
            onMouseEnter={() => setHoveredSlice('Rejected: 16%')}
            onMouseLeave={() => setHoveredSlice(null)}
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[24px] font-bold text-[#0b1c30] leading-none">
            {hoveredSlice ? hoveredSlice.split(':')[1]?.trim() : '72%'}
          </span>
          <span className="text-[10px] font-bold text-[#76777d] uppercase tracking-wider mt-1">
            {hoveredSlice ? hoveredSlice.split(':')[0] : 'APPROVED'}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-[12px] font-medium text-[#45464d]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]"></span>
          <span>Approved (72%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span>
          <span>Review (12%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]"></span>
          <span>Rejected (16%)</span>
        </div>
      </div>
    </div>
  );
};
