

import React, { useState, useEffect, useMemo } from 'react';
import { Product, InteractionType } from '../types';
import { TagIcon, BuildingStorefrontIcon, ShoppingBagIcon, ArrowLeftIcon, CheckCircleIcon } from './Icons';

interface AnunciosModalProps {
    onClose: () => void;
    discountOptions: number[];
    brands: string[];
    products: Product[];
    onTrackInteraction: (type: InteractionType, key: string | number) => void;
}

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

export const AnunciosModal: React.FC<AnunciosModalProps> = ({ onClose, discountOptions, brands, products, onTrackInteraction }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [selectedDiscount, setSelectedDiscount] = useState<number | null>(null);
    const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
    
    const managedProducts = useMemo(() => products.filter(p => p.isManaged), [products]);

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

    const handleDiscountSelect = (discount: number) => {
        setSelectedDiscount(discount);
        onTrackInteraction('discounts', discount);
    };

    const handleBrandSelect = (brand: string) => {
        setSelectedBrand(brand);
        onTrackInteraction('brands', brand);
    };
    
    const handleProductSelect = (productId: number) => {
        setSelectedProduct(productId);
        onTrackInteraction('products', productId);
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
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
                    <h2 className="text-xl font-bold">Analisar Anúncios</h2>
                </header>

                <main className="flex-1 p-6 overflow-y-auto space-y-8">
                    {/* Modelo 1: Descontos */}
                    <AdModelCard title="Descontos" icon={<TagIcon className="w-6 h-6 text-green-300"/>}>
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                            {discountOptions.map(d => (
                                <SelectableButton key={d} label={`${d}%`} isSelected={selectedDiscount === d} onClick={() => handleDiscountSelect(d)} />
                            ))}
                        </div>
                    </AdModelCard>

                    {/* Modelo 2: Marca */}
                    <AdModelCard title="Marcas" icon={<BuildingStorefrontIcon className="w-6 h-6 text-fuchsia-300"/>}>
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                            {brands.slice(0, 10).map(b => (
                                <SelectableButton key={b} label={b} isSelected={selectedBrand === b} onClick={() => handleBrandSelect(b)} />
                            ))}
                        </div>
                    </AdModelCard>

                    {/* Modelo 3: Peças */}
                    <AdModelCard title="Peças" icon={<ShoppingBagIcon className="w-6 h-6 text-amber-300"/>}>
                        <div className="flex space-x-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-thin">
                            {managedProducts.map(p => (
                                <ProductCard key={p.id} product={p} isSelected={selectedProduct === p.id} onClick={() => handleProductSelect(p.id)} />
                            ))}
                        </div>
                    </AdModelCard>
                </main>
            </div>
        </div>
    );
};

const AdModelCard: React.FC<{title: string, icon: React.ReactNode, children: React.ReactNode}> = ({ title, icon, children }) => (
    <section className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
            {icon}
            <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div>{children}</div>
    </section>
);

const SelectableButton: React.FC<{label: string, isSelected: boolean, onClick: () => void}> = ({ label, isSelected, onClick }) => (
    <button
        onClick={onClick}
        className={cn('p-3 rounded-lg text-center transition-all duration-200 border-2 truncate',
            isSelected ? 'bg-white/20 border-white text-white font-bold' : 'bg-white/5 border-transparent hover:border-white/50 text-white/80'
        )}
    >
        <span className="font-semibold text-sm">{label}</span>
    </button>
);

const ProductCard: React.FC<{product: Product, isSelected: boolean, onClick: () => void}> = ({ product, isSelected, onClick }) => (
    <div onClick={onClick} className={cn(
        'rounded-lg bg-white/10 cursor-pointer transition-all duration-200 border-2 overflow-hidden relative group flex-shrink-0 w-40 aspect-[3/4]',
        isSelected ? 'border-white shadow-lg shadow-white/20' : 'border-transparent hover:border-white/50'
    )}>
        {isSelected && (
            <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1 z-10 shadow-lg">
                <CheckCircleIcon className="w-4 h-4 text-white" />
            </div>
        )}
        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
            <p className="font-semibold text-sm text-white truncate drop-shadow-md">{product.name}</p>
            <p className="text-xs text-white/80 truncate drop-shadow-md">{product.brand}</p>
        </div>
    </div>
);