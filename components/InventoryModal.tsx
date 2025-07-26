
import React, { useState, useEffect, useMemo } from 'react';
import { Product, InventoryStatus } from '../types';
import { initialInventory } from '../data/inventoryData';
import { generateContentWithApiKey } from '../services/geminiService';
import { 
    BoxIcon, UsersIcon, ArrowTrendingUpIcon, LightBulbIcon, ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon, TagIcon, ChevronRightIcon, MagnifyingGlassIcon, PlusCircleIcon, TrashIcon, SparkleIcon, ArrowLeftIcon, ChartPieIcon
} from './Icons';
import { PersistentImage } from './PersistentImage';

// #region Sub-components

const TabButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all duration-300 w-full text-left ${
            isActive 
                ? 'bg-white/20 text-white' 
                : 'text-white/60 hover:bg-white/10 hover:text-white'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const ProductStatusBadge: React.FC<{ status: InventoryStatus }> = ({ status }) => {
    const statusInfo = useMemo(() => {
        switch (status) {
            case 'In Stock': return { icon: <CheckCircleIcon className="w-4 h-4" />, color: 'text-green-400', label: 'Em Estoque' };
            case 'Low Stock': return { icon: <ExclamationTriangleIcon className="w-4 h-4" />, color: 'text-yellow-400', label: 'Estoque Baixo' };
            case 'Out of Stock': return { icon: <XCircleIcon className="w-4 h-4" />, color: 'text-red-400', label: 'Esgotado' };
            case 'On Sale': return { icon: <TagIcon className="w-4 h-4" />, color: 'text-blue-400', label: 'Em Promoção' };
            default: return { icon: null, color: '', label: '' };
        }
    }, [status]);

    return (
        <span className={`flex items-center space-x-1.5 text-sm font-medium ${statusInfo.color}`}>
            {statusInfo.icon}
            <span>{statusInfo.label}</span>
        </span>
    );
};

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white/10 p-4 rounded-lg flex items-center space-x-4">
        <div className="bg-white/10 p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-white/70 text-sm">{title}</p>
            <p className="text-white text-xl md:text-2xl font-bold">{value}</p>
        </div>
    </div>
);

