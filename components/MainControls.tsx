
import React, { useState } from 'react';
import { 
    BoxIcon, ChartPieIcon, ChevronRightIcon, WhatsAppIcon, ClipboardDocumentListIcon, SunIcon, MoonIcon, StopIcon, ChatBubbleBottomCenterTextIcon, SunsetIcon, WandSparklesIcon
} from './Icons';
import { InventoryModal } from './InventoryModal';
import { AnalyticsModal } from './AnalyticsModal';
import { SpotModal } from './SpotModal';
import { SpotAudioMap, CustomLabels } from '../types';

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

const WhatsAppButton: React.FC<{label: string}> = ({label}) => {
    const [isGlowing, setIsGlowing] = useState(false);
    const href = "https://wa.me/5511912345678";

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isGlowing) return;
        setIsGlowing(true);
        setTimeout(() => {
            window.open(href, '_blank', 'noopener,noreferrer');
            setIsGlowing(false);
        }, 1000);
    };

    return (
        <a href={href} onClick={handleClick} className="group" aria-label="Falar com Analista de Estoque">
            <div className={cn(
                "relative px-6 py-2 rounded-2xl flex items-center justify-center text-white font-semibold transition-all duration-300 transform group-hover:scale-105 group-hover:brightness-110 shadow-lg border", 
                "bg-gradient-to-br from-[var(--button-primary-from)] to-[var(--button-primary-to)] border-[var(--button-primary-from)] shadow-[var(--neon-shadow-primary)]",
                isGlowing ? 'animate-whatsapp-glow-once' : 'animate-whatsapp-neon'
            )}>
                <WhatsAppIcon className="w-6 h-6 mr-3" />
                <span className="text-sm leading-tight">{label}</span>
            </div>
        </a>
    );
};

