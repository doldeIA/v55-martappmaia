
import React, { useState, useEffect } from 'react';
import { XMarkIcon, MusicNoteIcon, CheckCircleIcon, ExclamationTriangleIcon, PlayIcon, PauseIcon, PencilSquareIcon, CogIcon, ShoppingBagIcon, BuildingStorefrontIcon, TagIcon, ChartPieIcon, ChartBarIcon } from './Icons';
import { AudioFile, CustomLabels, AppTheme } from '../types';

interface UploadModalProps {
    onClose: () => void;
    onUpload: (file: File) => void;
    audioFiles: AudioFile[];
    onPlay: (file: AudioFile) => void;
    isPlaying: boolean;
    nowPlayingFileId: string | null;
    onOpenAssignModal: (file: AudioFile) => void;
    isLoggedIn: boolean;
    onOpenAdminSpotPanel: () => void;
    onOpenGerenciarPecasModal: () => void;
    onOpenGerenciarMarcasModal: () => void;
    onOpenGerenciarDescontosModal: () => void;
    onOpenAnaliseInternaModal: () => void;
    onOpenStatsModal: () => void;
    customLabels: CustomLabels;
    onUpdateLabels: (newLabels: CustomLabels) => void;
    currentTheme: AppTheme;
    onChangeTheme: (newTheme: AppTheme) => void;
}

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

const AdminSection: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <div className="border-t border-white/10 pt-6">
        <p className="text-md font-semibold text-white/80 mb-3">{title}</p>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const LabelEditor: React.FC<{
    label: string;
    value: string;
    onSave: (newValue: string) => void;
}> = ({ label, value, onSave }) => {
    const [currentValue, setCurrentValue] = useState(value);
    
    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    const handleSave = () => {
        if (currentValue.trim()) {
            onSave(currentValue.trim());
        } else {
            setCurrentValue(value); // Reset if empty
        }
    };
    
    return (
        <div className="flex items-center gap-2">
            <label className="text-sm text-white/70 flex-1">{label}</label>
            <input 
                type="text"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                className="bg-white/5 border border-white/10 rounded-md px-2 py-1 text-sm w-48 focus:ring-1 focus:ring-green-400 focus:outline-none"
            />
        </div>
    );
};

