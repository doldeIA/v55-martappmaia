

import React, { useState, useEffect, useMemo } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ArrowLeftIcon, ChartPieIcon, CheckCircleIcon, TrophyIcon, ArrowTrendingUpIcon } from './Icons';
import { AppAnalytics, Product } from '../types';

interface AnaliseInternaModalProps {
    onClose: () => void;
    analytics: AppAnalytics;
    products: Product[];
}

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

export const AnaliseInternaModal: React.FC<AnaliseInternaModalProps> = ({ onClose, analytics, products }) => {
    const [isVisible, setIsVisible] = useState(false);

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

    const analyticsData = useMemo(() => {
        const aggregated = {
            discounts: {} as Record<string, number>,
            brands: {} as Record<string, number>,
            products: {} as Record<string, number>,
            spots: {} as Record<string, number>,
        };

        analytics.interactions.forEach(interaction => {
            if (!aggregated[interaction.type]) return;
            aggregated[interaction.type][interaction.key] = (aggregated[interaction.type][interaction.key] || 0) + 1;
        });

        const totalBrandInteractions = Object.values(aggregated.brands).reduce((a, b) => a + b, 0);
        const totalDiscountInteractions = Object.values(aggregated.discounts).reduce((a, b) => a + b, 0);
        const totalProductInteractions = Object.values(aggregated.products).reduce((a, b) => a + b, 0);
        const totalSpotInteractions = Object.values(aggregated.spots).reduce((a, b) => a + b, 0);

        const getTopItem = (data: Record<string | number, number>) => {
            const sorted = Object.entries(data).sort(([,a],[,b]) => b - a);
            return sorted.length > 0 ? sorted[0][0] : "N/A";
        };

        const topBrand = getTopItem(aggregated.brands);
        const topDiscount = getTopItem(aggregated.discounts);
        const topProductId = getTopItem(aggregated.products);
        const topProduct = products.find(p => p.id === Number(topProductId))?.name || "N/A";
        const topSpot = getTopItem(aggregated.spots);

        return {
            brands: {
                total: totalBrandInteractions,
                top: topBrand,
                data: Object.entries(aggregated.brands).map(([key, value]) => ({
                    label: key,
                    value,
                    percentage: totalBrandInteractions > 0 ? ((value / totalBrandInteractions) * 100).toFixed(1) : 0,
                })).sort((a,b) => b.value - a.value),
            },
            discounts: {
                total: totalDiscountInteractions,
                top: `${topDiscount}%`,
                data: Object.entries(aggregated.discounts).map(([key, value]) => ({
                    label: `${key}%`,
                    value,
                    percentage: totalDiscountInteractions > 0 ? ((value / totalDiscountInteractions) * 100).toFixed(1) : 0,
                })).sort((a,b) => b.value - a.value),
            },
            products: {
                total: totalProductInteractions,
                top: topProduct,
                data: Object.entries(aggregated.products).map(([key, value]) => ({
                    label: products.find(p => p.id === Number(key))?.name || `ID ${key}`,
                    value,
                    percentage: totalProductInteractions > 0 ? ((value / totalProductInteractions) * 100).toFixed(1) : 0,
                })).sort((a,b) => b.value - a.value),
            },
            spots: {
                total: totalSpotInteractions,
                top: topSpot,
                data: Object.entries(aggregated.spots).map(([key, value]) => ({
                    label: key,
                    value,
                    percentage: totalSpotInteractions > 0 ? ((value / totalSpotInteractions) * 100).toFixed(1) : 0,
                })).sort((a,b) => b.value - a.value),
            },
        };
    }, [analytics, products]);

    const hasData = Object.values(analyticsData).some(d => d.total > 0);
    
    const handleExportCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Categoria,Item,Interações,Percentual\n";

        analyticsData.brands.data.forEach(item => csvContent += `Marcas,"${item.label}",${item.value},${item.percentage}%\n`);
        analyticsData.discounts.data.forEach(item => csvContent += `Descontos,"${item.label}",${item.value},${item.percentage}%\n`);
        analyticsData.products.data.forEach(item => csvContent += `Peças,"${item.label}",${item.value},${item.percentage}%\n`);
        analyticsData.spots.data.forEach(item => csvContent += `Spots,"${item.label}",${item.value},${item.percentage}%\n`);
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "analise_interna.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text("Painel de Análise Interna", 14, 16);

        if (analyticsData.brands.data.length > 0) {
            autoTable(doc, {
                startY: 22,
                head: [['Marca', 'Interações', 'Percentual (%)']],
                body: analyticsData.brands.data.map(i => [i.label, i.value, i.percentage]),
                headStyles: { fillColor: [44, 83, 100] }
            });
        }
        if (analyticsData.discounts.data.length > 0) {
            autoTable(doc, {
                head: [['Desconto', 'Interações', 'Percentual (%)']],
                body: analyticsData.discounts.data.map(i => [i.label, i.value, i.percentage]),
                headStyles: { fillColor: [41, 128, 185] }
            });
        }
        if (analyticsData.products.data.length > 0) {
            autoTable(doc, {
                head: [['Peça', 'Visualizações', 'Percentual (%)']],
                body: analyticsData.products.data.map(i => [i.label, i.value, i.percentage]),
                headStyles: { fillColor: [211, 84, 0] }
            });
        }
        if (analyticsData.spots.data.length > 0) {
            autoTable(doc, {
                head: [['SPOT', 'Usos', 'Percentual (%)']],
                body: analyticsData.spots.data.map(i => [i.label, i.value, i.percentage]),
                headStyles: { fillColor: [142, 68, 173] }
            });
        }
        
        doc.save('analise_interna.pdf');
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
                        <ChartPieIcon className="w-6 h-6 text-purple-300" />
                        <h2 className="text-xl font-bold">Painel de Análise Interna</h2>
                    </div>
                </header>

                <main className="flex-1 p-6 overflow-y-auto space-y-8">
                    {!hasData ? (
                        <div className="flex items-center justify-center h-full text-white/50">
                            Sem dados disponíveis ainda.
                        </div>
                    ) : (
                        <>
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <AnalyticsStatCard title="Marca Mais Escolhida" value={analyticsData.brands.top} icon={<TrophyIcon className="w-6 h-6 text-fuchsia-300" />} />
                                <AnalyticsStatCard title="Desconto Mais Usado" value={analyticsData.discounts.top} icon={<ArrowTrendingUpIcon className="w-6 h-6 text-green-300" />} />
                                <AnalyticsStatCard title="Peça Mais Vista" value={analyticsData.products.top} icon={<CheckCircleIcon className="w-6 h-6 text-amber-300" />} />
                                <AnalyticsStatCard title="SPOT Mais Usado" value={analyticsData.spots.top} icon={<TrophyIcon className="w-6 h-6 text-blue-300" />} />
                           </div>
                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <AnalyticsTable title="% de escolha por marca" data={analyticsData.brands.data} />
                                <AnalyticsTable title="% de uso de cada SPOT" data={analyticsData.spots.data} />
                                <AnalyticsTable title="Peças mais visualizadas" data={analyticsData.products.data} />
                                <AnalyticsTable title="Frequência de descontos" data={analyticsData.discounts.data} />
                           </div>
                        </>
                    )}
                </main>

                <footer className="p-4 border-t border-white/10 flex-shrink-0 flex items-center justify-end gap-3">
                    <button
                        onClick={handleExportCSV}
                        disabled={!hasData}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900/50 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                    >
                        Exportar CSV
                    </button>
                    <button
                        onClick={handleExportPDF}
                        disabled={!hasData}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-green-900/50 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                    >
                        Exportar PDF
                    </button>
                </footer>
            </div>
        </div>
    );
};

const AnalyticsStatCard: React.FC<{title: string, value: string, icon: React.ReactNode}> = ({ title, value, icon }) => (
    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
        <div className="flex items-center space-x-3">
            {icon}
            <div>
                <p className="text-sm text-white/70">{title}</p>
                <p className="font-bold text-lg text-white truncate">{value}</p>
            </div>
        </div>
    </div>
);

const AnalyticsTable: React.FC<{title: string, data: {label: string, value: number, percentage: string | number}[]}> = ({ title, data }) => (
    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
        <h3 className="font-semibold text-white/90 mb-3">{title}</h3>
        <div className="space-y-2">
            {data.slice(0, 5).map(item => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                    <span className="text-white/80 truncate pr-2">{item.label}</span>
                    <span className="font-semibold text-white">{item.percentage}%</span>
                </div>
            ))}
            {data.length === 0 && <p className="text-xs text-white/50 text-center py-2">Sem dados</p>}
        </div>
    </div>
);