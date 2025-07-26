import React, { useState, useEffect, useMemo } from 'react';
import { initialInventory } from '../data/inventoryData';
import { BuildingStorefrontIcon, ArrowLeftIcon } from './Icons';

interface BrandsModalProps {
    onClose: () => void;
    onSelect: (brand: string) => void;
}

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

export const BrandsModal: React.FC<BrandsModalProps> = ({ onClose, onSelect }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [activeNeonId, setActiveNeonId] = useState<string | null>(null);
    
    useEffect(() => {
        setIsVisible(true);
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, []);

    const brands = useMemo(() => {
        const uniqueBrands = new Set(initialInventory.map(p => p.brand));
        return Array.from(uniqueBrands);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const handleSelect = (brand: string) => {
        setActiveNeonId(brand);
        setTimeout(() => {
            onSelect(brand);
            handleClose();
        }, 300);
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className={`bg-gradient-to-br from-gray-900 via-slate-900 to-black/90 text-white w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl transition-all duration-300 flex flex-col ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={e => e.stopPropagation()}
            >
                <header className="relative flex items-center justify-center p-4 border-b border-white/10">
                    <button onClick={handleClose} className="absolute left-4 p-2 rounded-full text-white/70 hover:bg-white/10 transition-colors" aria-label="Voltar">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <div className="flex items-center space-x-3">
                        <BuildingStorefrontIcon className="w-6 h-6 text-fuchsia-300" />
                        <h2 className="text-xl font-bold">Selecionar Marca</h2>
                    </div>
                </header>

                <main className="p-6">
                    <ul className="grid grid-cols-2 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-2">
                        {brands.map(brand => (
                            <li key={brand}>
                                <button
                                    onClick={() => handleSelect(brand)}
                                    className={cn(
                                        "w-full text-center p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-fuchsia-400/50 transition-all",
                                        activeNeonId === brand && "shadow-[0_0_15px_rgba(232,121,249,0.7)] border-fuchsia-400/50"
                                    )}
                                >
                                    <p className="font-semibold truncate">{brand}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                </main>
            </div>
        </div>
    );
};