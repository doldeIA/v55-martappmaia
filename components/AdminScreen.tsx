import React, { useState, useEffect } from 'react';
import { XMarkIcon } from './Icons';

interface AdminScreenProps {
  onClose: () => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({ onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

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

    return (
        <div
          className={`fixed inset-0 z-[80] flex items-center justify-center bg-white transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        >
            <button onClick={handleClose} className="absolute top-6 right-6 p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors" aria-label="Fechar">
                <XMarkIcon className="w-8 h-8" />
            </button>
            <div className="flex flex-col md:flex-row gap-8">
                <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-10 rounded-lg text-lg transition-colors shadow-lg">
                    Botão Vermelho
                </button>
                <button className="bg-black hover:bg-gray-800 text-white font-bold py-4 px-10 rounded-lg text-lg transition-colors shadow-lg">
                    Botão Preto
                </button>
            </div>
        </div>
    );
};