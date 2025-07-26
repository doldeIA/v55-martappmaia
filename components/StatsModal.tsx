
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Chart } from 'chart.js';
import { ArrowLeftIcon, ChartBarIcon } from './Icons';
import { AppAnalytics, Product, CustomLabels, InteractionType } from '../types';

type Period = '24h' | '7d' | '30d';
type Metric = 'brands' | 'spots' | 'products';

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

export const StatsModal: React.FC<{
    onClose: () => void;
    analytics: AppAnalytics;
    products: Product[];
    customLabels: CustomLabels;
}> = ({ onClose, analytics, products, customLabels }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [activePeriod, setActivePeriod] = useState<Period>('7d');
    const [activeMetric, setActiveMetric] = useState<Metric>('brands');

    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart | null>(null);

    useEffect(() => {
        setIsVisible(true);
        document.body.style.overflow = 'hidden';
        const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = 'auto';
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const chartData = useMemo(() => {
        const now = Date.now();
        let startTime = now;
        switch (activePeriod) {
            case '24h': startTime -= 24 * 60 * 60 * 1000; break;
            case '7d': startTime -= 7 * 24 * 60 * 60 * 1000; break;
            case '30d': startTime -= 30 * 24 * 60 * 60 * 1000; break;
        }

        const filteredInteractions = analytics.interactions.filter(
            i => i.timestamp >= startTime && i.type === activeMetric
        );

        const counts = new Map<string | number, number>();
        filteredInteractions.forEach(i => {
            counts.set(i.key, (counts.get(i.key) || 0) + 1);
        });

        const sortedData = Array.from(counts.entries()).sort(([, a], [, b]) => b - a);
        
        const labels: string[] = [];
        const data: number[] = [];
        
        sortedData.forEach(([key, value]) => {
            let label = String(key);
            if (activeMetric === 'products') {
                label = products.find(p => p.id === Number(key))?.name || `ID ${key}`;
            } else if (activeMetric === 'spots') {
                const spotKey = key as keyof Omit<CustomLabels, 'falarComAnalista'|'analisarAnuncios'|'converseComigo'>;
                label = customLabels[spotKey.toLowerCase().replace(' ', '') as keyof typeof customLabels] || String(key);
            }
            labels.push(label);
            data.push(value);
        });

        return { labels, data };

    }, [activePeriod, activeMetric, analytics, products, customLabels]);

    useEffect(() => {
        if (!chartRef.current) return;
        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        chartInstance.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Interações',
                    data: chartData.data,
                    backgroundColor: 'rgba(56, 189, 248, 0.6)',
                    borderColor: 'rgba(56, 189, 248, 1)',
                    borderWidth: 1,
                    borderRadius: 4,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(17, 24, 39, 0.8)',
                        titleFont: { weight: 'bold' },
                        bodyFont: { size: 14 },
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: {
                           color: 'rgba(255, 255, 255, 0.7)',
                           precision: 0,
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                    }
                }
            }
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [chartData]);
    
    const handleExportCSV = () => {
        const { labels, data } = chartData;
        if (labels.length === 0) return;
        
        const metricName = {
            brands: 'Marca',
            spots: 'SPOT',
            products: 'Peça',
        }[activeMetric];

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += `${metricName},Interações\n`;
        labels.forEach((label, index) => {
            csvContent += `"${label}",${data[index]}\n`;
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `estatisticas_${activeMetric}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div
            className={`fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className={`bg-gradient-to-br from-gray-900 via-slate-900 to-black/90 text-white w-full max-w-4xl h-[90vh] rounded-2xl border border-white/10 shadow-2xl transition-all duration-300 flex flex-col ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={e => e.stopPropagation()}
            >
                <header className="relative flex items-center justify-center p-4 border-b border-white/10 flex-shrink-0">
                    <button onClick={handleClose} className="absolute left-4 p-2 rounded-full text-white/70 hover:bg-white/10" aria-label="Voltar">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <div className="flex items-center space-x-3">
                        <ChartBarIcon className="w-6 h-6 text-teal-300" />
                        <h2 className="text-xl font-bold">Painel de Estatísticas Interativas</h2>
                    </div>
                </header>

                <main className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        {/* Metric Filters */}
                        <div className="flex items-center gap-2 bg-slate-800/60 p-1 rounded-lg">
                            {(['brands', 'spots', 'products'] as Metric[]).map(metric => (
                                <button key={metric} onClick={() => setActiveMetric(metric)} className={cn('px-3 py-1 text-sm font-semibold rounded-md transition-colors', activeMetric === metric ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10')}>
                                    { {brands: 'Interações por Marca', spots: 'SPOTs ativados', products: 'Peças visualizadas'}[metric] }
                                </button>
                            ))}
                        </div>
                        {/* Period Filters */}
                        <div className="flex items-center gap-2 bg-slate-800/60 p-1 rounded-lg">
                            {(['24h', '7d', '30d'] as Period[]).map(period => (
                                <button key={period} onClick={() => setActivePeriod(period)} className={cn('px-3 py-1 text-sm font-semibold rounded-md transition-colors', activePeriod === period ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10')}>
                                    { { '24h': 'Últimas 24 horas', '7d': 'Últimos 7 dias', '30d': 'Últimos 30 dias'}[period] }
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="flex-1 min-h-[300px] bg-white/5 p-4 rounded-lg border border-white/10">
                        {chartData.labels.length > 0 ? (
                           <canvas ref={chartRef}></canvas>
                        ) : (
                           <div className="flex items-center justify-center h-full text-white/50">
                               Nenhuma interação encontrada para os filtros selecionados.
                           </div>
                        )}
                    </div>
                </main>
                
                <footer className="p-4 border-t border-white/10 flex-shrink-0 flex items-center justify-end">
                    <button
                        onClick={handleExportCSV}
                        disabled={chartData.labels.length === 0}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-green-900/50 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                    >
                        Exportar como CSV
                    </button>
                </footer>
            </div>
        </div>
    );
};