const BarChart: React.FC<{ title: string; data: { name: string; value: number | string; percentage: number }[] }> = ({ title, data }) => (
    <div className="bg-white/10 p-4 rounded-lg">
        <h4 className="font-semibold text-white/80 mb-4">{title}</h4>
        <div className="space-y-3">
            {data.map((item, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 items-center text-sm">
                    <span className="truncate text-white/70">{item.name}</span>
                    <div className="col-span-2 flex items-center space-x-2">
                        <div className="w-full bg-white/10 rounded-full h-2.5">
                            <div className="bg-teal-400 h-2.5 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                        </div>
                        <span className="font-semibold text-white/90 text-right w-12">{item.value}</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const PieChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
    const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);
    if (total === 0) return <div className="flex items-center justify-center h-48 text-white/50">Sem dados para exibir.</div>;
    
    let cumulativePercentage = 0;
    const segments = data.map(item => {
        const percentage = (item.value / total) * 100;
        const startAngle = cumulativePercentage;
        cumulativePercentage += percentage;
        return { ...item, percentage, startAngle };
    });

    return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 p-4">
            <div className="relative w-40 h-40">
                {segments.map((segment, index) => (
                    <svg key={index} className="absolute top-0 left-0 w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <circle
                            cx="18" cy="18" r="15.9155"
                            fill="transparent"
                            stroke={segment.color}
                            strokeWidth="3.8"
                            strokeDasharray={`${segment.percentage} ${100 - segment.percentage}`}
                            strokeDashoffset={-segment.startAngle}
                        />
                    </svg>
                ))}
            </div>
            <ul className="flex flex-wrap md:flex-col gap-x-4 gap-y-2">
                {data.map(item => (
                    <li key={item.label} className="flex items-center space-x-2 text-sm">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span className="text-white/70">{item.label}:</span>
                        <span className="font-semibold text-white">{item.value}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// #endregion

// --- Main Modal Component ---
export const InventoryModal: React.FC<{ onClose: () => void; }> = ({ onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [inventory, setInventory] = useState<Product[]>(initialInventory);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setIsVisible(true);
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };
    
    const getStatus = (stock: number, threshold: number, discount?: number): InventoryStatus => {
        if (stock === 0) return 'Out of Stock';
        if (discount && discount > 0) return 'On Sale';
        if (stock <= threshold) return 'Low Stock';
        return 'In Stock';
    };

    const handleProductUpdate = (updatedProduct: Product) => {
        setInventory(prev => {
            const index = prev.findIndex(p => p.id === updatedProduct.id);
            if (index === -1) return prev;
            
            const newStatus = getStatus(updatedProduct.stock, updatedProduct.stockThreshold, updatedProduct.discount);
            const productWithStatus = { ...updatedProduct, status: newStatus };

            const newInventory = [...prev];
            newInventory[index] = productWithStatus;
            
            setSelectedProduct(productWithStatus);
            return newInventory;
        });
    };
    
    const handleProductDelete = (productId: number) => {
        setInventory(prev => prev.filter(p => p.id !== productId));
        setSelectedProduct(null);
    };

    const filteredInventory = useMemo(() => 
        inventory.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase())
        ), [inventory, searchTerm]);
        
    const handleSelectProduct = (product: Product) => {
        setSelectedProduct(product);
        if (activeTab !== 'products' && window.innerWidth < 768) { // On mobile, switch tab when a product is selected
             setActiveTab('products');
        }
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className={`bg-gradient-to-br from-gray-900 via-slate-900 to-black/90 backdrop-blur-2xl border border-white/10 shadow-2xl w-full h-full md:w-[95%] md:h-[95%] text-white transition-all duration-300 flex flex-col md:flex-row overflow-hidden rounded-none md:rounded-2xl ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Sidebar */}
                <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 p-4 flex flex-col md:space-y-8 bg-black/20 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 px-2">
                           <BoxIcon className="w-8 h-8 text-teal-300" />
                           <h2 className="text-xl font-bold">Estoque</h2>
                        </div>
                         <button onClick={handleClose} className="p-2 rounded-full text-white/70 hover:bg-white/10 transition-colors md:hidden" aria-label="Voltar">
                            <ArrowLeftIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <nav className="flex flex-row md:flex-col justify-around md:justify-start md:space-y-2 mt-2 md:mt-0">
                        <TabButton icon={<UsersIcon className="w-6 h-6"/>} label="Visão Geral" isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                        <TabButton icon={<BoxIcon className="w-6 h-6"/>} label="Produtos" isActive={activeTab === 'products'} onClick={() => setActiveTab('products')} />
                        <TabButton icon={<ArrowTrendingUpIcon className="w-6 h-6"/>} label="Análise" isActive={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col overflow-y-auto">
                    <header className="hidden md:flex items-center justify-between p-4 border-b border-white/10 sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10">
                        <h3 className="text-lg font-semibold text-white/80">
                            {activeTab === 'overview' && 'Visão Geral do Estoque'}
                            {activeTab === 'products' && 'Gerenciamento de Produtos'}
                            {activeTab === 'analytics' && 'Análise de Vendas e Demanda'}
                        </h3>
                        <button onClick={handleClose} className="p-1 rounded-full text-white/70 hover:bg-white/20" aria-label="Fechar">
                            <ArrowLeftIcon className="w-6 h-6" />
                        </button>
                    </header>
                    <div className="flex-1 p-4 md:p-6">
                        {activeTab === 'overview' && <OverviewTab inventory={inventory} onSelectProduct={handleSelectProduct} />}
                        {activeTab === 'analytics' && <AnalyticsTab inventory={inventory} />}
                        {activeTab === 'products' && (
                            <>
                                <div className="relative mb-4">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40"/>
                                    <input 
                                        type="text"
                                        placeholder="Buscar por nome, marca, categoria..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                                    />
                                </div>
                                <InventoryTable inventory={filteredInventory} onSelectProduct={setSelectedProduct} />
                            </>
                        )}
                    </div>
                </main>
                
                {/* Product Detail Panel */}
                <ProductDetailPanel
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onUpdate={handleProductUpdate}
                    onDelete={handleProductDelete}
                />
            </div>
        </div>
    );
};

// --- Tab-specific Components ---

const OverviewTab: React.FC<{ inventory: Product[], onSelectProduct: (p: Product) => void }> = ({ inventory, onSelectProduct }) => {
    const stats = useMemo(() => {
        const totalValue = inventory.reduce((sum, p) => sum + (p.stock * p.price), 0);
        return {
            totalProducts: inventory.length,
            lowStock: inventory.filter(p => p.status === 'Low Stock').length,
            outOfStock: inventory.filter(p => p.status === 'Out of Stock').length,
            totalValue: `R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        };
    }, [inventory]);

    // Logic for product lists is preserved for future use but not rendered below.
    const attentionProducts = useMemo(() => inventory.filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock').slice(0, 5), [inventory]);
    const topSellers = useMemo(() => [...inventory].sort((a, b) => b.sales - a.sales).slice(0, 5), [inventory]);

    return (
        <div className="h-full w-full flex items-center justify-center">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl">
                <StatCard title="Total de Produtos" value={stats.totalProducts} icon={<BoxIcon className="w-6 h-6 text-teal-300"/>} />
                <StatCard title="Estoque Baixo" value={stats.lowStock} icon={<ExclamationTriangleIcon className="w-6 h-6 text-yellow-300"/>} />
                <StatCard title="Esgotados" value={stats.outOfStock} icon={<XCircleIcon className="w-6 h-6 text-red-300"/>} />
                <StatCard title="Valor do Estoque" value={stats.totalValue} icon={<ArrowTrendingUpIcon className="w-6 h-6 text-green-300"/>} />
            </div>
        </div>
    );
};

const AnalyticsTab: React.FC<{ inventory: Product[] }> = ({ inventory }) => {
    const [aiInsights, setAiInsights] = useState<{insight: string}[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);

    const salesByCategory = useMemo(() => {
        const categoryMap = new Map<string, number>();
        inventory.forEach(p => {
            const categorySales = (categoryMap.get(p.category) || 0) + p.sales;
            categoryMap.set(p.category, categorySales);
        });
        const sorted = Array.from(categoryMap.entries()).sort(([, a], [, b]) => b - a);
        const maxSales = sorted.length > 0 ? sorted[0][1] : 0;
        return sorted.map(([category, sales]) => ({
            name: category,
            value: sales,
            percentage: maxSales > 0 ? (sales / maxSales) * 100 : 0,
        }));
    }, [inventory]);

    const salesByBrand = useMemo(() => {
        const brandMap = new Map<string, number>();
        inventory.forEach(p => {
            const brandSales = (brandMap.get(p.brand) || 0) + p.sales;
            brandMap.set(p.brand, brandSales);
        });
        const sorted = Array.from(brandMap.entries()).sort(([, a], [, b]) => b - a);
        const maxSales = sorted.length > 0 ? sorted[0][1] : 0;
        return sorted.map(([brand, sales]) => ({
            name: brand,
            value: sales,
            percentage: maxSales > 0 ? (sales / maxSales) * 100 : 0,
        }));
    }, [inventory]);

    const stockByStatus = useMemo(() => {
        const statusMap = new Map<InventoryStatus, number>();
        inventory.forEach(p => {
            statusMap.set(p.status, (statusMap.get(p.status) || 0) + 1);
        });
        return [
            { label: 'Em Estoque', value: statusMap.get('In Stock') || 0, color: '#34d399' },
            { label: 'Estoque Baixo', value: statusMap.get('Low Stock') || 0, color: '#facc15' },
            { label: 'Esgotado', value: statusMap.get('Out of Stock') || 0, color: '#f87171' },
            { label: 'Em Promoção', value: statusMap.get('On Sale') || 0, color: '#60a5fa' },
        ].filter(item => item.value > 0);
    }, [inventory]);

    const handleGenerateInsights = async () => {
        setIsGenerating(true);
        setGenerationError(null);
        setAiInsights([]);
        
        const simplifiedInventory = inventory.map(({ id, name, category, brand, stock, price, sales, status }) => ({ id, name, category, brand, stock, price, sales, status }));
        const prompt = `
            Baseado nos seguintes dados de inventário de uma loja de roupas em formato JSON:
            ${JSON.stringify(simplifiedInventory, null, 2)}
            
            Atue como um analista de varejo especialista. Forneça 3 insights acionáveis e concisos para o gerente da loja.
            Os insights devem focar em oportunidades de vendas, problemas de estoque ou sugestões de marketing.
            Responda em formato JSON, com um array de objetos, onde cada objeto tem uma única chave "insight" contendo a string do insight.
            Exemplo de formato: [{ "insight": "Sua primeira sugestão." }, { "insight": "Sua segunda sugestão." }]
        `;
        
        try {
            const insights = await generateContentWithApiKey(prompt);
            setAiInsights(insights);
        } catch (error) {
            setGenerationError(error instanceof Error ? error.message : "Ocorreu um erro desconhecido.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BarChart title="Vendas por Categoria" data={salesByCategory} />
                <BarChart title="Vendas por Marca" data={salesByBrand} />
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
                 <h4 className="font-semibold text-white/80 mb-3 flex items-center space-x-2"><ChartPieIcon className="w-5 h-5 text-teal-300"/><span>Distribuição de Estoque</span></h4>
                 <PieChart data={stockByStatus} />
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-white/80 flex items-center space-x-2">
                        <LightBulbIcon className="w-5 h-5 text-yellow-300"/>
                        <span>Insights Estratégicos com IA</span>
                    </h4>
                    <button 
                        onClick={handleGenerateInsights}
                        disabled={isGenerating}
                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800/50 disabled:cursor-not-allowed text-white text-sm font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                        <SparkleIcon className="w-4 h-4" />
                        <span>{isGenerating ? "Gerando..." : "Gerar Insights"}</span>
                    </button>
                </div>

                {isGenerating && <div className="text-center p-4 text-white/70">Analisando dados...</div>}
                
                {generationError && (
                    <div className="bg-red-900/50 border border-red-700/50 text-red-200 text-sm p-3 rounded-lg">
                        <p className="font-bold mb-1">Erro ao gerar insights:</p>
                        <p>{generationError}</p>
                    </div>
                )}
                
                {aiInsights.length > 0 && (
                    <ul className="space-y-3 text-sm text-white/80 list-disc list-inside">
                        {aiInsights.map((item, index) => (
                            <li key={index}>{item.insight}</li>
                        ))}
                    </ul>
                )}

                {!isGenerating && !generationError && aiInsights.length === 0 && (
                    <div className="text-center p-4 text-white/50">
                        Clique em "Gerar Insights" para obter recomendações personalizadas da IA.
                    </div>
                )}
            </div>
        </div>
    );
};


// --- InventoryTable Component ---
const InventoryTable: React.FC<{ inventory: Product[], onSelectProduct: (p: Product) => void }> = ({ inventory, onSelectProduct }) => (
    <div className="overflow-x-auto bg-white/5 rounded-lg border border-white/10">
        <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-xs text-white/60 uppercase tracking-wider">
                <tr>
                    <th scope="col" className="px-6 py-3">Produto</th>
                    <th scope="col" className="px-6 py-3 text-right">Estoque</th>
                </tr>
            </thead>
            <tbody>
                {inventory.map(product => (
                    <tr key={product.id} onClick={() => onSelectProduct(product)} className="border-b border-white/10 hover:bg-white/10 cursor-pointer transition-colors">
                        <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                                <PersistentImage src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-md object-cover"/>
                                <div>
                                    <div>{product.name}</div>
                                    <div className="text-xs text-white/50">{product.brand}</div>
                                </div>
                            </div>
                        </th>
                        <td className="px-6 py-4 text-white/80 text-right">{product.stock}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

// --- ProductDetailPanel Component ---
const ProductDetailPanel: React.FC<{
    product: Product | null,
    onClose: () => void,
    onUpdate: (p: Product) => void,
    onDelete: (id: number) => void,
}> = ({ product, onClose, onUpdate, onDelete }) => {
    const [restockAmount, setRestockAmount] = useState(10);
    const [discountAmount, setDiscountAmount] = useState(10);
    
    useEffect(() => {
        if (product) {
            setRestockAmount(10);
            setDiscountAmount(product.discount || 10);
        }
    }, [product]);

    const handleRestock = () => {
        if (!product) return;
        onUpdate({ ...product, stock: product.stock + Math.max(0, restockAmount) });
    };

    const handleDiscount = () => {
        if (!product) return;
        onUpdate({ ...product, discount: Math.max(0, discountAmount) });
    };

    const handleRemoveDiscount = () => {
        if (!product) return;
        const { discount, ...rest } = product;
        onUpdate(rest);
    };

    const handleDelete = () => {
        if (!product) return;
        if (window.confirm(`Tem certeza que deseja descontinuar o produto "${product.name}"? Esta ação não pode ser desfeita.`)) {
            onDelete(product.id);
        }
    };

    return (
        <aside className={`w-full md:w-96 flex-shrink-0 border-l border-white/10 bg-gray-900/50 flex flex-col transition-transform duration-300 ease-in-out transform ${product ? 'translate-x-0' : 'translate-x-full'}`}>
            <header className="p-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10">
                <h3 className="font-bold text-lg">Detalhes do Produto</h3>
                <button onClick={onClose} className="p-1 rounded-full text-white/70 hover:bg-white/20" aria-label="Fechar detalhes">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </header>
            
            {product && (
              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                  <PersistentImage src={product.imageUrl} alt={product.name} className="w-full h-48 rounded-lg object-cover mb-4" />
                  <h4 className="text-2xl font-bold">{product.name}</h4>
                  <p className="text-white/60">{product.brand} / {product.category}</p>
                  <div className="flex justify-between items-center">
                      <span className="text-3xl font-light">R$ {(product.discount ? product.price * (1 - product.discount / 100) : product.price).toFixed(2)}</span>
                      {product.discount && <span className="text-sm bg-blue-500/50 text-blue-200 px-2 py-1 rounded-full">{product.discount}% OFF</span>}
                  </div>
                  <ProductStatusBadge status={product.status} />

                  <div className="space-y-4 pt-4 border-t border-white/10">
                      <h5 className="font-semibold">Ações</h5>
                      {/* Restock */}
                      <div className="space-y-2">
                          <label className="text-sm text-white/70">Reabastecer</label>
                          <div className="flex space-x-2">
                              <input type="number" value={restockAmount} onChange={e => setRestockAmount(parseInt(e.target.value) || 0)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-400" />
                              <button onClick={handleRestock} className="bg-teal-500 hover:bg-teal-600 px-4 py-1.5 rounded-lg flex items-center space-x-2 whitespace-nowrap"><PlusCircleIcon className="w-5 h-5"/> <span>Adicionar</span></button>
                          </div>
                      </div>
                       {/* Discount */}
                      <div className="space-y-2">
                          <label className="text-sm text-white/70">{product.discount ? 'Ajustar Desconto' : 'Aplicar Desconto'}</label>
                          <div className="flex space-x-2">
                              <input type="number" value={discountAmount} onChange={e => setDiscountAmount(parseInt(e.target.value) || 0)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                              <button onClick={handleDiscount} className="bg-blue-500 hover:bg-blue-600 px-4 py-1.5 rounded-lg flex items-center space-x-2 whitespace-nowrap"><TagIcon className="w-5 h-5"/> <span>Aplicar</span></button>
                          </div>
                          {product.discount && <button onClick={handleRemoveDiscount} className="text-xs text-blue-300 hover:underline px-1 py-0.5">Remover desconto</button>}
                      </div>
                      {/* Discontinue */}
                      <div className="pt-2">
                           <button onClick={handleDelete} className="w-full bg-red-800/80 hover:bg-red-700/80 px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"><TrashIcon className="w-5 h-5"/> <span>Descontinuar Produto</span></button>
                      </div>
                  </div>
              </div>
            )}
        </aside>
    );
};