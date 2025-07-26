
import React, { useState, useEffect } from 'react';
import { XMarkIcon, SpeakerWaveIcon, PlayIcon, StopIcon } from './Icons';
import { AudioFile } from '../types';

interface SpotModalProps {
    spotKey: string;
    title: string;
    audioFile: AudioFile | null;
    onPlay: () => void;
    onClose: () => void;
    onStop: () => void;
    onVolumeChange: (newVolume: number) => void;
    volume: number;
    isPlaying: boolean;
    nowPlaying: { fileId: string | null; buttonKey: string | null };
}

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

export const SpotModal: React.FC<SpotModalProps> = ({ spotKey, title, audioFile, onPlay, onClose, onStop, onVolumeChange, volume, isPlaying, nowPlaying }) => {
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

    const isThisSpotPlaying = isPlaying && nowPlaying.buttonKey === spotKey;

    return (
        <div
            className={cn("fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out", isVisible ? 'opacity-100 bg-black/60 backdrop-blur-sm' : 'opacity-0 pointer-events-none')}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={cn('relative w-full max-w-sm bg-slate-900/80 backdrop-blur-xl rounded-xl border border-blue-400/30', 'shadow-2xl shadow-blue-500/20 ring-2 ring-blue-400', 'transition-all duration-300 ease-in-out', isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95')}
            >
                <header className="flex items-center justify-between p-4 border-b border-white/10">
                    <h2 className="text-lg font-semibold text-white/90">{title}</h2>
                    <button onClick={handleClose} className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors" aria-label="Fechar">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </header>

                <div className="p-8 space-y-6">
                    {audioFile ? (
                        <>
                            <div className="flex items-center justify-center gap-3 bg-white/5 p-3 rounded-lg text-center">
                                <SpeakerWaveIcon className="w-5 h-5 text-blue-300 flex-shrink-0" />
                                <p className="font-medium text-white/90 truncate">{audioFile.name}</p>
                            </div>
                            
                            <div className="space-y-4">
                                <button
                                    onClick={onPlay}
                                    disabled={!audioFile}
                                    className={cn(
                                        "w-full text-white font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2",
                                        isThisSpotPlaying 
                                            ? 'bg-blue-500 animate-pulse' 
                                            : 'bg-blue-600 hover:bg-blue-700'
                                    )}
                                >
                                    <PlayIcon className="w-5 h-5" />
                                    <span>{isThisSpotPlaying ? "Tocando..." : "Reproduzir"}</span>
                                </button>

                                <div className="flex items-center gap-4">
                                     <button 
                                        onClick={onStop}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                    >
                                        <StopIcon className="w-5 h-5 text-red-400" />
                                    </button>
                                    <div className="flex-1 flex items-center gap-2">
                                        <label htmlFor="spot-volume" className="text-xs font-semibold text-white/60">Volume</label>
                                        <input
                                            id="spot-volume"
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={volume}
                                            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-400"
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p className="text-white/60 py-8 text-center">
                            Nenhum áudio atribuído a este Spot.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};