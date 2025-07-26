
import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, TagIcon, TrashIcon, PlusCircleIcon } from './Icons';

interface GerenciarDescontosModalProps {
    onClose: () => void;
    discountOptions: number[];
    onAddDiscountOption: (discount: number) => void;
    onRemoveDiscountOption: (discount: number) => void;
}

export const GerenciarDescontosModal: React.FC<GerenciarDescontosModalProps> = ({ onClose, discountOptions, onAddDiscountOption, onRemoveDiscountOption }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [newDiscount, setNewDiscount] = useState('');

    useEffect(() => {
        setIsVisible(true);
        document.body.style.overflow = 'hidden';
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose();
        };
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

    const handleAdd = () => {
        const value = parseInt(newDiscount, 10);
        if (value >= 1 && value <= 100) {
            onAddDiscountOption(value);
            setNewDiscount('');
        }
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className={`bg-gradient-to-br from-gray-900 via-slate-900 to-black/90 text-white w-full max-w-lg h-[80vh] rounded-2xl border border-white/10 shadow-2xl transition-all duration-300 flex flex-col ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={e => e.stopPropagation()}
            >
                <header className="relative flex items-center justify-center p-4 border-b border-white/10 flex-shrink-0">
                    <button onClick={handleClose} className="absolute left-4 p-2 rounded-full text-white/70 hover:bg-white/10" aria-label="Voltar">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <div className="flex items-center space-x-3">
                        <TagIcon className="w-6 h-6 text-green-300" />
                        <h2 className="text-xl font-bold">Gerenciar Descontos</h2>
                    </div>
                </header>

                <main className="flex-1 p-4 overflow-y-auto">
                    <ul className="space-y-2">
                        {discountOptions.map((discount, index) => (
                            <li key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                <span className="font-medium text-white/90">{discount}%</span>
                                <button onClick={() => onRemoveDiscountOption(discount)} className="p-1 text-red-400 hover:text-red-300 hover:bg-white/10 rounded-full transition-colors">
                                    <TrashIcon className="w-5 h-5"/>
                                </button>
                            </li>
                        ))}
                         {discountOptions.length === 0 && (
                            <li className="text-center text-sm text-white/50 py-8">Nenhuma porcentagem de desconto cadastrada.</li>
                        )}
                    </ul>
                </main>

                <footer className="p-4 border-t border-white/10 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={newDiscount}
                            onChange={(e) => setNewDiscount(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                            placeholder="Nova porcentagem (Ex: 25)"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-green-400"
                        />
                        <button 
                            onClick={handleAdd} 
                            className="bg-green-600 hover:bg-green-700 disabled:bg-green-800/50 text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 flex-shrink-0"
                            disabled={!newDiscount.trim()}
                        >
                            <PlusCircleIcon className="w-5 h-5"/>
                            <span>Adicionar</span>
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};
