
import React, { useState, useEffect } from 'react';
import { ExclamationTriangleIcon } from './Icons';

interface StopConfirmModalProps {
    onClose: () => void;
    onConfirm: () => void;
}

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

export const StopConfirmModal: React.FC<StopConfirmModalProps> = ({ onClose, onConfirm }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };
    
    const handleConfirm = () => {
        onConfirm();
        handleClose();
    };

    return (
        <div
            className={cn("fixed inset-0 z-[60] flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out", isVisible ? 'opacity-100 bg-black/60 backdrop-blur-sm' : 'opacity-0 pointer-events-none')}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={cn('relative w-full max-w-sm bg-slate-900/80 backdrop-blur-xl rounded-xl border border-yellow-400/30', 'shadow-2xl shadow-yellow-500/20 ring-2 ring-yellow-400', 'transition-all duration-300 ease-in-out', isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95')}
            >
                <div className="p-8 text-center space-y-6">
                    <div className="flex justify-center">
                        <ExclamationTriangleIcon className="w-12 h-12 text-yellow-400"/>
                    </div>
                    <h2 className="text-xl font-bold text-white">Parar o som?</h2>
                    <p className="text-white/70">Tem certeza que deseja parar o som ambiente?</p>
                    <div className="flex justify-center gap-4 pt-2">
                        <button 
                            onClick={handleClose}
                            className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleConfirm}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
                        >
                            Sim, parar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
