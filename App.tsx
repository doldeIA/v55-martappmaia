
import React, { useEffect, useState, useRef } from 'react';
import { MainControls } from './components/MainControls';
import { LoginModal } from './components/LoginModal';
import { UploadModal } from './components/UploadModal';
import { AssignAudioModal } from './components/AssignAudioModal';
import { AdminSpotPanel } from './components/AdminSpotPanel';
import { StopConfirmModal } from './components/StopConfirmModal';
import { AiChatModal } from './components/AiChatModal';
import { AnunciosModal } from './components/AnunciosModal';
import { GerenciarPecasModal } from './components/GerenciarPecasModal';
import { GerenciarMarcasModal } from './components/GerenciarMarcasModal';
import { GerenciarDescontosModal } from './components/GerenciarDescontosModal';
import { AnaliseInternaModal } from './components/AnaliseInternaModal';
import { StatsModal } from './components/StatsModal';
import { DigitalRain } from './components/DigitalRain';
import { AudioFile, AudioMap, SpotAudioMap, Product, ChatMessage, CustomLabels, AppTheme, AppAnalytics, InteractionType, InteractionEvent } from './types';
import { initialInventory } from './data/inventoryData';
import usePersistentState from './hooks/usePersistentState';
import { generateSimpleText } from './services/geminiService';
import { filesDB } from './services/dbService';

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