const SecondaryControlButton: React.FC<{ label: string; icon: React.ReactNode; onClick: () => void; }> = ({ label, icon, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors group p-2">
        <div className="w-14 h-14 bg-slate-900/60 rounded-2xl flex items-center justify-center border border-white/10 transition-all duration-300 transform group-hover:scale-105 group-hover:border-white/20 group-hover:shadow-lg group-hover:shadow-[var(--neon-shadow-secondary)] group-hover:brightness-110">
            {icon}
        </div>
        <span className="text-sm font-semibold">{label}</span>
    </button>
);

interface MainControlsProps {
    // Ambient Channel
    onAmbientPlayRequest: (buttonKey: string) => void;
    onAmbientStopAudioRequest: () => void;
    onAmbientVolumeChange: (newVolume: number) => void;
    ambientVolume: number;
    ambientNowPlaying: { fileId: string | null; buttonKey: string | null };
    ambientIsPlaying: boolean;
    
    // Spot Channel
    onSpotPlay: (spotKey: keyof SpotAudioMap) => void;
    spotAudioMap: SpotAudioMap;
    spotIsPlaying: boolean;
    spotNowPlaying: { fileId: string | null; buttonKey: string | null };
    onSpotStopAudio: () => void;
    onSpotVolumeChange: (newVolume: number) => void;
    spotVolume: number;

    // Modals
    onOpenAiChat: () => void;
    onOpenAnunciosModal: () => void;
    
    // Customization
    customLabels: CustomLabels;

    // Easter Egg
    onFooterClick: () => void;
}

export const MainControls: React.FC<MainControlsProps> = ({ 
    onAmbientPlayRequest,
    onAmbientStopAudioRequest,
    onAmbientVolumeChange,
    ambientVolume,
    ambientNowPlaying,
    ambientIsPlaying,
    onSpotPlay,
    spotAudioMap,
    spotIsPlaying,
    spotNowPlaying,
    onSpotStopAudio,
    onSpotVolumeChange,
    spotVolume,
    onOpenAiChat,
    onOpenAnunciosModal,
    customLabels,
    onFooterClick
}) => {
    const [modal, setModal] = useState<'inv' | 'analytics' | null>(null);
    const [activeSpotModal, setActiveSpotModal] = useState<keyof SpotAudioMap | null>(null);
    
    const ambiences = [
        { id: 'Manhã', label: 'Manhã', icon: SunIcon },
        { id: 'Tarde', label: 'Tarde', icon: SunsetIcon },
        { id: 'Noite', label: 'Noite', icon: MoonIcon },
        { id: 'IA', label: 'IA', icon: WandSparklesIcon },
    ];
    
    const spots: (keyof SpotAudioMap)[] = ['Spot 1', 'Spot 2', 'Spot 3'];

    return (
        <div className="w-full h-full flex flex-col items-center">
            <div className="w-full max-w-md mx-auto flex flex-col flex-1 overflow-y-auto pb-48">
                <div className="pt-8 text-center px-4 space-y-4">
                    <div className="grid grid-cols-4 gap-2">
                        {ambiences.map((amb) => (
                            <button
                                key={amb.id}
                                onClick={() => onAmbientPlayRequest(amb.id)}
                                className={cn(
                                    'flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl transition-all duration-200 border-2',
                                    ambientNowPlaying.buttonKey === amb.id
                                        ? 'bg-white/10 border-white/20 text-white animate-neon-pulse-white'
                                        : 'bg-transparent border-transparent text-white/60 hover:bg-white/5 hover:text-white'
                                )}
                            >
                                <amb.icon className="w-6 h-6" />
                                <span className="text-xs font-semibold tracking-tight">{amb.label}</span>
                            </button>
                        ))}
                    </div>
                    
                    <div className="bg-slate-900/50 border border-white/10 rounded-xl p-3 flex items-center justify-between gap-4">
                        <button onClick={onAmbientStopAudioRequest} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                            <StopIcon className="w-5 h-5 text-red-400"/>
                        </button>
                        <div className="flex-1 flex items-center gap-2">
                            <label htmlFor="volume" className="text-xs font-semibold text-white/60">Volume</label>
                            <input
                                id="volume"
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={ambientVolume}
                                onChange={(e) => onAmbientVolumeChange(parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                style={{ accentColor: 'var(--neon-glow-primary)'}}
                            />
                        </div>
                    </div>
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center py-4 mt-2">
                    <div className="w-full max-w-sm mx-auto space-y-4">
                        <button
                            onClick={onOpenAiChat}
                            className="w-full p-2 rounded-md font-semibold transition opacity-80 text-white hover:opacity-100 bg-white/10 backdrop-blur-md hover:bg-white/20 ring-2 ring-white/30 soft-glow-anim flex items-center justify-center gap-2"
                            style={{"--glow-color": "rgba(255, 255, 255, 0.3)"} as React.CSSProperties}
                        >
                            <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />
                            <span>{customLabels.converseComigo}</span>
                        </button>
                        <button
                            onClick={onOpenAnunciosModal}
                            className="w-full flex items-center justify-between bg-slate-900/60 border border-white/10 text-white font-semibold px-4 py-3 rounded-xl hover:bg-slate-800/60 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-400"
                        >
                            <span className="flex items-center space-x-3">
                                <ClipboardDocumentListIcon className="w-5 h-5 text-cyan-300"/>
                                <span>{customLabels.analisarAnuncios}</span>
                            </span>
                            <ChevronRightIcon className={`w-5 h-5 transition-transform duration-300`} />
                        </button>
                    </div>
                    
                    <div className="w-full max-w-sm mx-auto mt-6 flex justify-center gap-x-2">
                        {spots.map(spotKey => (
                            <button 
                                key={spotKey}
                                onClick={() => setActiveSpotModal(spotKey)}
                                className="bg-slate-800/50 border border-white/10 text-white/80 font-semibold py-2.5 px-6 rounded-lg hover:bg-slate-700/60 hover:text-white transition-colors duration-200"
                            >
                                {customLabels[spotKey.toLowerCase().replace(' ', '') as keyof Omit<CustomLabels, 'falarComAnalista'|'analisarAnuncios'|'converseComigo'>]}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="fixed bottom-0 left-0 right-0 z-20 pointer-events-none flex flex-col items-center">
                <div className="w-full max-w-md px-4 pt-4 pointer-events-auto">
                    <div className="flex justify-around items-baseline bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-2xl shadow-black rounded-3xl p-3">
                        <SecondaryControlButton label="Estoque" icon={<BoxIcon className="w-7 h-7" />} onClick={() => setModal('inv')} />
                        <WhatsAppButton label={customLabels.falarComAnalista} />
                        <SecondaryControlButton label="Análise" icon={<ChartPieIcon className="w-7 h-7" />} onClick={() => setModal('analytics')} />
                    </div>
                </div>
                <p 
                    className="text-xs text-white/40 text-center pt-2 pb-3 cursor-pointer pointer-events-auto"
                    onClick={onFooterClick}
                >
                    Criado Do Outro Lado do Espelho 2025 º
                </p>
            </div>

            {modal === 'inv' && <InventoryModal onClose={() => setModal(null)} />}
            {modal === 'analytics' && <AnalyticsModal onClose={() => setModal(null)} />}
            {activeSpotModal && (
                <SpotModal 
                    spotKey={activeSpotModal}
                    title={customLabels[activeSpotModal.toLowerCase().replace(' ', '') as keyof Omit<CustomLabels, 'falarComAnalista'|'analisarAnuncios'|'converseComigo'>]}
                    audioFile={spotAudioMap[activeSpotModal]}
                    onPlay={() => onSpotPlay(activeSpotModal)}
                    onClose={() => setActiveSpotModal(null)}
                    onStop={onSpotStopAudio}
                    onVolumeChange={onSpotVolumeChange}
                    volume={spotVolume}
                    isPlaying={spotIsPlaying}
                    nowPlaying={spotNowPlaying}
                />
            )}
        </div>
    );
};