export const UploadModal: React.FC<UploadModalProps> = ({ 
    onClose, onUpload, audioFiles, onPlay, isPlaying, nowPlayingFileId, onOpenAssignModal, isLoggedIn, onOpenAdminSpotPanel,
    onOpenGerenciarPecasModal, onOpenGerenciarMarcasModal, onOpenGerenciarDescontosModal, onOpenAnaliseInternaModal, onOpenStatsModal,
    customLabels, onUpdateLabels, currentTheme, onChangeTheme
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSuccessMessage(null);
        setErrorMessage(null);
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            setErrorMessage('Por favor, selecione um arquivo para enviar.');
            return;
        }

        onUpload(selectedFile);
        setSuccessMessage(`"${selectedFile.name}" enviado com sucesso!`);
        setSelectedFile(null);
        const fileInput = document.getElementById('audio-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';

        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const ManagementButton: React.FC<{label: string, icon: React.ReactNode, onClick: () => void}> = ({label, icon, onClick}) => (
        <button 
            onClick={onClick}
            className="flex flex-col items-center justify-center gap-2 text-center p-3 rounded-lg bg-blue-900/60 backdrop-blur-sm border border-blue-400/50 text-blue-300 hover:bg-blue-900/80 hover:border-blue-300 transition-all duration-200"
        >
            {icon}
            <span className="text-sm font-semibold">{label}</span>
        </button>
    );

    const themes: {id: AppTheme, label: string}[] = [
        { id: 'theme-padrao', label: 'Padrão Escuro' },
        { id: 'theme-verao', label: 'Verão' },
        { id: 'theme-inverno', label: 'Inverno' },
        { id: 'theme-natal', label: 'Natal' },
        { id: 'theme-especial', label: 'Campanha Especial' },
    ];

    return (
        <div
            className={cn("fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out", isVisible ? 'opacity-100 bg-black/60 backdrop-blur-sm' : 'opacity-0 pointer-events-none')}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={cn('relative w-full max-w-xl bg-slate-900/80 backdrop-blur-xl rounded-xl border border-[var(--neon-glow-primary)]/30', 'shadow-2xl shadow-[var(--neon-shadow-primary)] ring-2 ring-[var(--neon-glow-primary)]', 'transition-all duration-300 ease-in-out', isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95')}
            >
                <header className="flex items-center justify-between p-4 border-b border-white/10">
                    <h2 className="text-lg font-semibold text-white/90">Painel de Administração</h2>
                    <button onClick={handleClose} className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors" aria-label="Fechar">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </header>
                
                <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
                    {isLoggedIn && (
                        <div className="grid grid-cols-3 gap-4">
                            <button onClick={onOpenAdminSpotPanel} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                                <CogIcon className="w-5 h-5"/>
                                <span>Gerenciar Spots</span>
                            </button>
                            <button onClick={onOpenAnaliseInternaModal} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                                <ChartPieIcon className="w-5 h-5"/>
                                <span>Análise Interna</span>
                            </button>
                            <button onClick={onOpenStatsModal} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                                <ChartBarIcon className="w-5 h-5"/>
                                <span>Ver Estatísticas</span>
                            </button>
                        </div>
                    )}

                    <AdminSection title="Gerenciamento da Loja">
                        <div className="grid grid-cols-3 gap-3">
                            <ManagementButton label="Peças" icon={<ShoppingBagIcon className="w-6 h-6"/>} onClick={onOpenGerenciarPecasModal} />
                            <ManagementButton label="Marcas" icon={<BuildingStorefrontIcon className="w-6 h-6"/>} onClick={onOpenGerenciarMarcasModal} />
                            <ManagementButton label="Descontos" icon={<TagIcon className="w-6 h-6"/>} onClick={onOpenGerenciarDescontosModal} />
                        </div>
                    </AdminSection>

                    <AdminSection title="Personalizar Nomes dos Botões">
                        <LabelEditor label="Analisar Anúncios" value={customLabels.analisarAnuncios} onSave={(val) => onUpdateLabels({...customLabels, analisarAnuncios: val})} />
                        <LabelEditor label="Converse Comigo!" value={customLabels.converseComigo} onSave={(val) => onUpdateLabels({...customLabels, converseComigo: val})} />
                        <LabelEditor label="Falar com Analista" value={customLabels.falarComAnalista} onSave={(val) => onUpdateLabels({...customLabels, falarComAnalista: val})} />
                        <LabelEditor label="Spot 1" value={customLabels.spot1} onSave={(val) => onUpdateLabels({...customLabels, spot1: val})} />
                        <LabelEditor label="Spot 2" value={customLabels.spot2} onSave={(val) => onUpdateLabels({...customLabels, spot2: val})} />
                        <LabelEditor label="Spot 3" value={customLabels.spot3} onSave={(val) => onUpdateLabels({...customLabels, spot3: val})} />
                    </AdminSection>
                    
                    <AdminSection title="Personalizar Tema">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {themes.map(theme => (
                                <button key={theme.id} onClick={() => onChangeTheme(theme.id)}
                                    className={cn('p-2 rounded-md text-sm font-semibold border-2 transition-colors',
                                        currentTheme === theme.id ? 'border-green-400 bg-green-500/20 text-white' : 'border-transparent bg-white/5 text-white/70 hover:bg-white/10'
                                    )}
                                >{theme.label}</button>
                            ))}
                        </div>
                    </AdminSection>

                    <AdminSection title="Enviar Áudio para Playlists">
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label htmlFor="audio-upload" className="block text-sm font-medium text-white/70 mb-2">Arquivo de áudio (.mp3, .wav)</label>
                                <input id="audio-upload" type="file" accept=".mp3,.wav" onChange={handleFileChange}
                                    className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-900/50 file:text-green-300 hover:file:bg-green-800/60"/>
                            </div>
                            <button type="submit" disabled={!selectedFile} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800/50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors">
                                Fazer Upload
                            </button>
                            {successMessage && (<div className="bg-green-500/10 border border-green-500/30 text-green-300 text-sm p-3 rounded-lg flex items-center gap-2"><CheckCircleIcon className="w-5 h-5 flex-shrink-0" /><span>{successMessage}</span></div>)}
                            {errorMessage && (<div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm p-3 rounded-lg flex items-center gap-2"><ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" /><span>{errorMessage}</span></div>)}
                        </form>
                    </AdminSection>
                    
                    <AdminSection title="Áudios das Playlists">
                        <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {audioFiles.map((file) => (
                                <li key={file.id} className="flex items-center justify-between bg-white/5 p-2 rounded-md text-sm">
                                    <button onClick={() => onOpenAssignModal(file)} className="flex items-center gap-2 truncate text-white/80 group flex-1 min-w-0">
                                        <MusicNoteIcon className="w-4 h-4 text-purple-300 flex-shrink-0" />
                                        <span className="truncate group-hover:text-white">{file.name}</span>
                                        <PencilSquareIcon className="w-4 h-4 text-white/50 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"/>
                                    </button>
                                    <button onClick={() => onPlay(file)} className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors ml-2 flex-shrink-0">
                                        {isPlaying && nowPlayingFileId === file.id ? (
                                            <PauseIcon className="w-5 h-5 text-green-400" />
                                        ) : (
                                            <PlayIcon className="w-5 h-5" />
                                        )}
                                    </button>
                                </li>
                            ))}
                            {audioFiles.length === 0 && (
                                <li className="text-center text-xs text-white/50 py-4">Nenhum áudio enviado.</li>
                            )}
                        </ul>
                    </AdminSection>
                </div>
            </div>
        </div>
    );
};