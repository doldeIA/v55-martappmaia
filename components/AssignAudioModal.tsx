
import React, { useState, useEffect } from 'react';
import { XMarkIcon, MusicNoteIcon, CheckCircleIcon } from './Icons';
import { AudioFile, AudioMap } from '../types';

interface AssignAudioModalProps {
    onClose: () => void;
    onAssign: (file: AudioFile, buttonKeys: string[]) => void;
    file: AudioFile;
    audioMap: AudioMap;
}

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');
const AMBIENT_BUTTONS = ['Manhã', 'Tarde', 'Noite', 'IA'];

export const AssignAudioModal: React.FC<AssignAudioModalProps> = ({ onClose, onAssign, file, audioMap }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [selectedButtons, setSelectedButtons] = useState<string[]>([]);

    useEffect(() => {
        setIsVisible(true);
        // Pre-select buttons where this audio is already assigned
        const currentAssignments = AMBIENT_BUTTONS.filter(key => 
            audioMap[key]?.some(assignedFile => assignedFile.id === file.id)
        );
        setSelectedButtons(currentAssignments);

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [file, audioMap]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const handleCheckboxChange = (buttonKey: string) => {
        setSelectedButtons(prev => 
            prev.includes(buttonKey) 
                ? prev.filter(b => b !== buttonKey)
                : [...prev, buttonKey]
        );
    };

    const handleSubmit = () => {
        onAssign(file, selectedButtons);
        handleClose();
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
                className={cn('relative w-full max-w-md bg-slate-900/80 backdrop-blur-xl rounded-xl border border-purple-400/30', 'shadow-2xl shadow-purple-500/20 ring-2 ring-purple-400', 'transition-all duration-300 ease-in-out', isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95')}
            >
                <header className="flex items-center justify-between p-4 border-b border-white/10">
                    <h2 className="text-lg font-semibold text-white/90">Escolher botão para este áudio</h2>
                    <button onClick={handleClose} className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors" aria-label="Fechar">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </header>
                
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg">
                        <MusicNoteIcon className="w-5 h-5 text-purple-300 flex-shrink-0" />
                        <p className="font-medium text-white/80 truncate">{file.name}</p>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-white/70">Atribuir aos botões:</p>
                        <div className="grid grid-cols-2 gap-2">
                            {AMBIENT_BUTTONS.map(key => {
                                const isChecked = selectedButtons.includes(key);
                                return (
                                <label key={key} className={cn(
                                    "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border-2",
                                    isChecked ? 'bg-purple-500/20 border-purple-400' : 'bg-white/5 border-transparent hover:border-white/20'
                                )}>
                                    <span className="font-semibold text-white/90">{key}</span>
                                    <div className={cn(
                                        "w-5 h-5 rounded-md flex items-center justify-center border-2",
                                        isChecked ? 'bg-purple-500 border-purple-400' : 'border-white/30'
                                    )}>
                                        {isChecked && <CheckCircleIcon className="w-4 h-4 text-white" />}
                                    </div>
                                    <input type="checkbox" checked={isChecked} onChange={() => handleCheckboxChange(key)} className="sr-only"/>
                                </label>
                            )})}
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg transition-colors mt-4"
                    >
                        Vincular
                    </button>
                </div>
            </div>
        </div>
    );
};