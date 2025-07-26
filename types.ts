
export type InventoryStatus = 'In Stock' | 'Low Stock' | 'Out of Stock' | 'On Sale';

export interface Product {
  id: number;
  name: string;
  category: string;
  brand: string;
  stock: number;
  price: number;
  sales: number; // units sold this month
  status: InventoryStatus;
  stockThreshold: number; 
  imageUrl: string;
  discount?: number; // Optional discount percentage
  isManaged?: boolean;
}

export interface AudioFile {
  id: string; // Unique ID for IndexedDB
  name: string;
}

// Maps a button ID (e.g., "Bossa Nova") to a list of audio files
export type AudioMap = {
  [key: string]: AudioFile[];
};

export type SpotAudioMap = {
  [key in 'Spot 1' | 'Spot 2' | 'Spot 3']: AudioFile | null;
};

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface CustomLabels {
  analisarAnuncios: string;
  converseComigo: string;
  falarComAnalista: string;
  spot1: string;
  spot2: string;
  spot3: string;
}

export type AppTheme = 'theme-padrao' | 'theme-verao' | 'theme-inverno' | 'theme-natal' | 'theme-especial';

export type InteractionType = 'discounts' | 'brands' | 'products' | 'spots';

export interface InteractionEvent {
  type: InteractionType;
  key: string | number;
  timestamp: number; // Unix timestamp (ms)
}

export interface AppAnalytics {
  interactions: InteractionEvent[];
}