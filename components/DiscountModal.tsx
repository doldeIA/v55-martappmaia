import React, { useState, useEffect } from 'react';
import { TagIcon, ArrowLeftIcon } from './Icons';

interface DiscountModalProps {
    onClose: () => void;
    onSelect: (discount: number) => void;
    currentValue: number | null;
}

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

export const DiscountModal: React.FC<DiscountModalProps> = ({ onClose, onSelect, currentValue }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [glowingButton, setGlowingButton] = useState<number | null>(null);
    
    useEffect(() => {
        setIsVisible(true);
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };
    
    const handleSelect = (discount: number) => {
        setGlowingButton(discount);
        onSelect(discount);
        setTimeout(() => {
            handleClose();
        }, 300);
    };

    const discountOptions = [10, 50, 70];

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className={`bg-gradient-to-br from-gray-900 via-slate-900 to-black/90 text-white w-full max-w-md rounded-2xl border border-white/10 shadow-2xl transition-all duration-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={e => e.stopPropagation()}
            >
                <header className="relative flex items-center justify-center p-4 border-b border-white/10">
                    <button onClick={handleClose} className="absolute left-4 p-2 rounded-full text-white/70 hover:bg-white/10 transition-colors" aria-label="Voltar">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <div className="flex items-center space-x-3">
                        <TagIcon className="w-6 h-6 text-green-300" />
                        <h2 className="text-xl font-bold">Definir Desconto</h2>
                    </div>
                </header>

                <main className="p-8 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        {discountOptions.map(option => (
                             <button
                                key={option}
                                onClick={() => handleSelect(option)}
                                className={cn(
                                    `p-4 rounded-lg text-center transition-all duration-200 border-2`,
                                    currentValue === option 
                                        ? 'bg-green-500/20 border-green-400 text-white' 
                                        : 'bg-white/5 border-transparent hover:border-green-400/50',
                                    glowingButton === option && "glow-green"
                                )}
                            >
                                <span className="text-2xl font-bold">{option}%</span>
                            </button>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};