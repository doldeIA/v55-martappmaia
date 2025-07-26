
import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon, MusicNoteIcon, PlayIcon, PauseIcon, TrashIcon, PencilSquareIcon, ArrowLeftIcon } from './Icons';
import { AudioFile, SpotAudioMap } from '../types';

interface AdminSpotPanelProps {
    onClose: () => void;
    spotAudioMap: SpotAudioMap;
    onUpdateSpotAudio: (spotKey: keyof SpotAudioMap, file: File) => void;
    onRemoveSpotAudio: (spotKey: keyof SpotAudioMap) => void;
    onPreviewSpotAudio: (file: AudioFile) => void;
    isPlaying: boolean;
    nowPlayingFileId: string | null;
}

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

export const AdminSpotPanel: React.FC<AdminSpotPanelProps> = ({ onClose, spotAudioMap, onUpdateSpotAudio, onRemoveSpotAudio, onPreviewSpotAudio, isPlaying, nowPlayingFileId }) => {
    const [isVisible, setIsVisible] = useState(false);
    const fileInputRefs = {
        'Spot 1': useRef<HTMLInputElement>(null),
        'Spot 2': useRef<HTMLInputElement>(null),
        'Spot 3': useRef<HTMLInputElement>(null),
    };

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, spotKey: keyof SpotAudioMap) => {
        if (e.target.files && e.target.files.length > 0) {
            onUpdateSpotAudio(spotKey, e.target.files[0]);
        }
    };
    
    const triggerFileInput = (spotKey: keyof SpotAudioMap) => {
        fileInputRefs[spotKey].current?.click();
    };

    return (
        <div
            className={cn("fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out", isVisible ? 'opacity-100 bg-black/60 backdrop-blur-sm' : 'opacity-0 pointer-events-none')}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={cn('relative w-full max-w-xl bg-slate-900/80 backdrop-blur-xl rounded-xl border border-blue-400/30', 'shadow-2xl shadow-blue-500/20 ring-2 ring-blue-400', 'transition-all duration-300 ease-in-out', isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95')}
            >
                <header className="flex items-center justify-between p-4 border-b border-white/10">
                     <button onClick={handleClose} className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors" aria-label="Voltar">
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-semibold text-white/90">Gerenciar Áudios dos Spots</h2>
                    <div className="w-5"></div>
                </header>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {(Object.keys(spotAudioMap) as Array<keyof SpotAudioMap>).map(spotKey => {
                        const audioFile = spotAudioMap[spotKey];
                        const isThisSpotPlaying = isPlaying && nowPlayingFileId === audioFile?.id;
                        return (
                            <div key={spotKey} className="bg-white/5 p-4 rounded-lg">
                                <h3 className="font-bold text-lg text-white mb-3">{spotKey}</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between bg-black/20 p-3 rounded-md">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <MusicNoteIcon className="w-4 h-4 text-blue-300 flex-shrink-0" />
                                            <span className="text-sm text-white/80 truncate">
                                                {audioFile?.name ?? 'Nenhum áudio atribuído'}
                                            </span>
                                        </div>
                                        {audioFile && (
                                            <button onClick={() => onPreviewSpotAudio(audioFile)} className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors ml-2 flex-shrink-0">
                                                {isThisSpotPlaying ? <PauseIcon className="w-5 h-5 text-blue-300"/> : <PlayIcon className="w-5 h-5"/>}
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="file"
                                            ref={fileInputRefs[spotKey]}
                                            onChange={(e) => handleFileChange(e, spotKey)}
                                            accept=".mp3,.wav"
                                            className="hidden"
                                        />
                                        <button onClick={() => triggerFileInput(spotKey)} className="flex items-center justify-center gap-2 w-full bg-blue-600/80 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-colors text-sm">
                                            <PencilSquareIcon className="w-4 h-4" />
                                            <span>Substituir</span>
                                        </button>
                                        <button 
                                            onClick={() => onRemoveSpotAudio(spotKey)}
                                            disabled={!audioFile}
                                            className="flex items-center justify-center gap-2 w-full bg-red-800/80 hover:bg-red-700 disabled:bg-red-900/50 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition-colors text-sm"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                            <span>Remover</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};