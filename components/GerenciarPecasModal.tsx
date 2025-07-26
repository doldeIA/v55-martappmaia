
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeftIcon, ShoppingBagIcon, CheckCircleIcon } from './Icons';
import { Product } from '../types';
import { PersistentImage } from './PersistentImage';

interface GerenciarPecasModalProps {
    onClose: () => void;
    products: Product[];
    onToggleManaged: (productId: number) => void;
    onUpdateImage: (productId: number, file: File) => void;
}

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

const ProductManagementCard: React.FC<{
  product: Product;
  onToggle: () => void;
  onUpdateImage: (file: File) => void;
}> = ({ product, onToggle, onUpdateImage }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onUpdateImage(e.target.files[0]);
        }
    };

    return (
        <div className="bg-white/5 p-3 rounded-lg border border-white/10 flex flex-col gap-3">
            <div className="flex items-center gap-4">
                <PersistentImage src={product.imageUrl} alt={product.name} className="w-16 h-16 rounded-md object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{product.name}</p>
                    <p className="text-sm text-white/60 truncate">{product.brand}</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm bg-blue-600/80 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-colors"
                >
                    Alterar Imagem
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                />
                <label className={cn(
                    "flex items-center justify-center gap-2 cursor-pointer text-white font-semibold py-2 rounded-lg transition-colors text-sm",
                    product.isManaged ? "bg-green-600/80 hover:bg-green-600" : "bg-slate-700 hover:bg-slate-600"
                )}>
                    <div className={cn(
                        "w-4 h-4 rounded-sm border-2 flex items-center justify-center flex-shrink-0",
                        product.isManaged ? 'bg-green-400 border-green-300' : 'border-white/50'
                    )}>
                       {product.isManaged && <CheckCircleIcon className="w-3 h-3 text-white"/>}
                    </div>
                    <span>{product.isManaged ? 'Ativo' : 'Inativo'}</span>
                    <input type="checkbox" checked={!!product.isManaged} onChange={onToggle} className="sr-only" />
                </label>
            </div>
        </div>
    );
};

export const GerenciarPecasModal: React.FC<GerenciarPecasModalProps> = ({ onClose, products, onToggleManaged, onUpdateImage }) => {
    const [isVisible, setIsVisible] = useState(false);

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

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className={`bg-gradient-to-br from-gray-900 via-slate-900 to-black/90 text-white w-full max-w-2xl h-[90vh] rounded-2xl border border-white/10 shadow-2xl transition-all duration-300 flex flex-col ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={e => e.stopPropagation()}
            >
                <header className="relative flex items-center justify-center p-4 border-b border-white/10 flex-shrink-0">
                    <button onClick={handleClose} className="absolute left-4 p-2 rounded-full text-white/70 hover:bg-white/10" aria-label="Voltar">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <div className="flex items-center space-x-3">
                        <ShoppingBagIcon className="w-6 h-6 text-amber-300" />
                        <h2 className="text-xl font-bold">Gerenciar Peças</h2>
                    </div>
                </header>

                <main className="flex-1 p-4 overflow-y-auto scrollbar-thin">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {products.map((product) => (
                            <ProductManagementCard 
                                key={product.id} 
                                product={product}
                                onToggle={() => onToggleManaged(product.id)}
                                onUpdateImage={(file) => onUpdateImage(product.id, file)}
                            />
                        ))}
                         {products.length === 0 && (
                            <div className="text-center text-sm text-white/50 py-8 md:col-span-2">Nenhuma peça para gerenciar.</div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};