const SparkleBackground: React.FC = () => {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    const generateSparkles = () => {
      const newSparkles: Sparkle[] = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 5,
        duration: Math.random() * 3 + 2,
      }));
      setSparkles(newSparkles);
    };
    generateSparkles();
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
      {sparkles.map(s => (
        <div
          key={s.id}
          className="sparkle"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = usePersistentState('isLoggedIn', false);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [assignModalFile, setAssignModalFile] = useState<AudioFile | null>(null);
  const [showAdminSpotPanel, setShowAdminSpotPanel] = useState(false);
  
  const [showStopConfirmModal, setShowStopConfirmModal] = useState(false);
  const [showAiChatModal, setShowAiChatModal] = useState(false);
  const [showAnunciosModal, setShowAnunciosModal] = useState(false);
  const [showGerenciarPecasModal, setShowGerenciarPecasModal] = useState(false);
  const [showGerenciarMarcasModal, setShowGerenciarMarcasModal] = useState(false);
  const [showGerenciarDescontosModal, setShowGerenciarDescontosModal] = useState(false);
  const [showAnaliseInternaModal, setShowAnaliseInternaModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showDigitalRain, setShowDigitalRain] = useState(false);


  // --- Persistent State ---
  const [theme, setTheme] = usePersistentState<AppTheme>('appTheme', 'theme-padrao');
  const [customLabels, setCustomLabels] = usePersistentState<CustomLabels>('customLabels', {
    analisarAnuncios: 'Analisar Anúncios',
    converseComigo: 'Converse Comigo!',
    falarComAnalista: 'Falar com Analista',
    spot1: 'SPOT 1',
    spot2: 'SPOT 2',
    spot3: 'SPOT 3',
  });
  const [chatMessages, setChatMessages] = usePersistentState<ChatMessage[]>('chatHistory', []);
  const [audioFiles, setAudioFiles] = usePersistentState<AudioFile[]>('audioFiles', []);
  const [audioMap, setAudioMap] = usePersistentState<AudioMap>('audioMap', {});
  const [spotAudioMap, setSpotAudioMap] = usePersistentState<SpotAudioMap>('spotAudioMap', {
    'Spot 1': null,
    'Spot 2': null,
    'Spot 3': null,
  });
  const [discountOptions, setDiscountOptions] = usePersistentState<number[]>('discountOptions', [10, 50, 70]);
  const [brands, setBrands] = usePersistentState<string[]>('brands', Array.from(new Set(initialInventory.map(p => p.brand))));
  const [products, setProducts] = usePersistentState<Product[]>('products', initialInventory.map(p => ({...p, isManaged: true})));
  const [analytics, setAnalytics] = usePersistentState<AppAnalytics>('appAnalytics', {
    interactions: [],
  });
  // --- End Persistent State ---

  // --- Local UI State ---
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatTypingMessage, setChatTypingMessage] = useState<string | null>(null);
  const [transientUrls, setTransientUrls] = useState<Record<string, string>>({});
  
  // --- Dual Audio Channel Setup ---
  const ambientAudioRef = useRef<HTMLAudioElement>(null);
  const [ambientIsPlaying, setAmbientIsPlaying] = useState(false);
  const [ambientNowPlaying, setAmbientNowPlaying] = useState<{ fileId: string | null; buttonKey: string | null }>({ fileId: null, buttonKey: null });
  const [ambientVolume, setAmbientVolume] = useState(1);
  const fadeOutInterval = useRef<number | null>(null);

  const spotAudioRef = useRef<HTMLAudioElement>(null);
  const [spotIsPlaying, setSpotIsPlaying] = useState(false);
  const [spotNowPlaying, setSpotNowPlaying] = useState<{ fileId: string | null; buttonKey: string | null }>({ fileId: null, buttonKey: null });
  const [spotVolume, setSpotVolume] = useState(1);
  // --- End Dual Audio Channel Setup ---

  // --- Easter Egg ---
  const footerClickCount = useRef(0);
  const footerClickTimer = useRef<number | null>(null);

  const handleFooterClick = () => {
    footerClickCount.current += 1;

    if (footerClickTimer.current) {
        clearTimeout(footerClickTimer.current);
    }

    footerClickTimer.current = window.setTimeout(() => {
        footerClickCount.current = 0;
    }, 1500); // Reset count after 1.5 seconds of inactivity

    if (footerClickCount.current >= 5) {
        setShowDigitalRain(true);
        footerClickCount.current = 0;
        if (footerClickTimer.current) {
            clearTimeout(footerClickTimer.current);
        }
    }
  };
  // --- End Easter Egg ---


  // Apply theme to body
  useEffect(() => {
    document.body.className = `text-white ${theme}`;
  }, [theme]);

  // Clean up object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      Object.values(transientUrls).forEach(URL.revokeObjectURL);
    };
  }, []); // Empty dependency array means this runs only on mount and unmount

  // --- Handlers ---
  const trackInteraction = (type: InteractionType, key: string | number) => {
    const newInteraction: InteractionEvent = {
        type,
        key,
        timestamp: Date.now(),
    };
    setAnalytics(prev => ({
        ...prev,
        interactions: [...prev.interactions, newInteraction],
    }));
  };
  
  const getAudioUrl = async (fileId: string): Promise<string> => {
    if (transientUrls[fileId]) {
      return transientUrls[fileId];
    }
    try {
      const blob = await filesDB.get<Blob>(fileId);
      if (blob) {
        const url = URL.createObjectURL(blob);
        setTransientUrls(prev => ({ ...prev, [fileId]: url }));
        return url;
      }
    } catch (error) {
      console.error(`Falha ao obter o arquivo de áudio ${fileId} do DB`, error);
    }
    return ''; // return empty string on failure
  };

  const handleAddDiscountOption = (newDiscount: number) => {
    if (newDiscount > 0 && newDiscount <= 100 && !discountOptions.includes(newDiscount)) {
        setDiscountOptions(prev => [...prev, newDiscount].sort((a, b) => a - b));
    }
  };

  const handleRemoveDiscountOption = (discountToRemove: number) => {
    setDiscountOptions(prev => prev.filter(d => d !== discountToRemove));
  };
  
  const handleAddBrand = (newBrand: string) => {
    if (newBrand && !brands.includes(newBrand)) {
        setBrands(prev => [...prev, newBrand].sort());
    }
  };
  
  const handleRemoveBrand = (brandToRemove: string) => {
    setBrands(prev => prev.filter(b => b !== brandToRemove));
  };

  const handleToggleProductManaged = (productId: number) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, isManaged: !p.isManaged } : p));
  };

  const handleUpdateProductImage = async (productId: number, file: File) => {
    const imageId = `indexeddb:product-image-${productId}-${Date.now()}`;
    try {
        await filesDB.set(imageId, file);
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, imageUrl: imageId } : p));
    } catch (error) {
        console.error("Falha ao salvar a imagem do produto no DB", error);
    }
  };

  const handleAudioUpload = async (file: File) => {
    const id = `audio_${Date.now()}_${file.name}`;
    try {
        await filesDB.set(id, file);
        const newAudioFile = { id, name: file.name };
        setAudioFiles(prevFiles => [...prevFiles, newAudioFile]);
    } catch(error) {
        console.error("Falha ao salvar arquivo de áudio no DB", error);
    }
  };
  
  const playAmbientAudio = async (audioFile: AudioFile, buttonKey: string) => {
    if (fadeOutInterval.current) clearInterval(fadeOutInterval.current);
    if (!ambientAudioRef.current) return;

    const url = await getAudioUrl(audioFile.id);
    if (!url) return;
    
    if (ambientAudioRef.current.src === url && ambientIsPlaying) {
      ambientAudioRef.current.currentTime = 0;
    } else {
      ambientAudioRef.current.src = url;
    }
    ambientAudioRef.current.volume = ambientVolume;
    ambientAudioRef.current.play().catch(e => console.error("Error playing ambient audio:", e));
    
    setAmbientIsPlaying(true);
    setAmbientNowPlaying({ fileId: audioFile.id, buttonKey });
  };

  const playSpotAudio = async (audioFile: AudioFile | null, buttonKey: string | null) => {
      if (!spotAudioRef.current || !audioFile) return;

      const url = await getAudioUrl(audioFile.id);
      if (!url) return;

      if (spotAudioRef.current.src === url && spotIsPlaying) {
          spotAudioRef.current.currentTime = 0;
      } else {
          spotAudioRef.current.src = url;
      }
      spotAudioRef.current.volume = spotVolume;
      spotAudioRef.current.play().catch(e => console.error("Error playing spot audio:", e));

      setSpotIsPlaying(true);
      setSpotNowPlaying({ fileId: audioFile.id, buttonKey });
      if (buttonKey && buttonKey !== 'preview') trackInteraction('spots', buttonKey);
  };

  const handleAmbientPlayRequest = (buttonKey: string) => {
    const playlist = audioMap[buttonKey];
    if (playlist && playlist.length > 0) {
      const trackToPlay = playlist[Math.floor(Math.random() * playlist.length)];
      playAmbientAudio(trackToPlay, buttonKey);
    } else {
      console.warn(`Nenhum áudio atribuído a "${buttonKey}"`);
    }
  };

  const handleSpotPlay = (spotKey: keyof SpotAudioMap) => {
    const audioFile = spotAudioMap[spotKey];
    if (audioFile) {
        playSpotAudio(audioFile, spotKey);
    } else {
        console.warn(`Nenhum áudio para o ${spotKey}`);
    }
  };
  
  const handlePreviewPlay = (audioFile: AudioFile) => {
    if (spotNowPlaying.fileId === audioFile.id && spotIsPlaying) {
      handleStopSpotAudio();
    } else {
      playSpotAudio(audioFile, 'preview'); 
    }
  };

  const handleStopAmbientAudio = () => {
    if (fadeOutInterval.current) clearInterval(fadeOutInterval.current);
    if (!ambientAudioRef.current) return;
    ambientAudioRef.current.pause();
    ambientAudioRef.current.src = '';
    setAmbientIsPlaying(false);
    setAmbientNowPlaying({ fileId: null, buttonKey: null });
  };

  const handleStopAmbientAudioWithFade = () => {
    if (!ambientAudioRef.current || !ambientIsPlaying) return;
    
    if (fadeOutInterval.current) clearInterval(fadeOutInterval.current);

    const fadeOutDuration = 1000;
    const fadeOutSteps = 20;
    const volumeStep = ambientAudioRef.current.volume / fadeOutSteps;
    let currentVolume = ambientAudioRef.current.volume;

    fadeOutInterval.current = window.setInterval(() => {
      currentVolume -= volumeStep;
      if (currentVolume > 0 && ambientAudioRef.current) {
        ambientAudioRef.current.volume = currentVolume;
      } else {
        if (fadeOutInterval.current) clearInterval(fadeOutInterval.current);
        handleStopAmbientAudio();
        if(ambientAudioRef.current) ambientAudioRef.current.volume = ambientVolume;
      }
    }, fadeOutDuration / fadeOutSteps);
  };

  const handleStopSpotAudio = () => {
    if (!spotAudioRef.current) return;
    spotAudioRef.current.pause();
    spotAudioRef.current.src = '';
    setSpotIsPlaying(false);
    setSpotNowPlaying({ fileId: null, buttonKey: null });
  };
  
  const handleAmbientVolumeChange = (newVolume: number) => {
    setAmbientVolume(newVolume);
    if (ambientAudioRef.current) {
      ambientAudioRef.current.volume = newVolume;
    }
  };
  
  const handleSpotVolumeChange = (newVolume: number) => {
    setSpotVolume(newVolume);
    if (spotAudioRef.current) {
      spotAudioRef.current.volume = newVolume;
    }
  };

  const handleAssignAudio = (fileToAssign: AudioFile, selectedButtonKeys: string[]) => {
    setAudioMap(prevMap => {
        const newMap = JSON.parse(JSON.stringify(prevMap));
        const allButtonKeys = ['Manhã', 'Tarde', 'Noite', 'IA'];

        allButtonKeys.forEach(key => {
            if (!newMap[key]) newMap[key] = [];
            const fileIndex = newMap[key].findIndex((f: AudioFile) => f.id === fileToAssign.id);

            if (selectedButtonKeys.includes(key)) {
                if (fileIndex === -1) newMap[key].push(fileToAssign);
            } else {
                if (fileIndex > -1) newMap[key].splice(fileIndex, 1);
            }
        });
        return newMap;
    });
    setAssignModalFile(null);
  };

  const handleUpdateSpotAudio = async (spotKey: keyof SpotAudioMap, file: File) => {
      const id = `spot_${spotKey.replace(' ', '_')}_${Date.now()}`;
      try {
        await filesDB.set(id, file);
        const newAudioFile = { id, name: file.name };
        setSpotAudioMap(prev => ({ ...prev, [spotKey]: newAudioFile }));
      } catch (error) {
        console.error("Falha ao salvar áudio do spot no DB", error);
      }
  };

  const handleRemoveSpotAudio = (spotKey: keyof SpotAudioMap) => {
      const audioToRemove = spotAudioMap[spotKey];
      if (audioToRemove) {
          filesDB.del(audioToRemove.id).catch(err => console.error("Falha ao remover áudio do spot do DB", err));
      }
      setSpotAudioMap(prev => ({ ...prev, [spotKey]: null }));
  };

  const handleChatSend = async (messageContent: string) => {
        if (!messageContent.trim() || isChatLoading || chatTypingMessage) return;
        
        const userMessage: ChatMessage = { role: 'user', content: messageContent };
        setChatMessages(prev => [...prev, userMessage]);
        setIsChatLoading(true);

        try {
            const simplifiedInventory = products.map(({ name, stock, sales, price, status }) => ({ name, stock, sales, price, status }));
            const context = `
                Persona e Base de Conhecimento para a IA "Marta Maia".

                Sua Identidade:
                - Você é "Marta Maia", uma IA de elite para consultoria de varejo de moda.
                - Sua missão é transformar gerentes de loja em líderes premiados, usando dados em tempo real e as melhores práticas do setor.
                - Você foi treinada com base nos princípios de liderança de executivos como Angela Ahrendts e Francesca Bellettini.

                Seu Comportamento e Tom:
                - Proativa e Orientadora: Guie, ensine e provoque o pensamento estratégico.
                - Inspiradora: Use exemplos concretos dos líderes mencionados.
                - Concisa e Acionável: Suas respostas devem ser curtas, diretas e terminar com uma sugestão clara ou pergunta.
                - IMPORTANTE: Responda sempre em texto puro, sem usar formatação como asteriscos, crases ou qualquer outro tipo de markdown. Fale de forma natural.

                Dados em Tempo Real:
                - Use os seguintes dados de estoque para TODAS as suas recomendações:
                - Dados do Estoque: ${JSON.stringify(simplifiedInventory)}
            `;
            const prompt = `${context}\n\nUsuário: ${userMessage.content}`;
            
            const aiResponse = await generateSimpleText(prompt);
            setChatTypingMessage(aiResponse.replace(/\*\*(.*?)\*\*/g, '$1').trim());

        } catch (error) {
            const errorMessage: ChatMessage = { role: 'model', content: 'Desculpe, estou com dificuldades para me conectar. Tente novamente mais tarde.' };
            setChatMessages(prev => [...prev, errorMessage]);
            console.error(error);
        } finally {
            setIsChatLoading(false);
        }
    };
    
    const handleTypingComplete = (completedMessage: string) => {
        const modelMessage: ChatMessage = { role: 'model', content: completedMessage };
        setChatMessages(prev => [...prev, modelMessage]);
        setChatTypingMessage(null);
    };

  
  useEffect(() => {
    const ambientAudio = ambientAudioRef.current;
    const spotAudio = spotAudioRef.current;
    
    const onAmbientEnded = () => handleStopAmbientAudio();
    const onSpotEnded = () => handleStopSpotAudio();

    ambientAudio?.addEventListener('ended', onAmbientEnded);
    spotAudio?.addEventListener('ended', onSpotEnded);
    
    return () => {
      ambientAudio?.removeEventListener('ended', onAmbientEnded);
      spotAudio?.removeEventListener('ended', onSpotEnded);
    };
  }, []);

  const openAdminPanels = () => {
      setShowLoginModal(false);
      setIsLoggedIn(true);
      setShowUploadModal(true);
  };

  return (
    <div className="relative h-screen w-screen flex flex-col items-center p-4 overflow-hidden font-sans">
      <SparkleBackground />
      <audio ref={ambientAudioRef} />
      <audio ref={spotAudioRef} />
      
      <div className="relative z-10 w-full h-full flex flex-col items-center">
        <header className="w-full text-center mt-6">
          <h1 
            className="text-2xl font-bold tracking-wide text-white drop-shadow-lg cursor-pointer transition-colors hover:text-white/80"
            onClick={() => isLoggedIn ? setShowUploadModal(true) : setShowLoginModal(true)}
          >
            [ NOME DA SUA LOJA AQUI ]
          </h1>
          <p className="text-base text-white/70 mt-1">MartApp Maia IA Store</p>
        </header>

        <main className="w-full flex-1 flex">
          <MainControls 
            onAmbientPlayRequest={handleAmbientPlayRequest}
            onAmbientStopAudioRequest={() => setShowStopConfirmModal(true)}
            onAmbientVolumeChange={handleAmbientVolumeChange}
            ambientVolume={ambientVolume}
            ambientNowPlaying={ambientNowPlaying}
            ambientIsPlaying={ambientIsPlaying}
            onSpotPlay={handleSpotPlay}
            spotAudioMap={spotAudioMap}
            spotIsPlaying={spotIsPlaying}
            spotNowPlaying={spotNowPlaying}
            onSpotStopAudio={handleStopSpotAudio}
            onSpotVolumeChange={handleSpotVolumeChange}
            spotVolume={spotVolume}
            onOpenAiChat={() => setShowAiChatModal(true)}
            onOpenAnunciosModal={() => setShowAnunciosModal(true)}
            customLabels={customLabels}
            onFooterClick={handleFooterClick}
          />
        </main>
        
        {showLoginModal && (
          <LoginModal
            onClose={() => setShowLoginModal(false)}
            onLoginSuccess={openAdminPanels}
          />
        )}

        {isLoggedIn && showUploadModal && (
          <UploadModal 
            onClose={() => setShowUploadModal(false)}
            onUpload={handleAudioUpload}
            audioFiles={audioFiles}
            onPlay={handlePreviewPlay}
            isPlaying={spotIsPlaying}
            nowPlayingFileId={spotNowPlaying.fileId}
            onOpenAssignModal={setAssignModalFile}
            isLoggedIn={isLoggedIn}
            onOpenAdminSpotPanel={() => {
              setShowUploadModal(false);
              setShowAdminSpotPanel(true);
            }}
            onOpenGerenciarPecasModal={() => setShowGerenciarPecasModal(true)}
            onOpenGerenciarMarcasModal={() => setShowGerenciarMarcasModal(true)}
            onOpenGerenciarDescontosModal={() => setShowGerenciarDescontosModal(true)}
            onOpenAnaliseInternaModal={() => setShowAnaliseInternaModal(true)}
            onOpenStatsModal={() => {
              setShowUploadModal(false);
              setShowStatsModal(true);
            }}
            customLabels={customLabels}
            onUpdateLabels={setCustomLabels}
            currentTheme={theme}
            onChangeTheme={setTheme}
          />
        )}

        {assignModalFile && (
            <AssignAudioModal 
                file={assignModalFile}
                audioMap={audioMap}
                onAssign={handleAssignAudio}
                onClose={() => setAssignModalFile(null)}
            />
        )}

        {isLoggedIn && showAdminSpotPanel && (
            <AdminSpotPanel
                onClose={() => {
                  setShowAdminSpotPanel(false);
                  setShowUploadModal(true);
                }}
                spotAudioMap={spotAudioMap}
                onUpdateSpotAudio={handleUpdateSpotAudio}
                onRemoveSpotAudio={handleRemoveSpotAudio}
                onPreviewSpotAudio={handlePreviewPlay}
                isPlaying={spotIsPlaying}
                nowPlayingFileId={spotNowPlaying.fileId}
            />
        )}
        
        {showStopConfirmModal && (
            <StopConfirmModal 
                onClose={() => setShowStopConfirmModal(false)}
                onConfirm={handleStopAmbientAudioWithFade}
            />
        )}

        {showAiChatModal && (
            <AiChatModal 
              onClose={() => setShowAiChatModal(false)}
              messages={chatMessages}
              onSend={handleChatSend}
              isLoading={isChatLoading}
              typingMessage={chatTypingMessage}
              onTypingComplete={handleTypingComplete}
            />
        )}

        {showAnunciosModal && (
            <AnunciosModal 
              onClose={() => setShowAnunciosModal(false)}
              discountOptions={discountOptions}
              brands={brands}
              products={products}
              onTrackInteraction={trackInteraction}
            />
        )}

        {isLoggedIn && showGerenciarPecasModal && (
          <GerenciarPecasModal
            onClose={() => setShowGerenciarPecasModal(false)}
            products={products}
            onToggleManaged={handleToggleProductManaged}
            onUpdateImage={handleUpdateProductImage}
          />
        )}

        {isLoggedIn && showGerenciarMarcasModal && (
          <GerenciarMarcasModal
            onClose={() => setShowGerenciarMarcasModal(false)}
            brands={brands}
            onAddBrand={handleAddBrand}
            onRemoveBrand={handleRemoveBrand}
          />
        )}

        {isLoggedIn && showGerenciarDescontosModal && (
          <GerenciarDescontosModal
            onClose={() => setShowGerenciarDescontosModal(false)}
            discountOptions={discountOptions}
            onAddDiscountOption={handleAddDiscountOption}
            onRemoveDiscountOption={handleRemoveDiscountOption}
          />
        )}

        {isLoggedIn && showAnaliseInternaModal && (
          <AnaliseInternaModal 
            onClose={() => setShowAnaliseInternaModal(false)}
            analytics={analytics}
            products={products}
          />
        )}

        {isLoggedIn && showStatsModal && (
          <StatsModal 
            onClose={() => setShowStatsModal(false)}
            analytics={analytics}
            products={products}
            customLabels={customLabels}
          />
        )}
      </div>
      {showDigitalRain && <DigitalRain onClose={() => setShowDigitalRain(false)} />}
    </div>
  );
};

export default App;
