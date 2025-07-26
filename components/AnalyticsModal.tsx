import React, { useState, useEffect, useMemo, useRef } from 'react';
import { hourlyPerformance, dailyPerformance, weeklyChallenge, PerformanceData } from '../data/analyticsData';
import { ChartPieIcon, ClockIcon, CalendarDaysIcon, ArrowLeftIcon, ChartBarIcon, ChartLineIcon } from './Icons';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend, LineController, PointElement, LineElement } from 'chart.js';

// Register Chart.js components
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend, LineController, PointElement, LineElement);


// --- Helper Components ---

const AnalyticsCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, icon, children, className = '' }) => {
    const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

    return (
        <div className={`bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 backdrop-blur-xl ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="text-purple-300">{icon}</div>
                    <h3 className="font-bold text-white/90 text-lg">{title}</h3>
                </div>
                <div className="flex items-center space-x-1 bg-black/20 p-1 rounded-lg">
                    <button onClick={() => setChartType('bar')} className={`p-1 rounded-md transition-colors ${chartType === 'bar' ? 'bg-white/20 text-white' : 'text-white/50 hover:bg-white/10'}`} aria-label="Ver como gráfico de barras">
                        <ChartBarIcon className="w-5 h-5"/>
                    </button>
                    <button onClick={() => setChartType('line')} className={`p-1 rounded-md transition-colors ${chartType === 'line' ? 'bg-white/20 text-white' : 'text-white/50 hover:bg-white/10'}`} aria-label="Ver como gráfico de linha">
                        <ChartLineIcon className="w-5 h-5"/>
                    </button>
                </div>
            </div>
            <div>{React.cloneElement(children as React.ReactElement<{ chartType?: 'bar' | 'line' }>, { chartType })}</div>
        </div>
    );
}

const PerformanceChart: React.FC<{ data: PerformanceData[]; max: number; chartType?: 'bar' | 'line' }> = ({ data, max, chartType = 'bar' }) => {
    const generateLinePath = () => {
        if (data.length === 0) return '';
        const width = 100; // viewbox width
        const height = 100; // viewbox height
        const stepX = width / (data.length - 1);
        
        const points = data.map((item, i) => {
            const yValue = Math.max(0, item.value); // Ensure value is not negative
            const x = i * stepX;
            const y = height - (yValue / max) * height;
            return `${x},${y}`;
        });

        return `M ${points.join(' L ')}`;
    };
    
    if (chartType === 'line') {
         return (
             <div className="h-48 w-full p-2">
                 <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                     <path d={generateLinePath()} fill="none" stroke="url(#line-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                     <defs>
                         <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                             <stop offset="0%" stopColor="#a78bfa" />
                             <stop offset="100%" stopColor="#5eead4" />
                         </linearGradient>
                     </defs>
                 </svg>
                 <div className="flex justify-between text-xs text-white/60 font-medium mt-1">
                     {data.map(item => <span key={item.label}>{item.label}</span>)}
                 </div>
             </div>
         );
    }

    return (
      <div className="flex justify-between items-end h-48 gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
            <div className="relative flex-1 w-full flex items-end justify-center">
                <div 
                  className="w-3/4 bg-gradient-to-t from-purple-500/80 to-teal-400/80 rounded-t-full transition-all duration-500 ease-out group-hover:from-purple-400 group-hover:to-teal-300"
                  style={{ height: `${(item.value / max) * 100}%` }}
                >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-white bg-black/50 rounded-md px-2 py-0.5 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.value}
                    </span>
                </div>
            </div>
            <span className="text-xs text-white/60 font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    );
};

const ROIChart: React.FC = () => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart | null>(null);

    useEffect(() => {
        if (chartRef.current) {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                chartInstance.current = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ['Mês Atual', 'Mês Anterior'],
                        datasets: [{
                            label: 'ROI (%)',
                            data: [74, 62],
                            backgroundColor: ['#6C5DD3', '#38f9d7'],
                            borderRadius: 6,
                            barPercentage: 0.5,
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            tooltip: { enabled: true },
                            legend: { display: false }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                                grid: { color: 'rgba(255, 255, 255, 0.1)' }
                            },
                            x: {
                                ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                                grid: { display: false }
                            }
                        }
                    }
                });
            }
        }
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, []);

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 backdrop-blur-xl h-full">
             <h3 className="font-bold text-white/90 text-lg mb-4">Comparativo de ROI</h3>
            <div className="relative h-64">
                <canvas ref={chartRef}></canvas>
            </div>
        </div>
    );
};


// --- Main Modal Component ---

export const AnalyticsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const maxHourly = useMemo(() => Math.max(...hourlyPerformance.map(d => d.value)) * 1.1, []);
  const maxDaily = useMemo(() => Math.max(...dailyPerformance.map(d => d.value)) * 1.1, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-gradient-to-br from-gray-900 via-slate-900 to-black/90 text-white w-full h-full md:w-[95%] md:h-[95%] max-w-7xl rounded-none md:rounded-3xl border border-white/10 shadow-2xl transition-all duration-300 flex flex-col overflow-hidden ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={e => e.stopPropagation()}
      >
        <header className="relative flex items-center justify-center p-4 border-b border-white/10 flex-shrink-0">
             <button onClick={handleClose} className="absolute left-4 p-2 rounded-full text-white/70 hover:bg-white/10 transition-colors" aria-label="Voltar">
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-3">
                <ChartPieIcon className="w-7 h-7 text-purple-300" />
                <h2 className="text-xl font-bold">Análise de Performance</h2>
            </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <AnalyticsCard title="Performance por Hora" icon={<ClockIcon className="w-6 h-6" />}>
                <PerformanceChart data={hourlyPerformance} max={maxHourly} />
              </AnalyticsCard>
              <AnalyticsCard title="Performance por Dia da Semana" icon={<CalendarDaysIcon className="w-6 h-6" />}>
                <PerformanceChart data={dailyPerformance} max={maxDaily} />
              </AnalyticsCard>
            </div>

            <div className="lg:col-span-1 space-y-6">
                <ROIChart />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};