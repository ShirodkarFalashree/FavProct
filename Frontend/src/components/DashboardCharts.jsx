import React from "react";

// Helper to map client-passed hex colors to our minimal theme CSS variables
const mapColorToThemeVar = (color) => {
  if (!color) return "var(--accent)";
  const c = color.toLowerCase();
  if (c === "#10b981" || c === "green" || c === "emerald") return "var(--success)";
  if (c === "#f97316" || c === "#ca8a04") return "var(--warning)";
  if (c === "#ef4444" || c === "#dc2626") return "var(--error)";
  if (c === "#6366f1" || c === "#818cf8") return "var(--accent)";
  return color; // default to passed class or hex
};

// 1. Doughnut Chart Component
export const DoughnutChart = ({ data, title }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let accumulatedPercentage = 0;
  
  const radius = 50;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md flex flex-col items-center h-full justify-between">
      <h4 className="text-sm font-semibold text-slate-300 mb-6 w-full text-left">{title}</h4>
      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg viewBox="0 0 140 140" className="w-full h-full transform -rotate-90">
          {total === 0 ? (
            <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--border-primary)" strokeWidth={strokeWidth} />
          ) : (
            data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const strokeLength = (percentage / 100) * circumference;
              const strokeOffset = circumference - strokeLength;
              const rotateAngle = (accumulatedPercentage / 100) * 360;
              accumulatedPercentage += percentage;
              
              return (
                <circle
                  key={index}
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke={mapColorToThemeVar(item.color)}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  transform={`rotate(${rotateAngle}, 70, 70)`}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-out hover:opacity-80 cursor-pointer"
                />
              );
            })
          )}
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black text-white">{total}</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Total</span>
        </div>
      </div>
      <div className="mt-6 w-full grid grid-cols-2 gap-3 text-xs">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: mapColorToThemeVar(item.color) }} />
            <span className="text-slate-400 font-medium truncate">{item.label}</span>
            <span className="text-white font-bold ml-auto">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 2. Bar Chart Component
export const BarChart = ({ data, title, height = 200 }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const chartHeight = height - 40; // reserve space for labels
  
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md flex flex-col h-full justify-between">
      <h4 className="text-sm font-semibold text-slate-300 mb-6 w-full text-left">{title}</h4>
      <div className="flex items-end justify-between space-x-4 w-full" style={{ height: `${chartHeight}px` }}>
        {data.map((item, index) => {
          const barHeight = Math.max((item.value / maxValue) * (chartHeight - 40), 6);
          return (
            <div key={index} className="flex-1 flex flex-col items-center group relative">
              {/* Tooltip value */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute -top-8 bg-slate-950 border border-slate-800 text-[10px] text-white font-bold px-2 py-0.5 rounded-md shadow-xl pointer-events-none z-10 whitespace-nowrap">
                {item.value}
              </div>
              {/* Bar */}
              <div
                className={`w-full rounded-t-lg bg-gradient-to-t ${item.color} transition-all duration-500 ease-out shadow-lg hover:brightness-110`}
                style={{
                  height: `${barHeight}px`
                }}
              />
              {/* Label */}
              <span className="text-[10px] text-slate-500 font-semibold mt-3 text-center truncate w-full uppercase tracking-wider">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 3. Line Chart Component
export const LineChart = ({ data, title, height = 200, color, stroke }) => {
  const chartHeight = height - 40;
  const paddingX = 40;
  const paddingY = 20;
  const svgWidth = 500;
  const svgHeight = chartHeight;
  
  const chartColor = stroke || color || "var(--accent)";
  const resolvedColor = mapColorToThemeVar(chartColor);
  const gradientId = `areaGrad-${(title || "default").replace(/[^a-zA-Z0-9]/g, "")}`;
  
  const points = data.map((item) => {
    const percentage = (item.value / (item.max || 100)) * 100;
    return {
      label: item.label,
      value: item.value,
      max: item.max,
      percentage
    };
  });
  
  const widthPerPoint = points.length > 1 ? (svgWidth - paddingX * 2) / (points.length - 1) : svgWidth - paddingX * 2;
  
  const coords = points.map((p, index) => {
    const x = paddingX + index * widthPerPoint;
    const y = svgHeight - paddingY - (p.percentage / 100) * (svgHeight - paddingY * 2);
    return { x, y, ...p };
  });
  
  let pathD = "";
  let areaD = "";
  if (coords.length > 0) {
    pathD = `M ${coords[0].x} ${coords[0].y}`;
    coords.slice(1).forEach(c => {
      pathD += ` L ${c.x} ${c.y}`;
    });
    
    areaD = `${pathD} L ${coords[coords.length - 1].x} ${svgHeight - paddingY} L ${coords[0].x} ${svgHeight - paddingY} Z`;
  }
  
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md flex flex-col h-full justify-between">
      <h4 className="text-sm font-semibold text-slate-300 mb-6">{title}</h4>
      {data.length === 0 ? (
        <div className="flex h-32 items-center justify-center text-slate-500 text-xs italic">
          No data available for trend chart
        </div>
      ) : (
        <div className="relative w-full overflow-x-auto">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full min-w-[400px] h-auto overflow-visible">
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={resolvedColor} stopOpacity="0.2" />
                <stop offset="100%" stopColor={resolvedColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            
            {/* Gridlines */}
            <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="var(--border-primary)" strokeDasharray="3,3" />
            <line x1={paddingX} y1={svgHeight / 2} x2={svgWidth - paddingX} y2={svgHeight / 2} stroke="var(--border-primary)" strokeDasharray="3,3" />
            <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="var(--border-primary)" />
            
            {/* Area */}
            {coords.length > 0 && (
              <path d={areaD} fill={`url(#${gradientId})`} />
            )}
            
            {/* Path line */}
            {coords.length > 0 && (
              <path d={pathD} fill="none" stroke={resolvedColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            )}
            
            {/* Data circles & labels */}
            {coords.map((c, index) => (
              <g key={index} className="group cursor-pointer">
                <circle cx={c.x} cy={c.y} r="5" fill="var(--bg-card)" stroke={resolvedColor} strokeWidth="3" className="transition-all duration-200 hover:scale-150" />
                <text x={c.x} y={c.y - 12} textAnchor="middle" fill="var(--text-primary)" className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {c.value}/{c.max}
                </text>
                <text x={c.x} y={svgHeight} textAnchor="middle" fill="var(--text-muted)" className="text-[9px] font-semibold uppercase tracking-wider">
                  {c.label.substring(0, 12)}
                </text>
              </g>
            ))}
          </svg>
        </div>
      )}
    </div>
  );
};
