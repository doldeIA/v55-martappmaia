
import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon, SparkleIcon, UserIcon } from './Icons';
import { ChatMessage } from '../types';

interface AiChatModalProps {
    onClose: () => void;
    messages: ChatMessage[];
    onSend: (message: string) => void;
    isLoading: boolean;
    typingMessage: string | null;
    onTypingComplete: (completedMessage: string) => void;
}

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

const TypingMessage: React.FC<{
    message: string;
    onComplete: (completedMessage: string) => void;
}> = ({ message, onComplete }) => {
    const [displayedText, setDisplayedText] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setDisplayedText('');
        if (message) {
            let i = 0;
            const intervalId = setInterval(() => {
                setDisplayedText(message.slice(0, i + 1));
                i++;
                if (i >= message.length) {
                    clearInterval(intervalId);
                    onComplete(message);
                }
            }, 40);
            return () => clearInterval(intervalId);
        }
    }, [message, onComplete]);

    useEffect(() => {
        containerRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [displayedText]);

    return (
        <div ref={containerRef} className="flex items-start gap-3 justify-start">
            <div className="w-6 h-6 mt-1 rounded-full bg-purple-500 flex-shrink-0 flex items-center justify-center">
                <SparkleIcon className="w-4 h-4 text-white" />
            </div>
            <div className="max-w-xs md:max-w-md px-3 py-2 rounded-lg text-white/90 bg-white/10 rounded-bl-none">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {displayedText}
                    <span className="inline-block w-px h-4 bg-white/90 ml-1 animate-pulse" />
                </p>
            </div>
        </div>
    );
};


export const AiChatModal: React.FC<AiChatModalProps> = ({
    onClose,
    messages,
    onSend,
    isLoading,
    typingMessage,
    onTypingComplete,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [input, setInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsVisible(true);
        
        // On mount, if chat history is empty, trigger a welcome message.
        if (messages.length === 0 && !isLoading && !typingMessage) {
            onSend("Olá"); // Trigger a predefined welcome flow
        }
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const handleSend = () => {
        if (!input.trim() || isLoading || typingMessage) return;
        onSend(input);
        setInput('');
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
                className={cn('relative flex flex-col w-full max-w-lg h-[80vh] bg-slate-900/80 backdrop-blur-xl rounded-xl border border-white/20', 'shadow-2xl shadow-purple-500/10', 'transition-all duration-300 ease-in-out', isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95')}
            >
                <header className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                           <SparkleIcon className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-lg font-semibold text-white/90">Marta Maia</h2>
                    </div>
                    <button onClick={handleClose} className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors" aria-label="Fechar">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </header>

                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={cn("flex items-start gap-3", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                           {msg.role === 'model' && <div className="w-6 h-6 mt-1 rounded-full bg-purple-500 flex-shrink-0 flex items-center justify-center"><SparkleIcon className="w-4 h-4 text-white" /></div>}
                           <div className={cn(
                               "max-w-xs md:max-w-md px-3 py-2 rounded-lg text-white/90",
                               msg.role === 'user' ? 'bg-blue-600 rounded-br-none' : 'bg-white/10 rounded-bl-none'
                           )}>
                               <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                           </div>
                           {msg.role === 'user' && <div className="w-6 h-6 mt-1 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center"><UserIcon className="w-4 h-4 text-white" /></div>}
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-start gap-3 justify-start">
                             <div className="w-6 h-6 mt-1 rounded-full bg-purple-500 flex-shrink-0 flex items-center justify-center"><SparkleIcon className="w-4 h-4 text-white" /></div>
                             <div className="max-w-xs px-3 py-2 rounded-lg bg-white/10 rounded-bl-none">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                                    <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                    <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                </div>
                             </div>
                         </div>
                    )}
                    {typingMessage && (
                        <TypingMessage message={typingMessage} onComplete={onTypingComplete} />
                    )}
                    <div ref={chatEndRef} />
                </div>

                <div className="p-4 border-t border-white/10 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Pergunte sobre promoções, estoque..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-purple-400"
                            disabled={isLoading || !!typingMessage}
                        />
                        <button onClick={handleSend} disabled={isLoading || !!typingMessage || !input.trim()} className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800/50 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-lg transition-colors">
                            Enviar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
