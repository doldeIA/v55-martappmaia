import React, { useState, useEffect, useMemo } from 'react';
import { initialInventory } from '../data/inventoryData';
import { Product } from '../types';
import { ShoppingBagIcon, MagnifyingGlassIcon, ArrowLeftIcon } from './Icons';

interface ItemsModalProps {
    onClose: () => void;
    onSelect: (item: Product) => void;
}

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

export const ItemsModal: React.FC<ItemsModalProps> = ({ onClose, onSelect }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeNeonId, setActiveNeonId] = useState<number | null>(null);

    useEffect(() => {
        setIsVisible(true);
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const handleSelect = (item: Product) => {
        setActiveNeonId(item.id);
        setTimeout(() => {
            onSelect(item);
            handleClose();
        }, 300);
    };
    
    const displayItems = useMemo(() => initialInventory.slice(0, 4), []);
    
    const filteredInventory = useMemo(() => 
        displayItems.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchTerm.toLowerCase())
        ), [searchTerm, displayItems]);

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className={`bg-gradient-to-br from-gray-900 via-slate-900 to-black/90 text-white w-full max-w-2xl h-[80vh] rounded-2xl border border-white/10 shadow-2xl transition-all duration-300 flex flex-col ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={e => e.stopPropagation()}
            >
                <header className="relative flex items-center justify-center p-4 border-b border-white/10 flex-shrink-0">
                     <button onClick={handleClose} className="absolute left-4 p-2 rounded-full text-white/70 hover:bg-white/10 transition-colors" aria-label="Voltar">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <div className="flex items-center space-x-3">
                        <ShoppingBagIcon className="w-6 h-6 text-amber-300" />
                        <h2 className="text-xl font-bold">Selecionar Peça</h2>
                    </div>
                </header>
                
                <div className="p-4 flex-shrink-0">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40"/>
                        <input 
                            type="text"
                            placeholder="Buscar por nome ou marca..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                    </div>
                </div>

                <main className="flex-1 p-4 overflow-y-auto">
                    <ul className="space-y-3">
                        {filteredInventory.map(item => (
                            <li 
                                key={item.id} 
                                onClick={() => handleSelect(item)}
                                className={cn(
                                    "w-full text-left p-2 rounded-lg bg-white/5 border border-transparent transition-all flex items-center space-x-4 cursor-pointer hover:bg-white/10",
                                    activeNeonId === item.id && "shadow-[0_0_15px_rgba(251,189,35,0.7)] border-amber-400/50"
                                )}
                            >
                                <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-md object-cover flex-shrink-0" />
                                <div>
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-sm text-white/60">{item.brand} - {item.category}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </main>
            </div>
        </div>
    );
};