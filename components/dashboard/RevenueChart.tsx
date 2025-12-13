import React from 'react';

interface RevenueChartProps {
  data: number[];
  labels: string[];
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, labels }) => {
  const height = 200;
  const width = 1000; // SVG coordinate width
  const max = Math.max(...data, 1);
  
  // Calculate points for the line
  const points = data.map((val, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - (val / max) * (height * 0.8) - 10; // 10px padding
    return `${x},${y}`;
  }).join(' ');

  // Area path (closed loop)
  const areaPath = `${points} ${width},${height} 0,${height}`;

  return (
    <div className="w-full h-full flex flex-col">
       <div className="flex-1 relative w-full overflow-hidden">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
             {/* Gradient Definition */}
             <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" />
                   <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                </linearGradient>
             </defs>
             
             {/* Grid Lines (Horizontal) */}
             {[0.2, 0.4, 0.6, 0.8].map((ratio) => (
                 <line 
                    key={ratio}
                    x1="0" y1={height * ratio} 
                    x2={width} y2={height * ratio} 
                    stroke="currentColor" 
                    strokeOpacity="0.05"
                    strokeDasharray="4 4"
                    className="text-slate-500"
                 />
             ))}

             {/* Area Fill */}
             <path d={`M${points.split(' ')[0]} L${areaPath} Z`} fill="url(#chartGradient)" />

             {/* Line */}
             <polyline 
                fill="none" 
                stroke="#22c55e" 
                strokeWidth="3" 
                points={points} 
                strokeLinecap="round"
                strokeLinejoin="round"
             />
             
             {/* Dots */}
             {data.map((val, index) => {
                const x = (index / (data.length - 1)) * width;
                const y = height - (val / max) * (height * 0.8) - 10;
                return (
                    <circle 
                        key={index} 
                        cx={x} cy={y} r="4" 
                        className="fill-white dark:fill-dark-800 stroke-brand-500 stroke-2"
                    />
                );
             })}
          </svg>
       </div>
       <div className="flex justify-between mt-2 px-2 text-xs text-slate-400">
          {labels.map((label, i) => (
              <span key={i}>{label}</span>
          ))}
       </div>
    </div>
  );
};
