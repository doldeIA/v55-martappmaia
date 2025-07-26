
import React from 'react';
import { TrophyIcon, ForwardIcon, CheckCircleIcon } from '../components/Icons';

export interface PerformanceData {
  label: string;
  value: number;
}

export const hourlyPerformance: PerformanceData[] = [
  { label: '09h', value: 15 }, { label: '10h', value: 25 }, { label: '11h', value: 40 },
  { label: '12h', value: 60 }, { label: '13h', value: 55 }, { label: '14h', value: 70 },
  { label: '15h', value: 65 }, { label: '16h', value: 80 }, { label: '17h', value: 90 },
  { label: '18h', value: 75 }, { label: '19h', value: 50 }, { label: '20h', value: 30 },
];

export const dailyPerformance: PerformanceData[] = [
  { label: 'Dom', value: 35 }, { label: 'Seg', value: 50 }, { label: 'Ter', value: 45 },
  { label: 'Qua', value: 60 }, { label: 'Qui', value: 70 }, { label: 'Sex', value: 95 },
  { label: 'Sáb', value: 100 },
];

export const weeklyPerformance: PerformanceData[] = [
  { label: 'Sem 1', value: 350 }, { label: 'Sem 2', value: 410 },
  { label: 'Sem 3', value: 380 }, { label: 'Sem 4', value: 500 },
];

export interface Achievement {
  id: string;
  icon: React.FC<{ className?: string }>;
  title: string;
  description: string;
  unlocked: boolean;
}

export const achievements: Achievement[] = [
  { id: 'best_week', icon: TrophyIcon, title: 'Melhor Semana', description: 'Atingiu um novo recorde de vendas semanais.', unlocked: true },
  { id: 'top_product', icon: CheckCircleIcon, title: 'Produto Top', description: 'Um produto atingiu mais de 500 vendas.', unlocked: true },
  { id: 'peak_hour', icon: ForwardIcon, title: 'Hora de Pico', description: 'Superou 90 vendas em uma única hora.', unlocked: true },
  { id: 'empty_stock', icon: TrophyIcon, title: 'Estoque Esgotado!', description: 'Vendeu todo o estoque de um item popular.', unlocked: false },
];

export interface WeeklyChallenge {
  title: string;
  description: string;
  progress: number;
  target: number;
}

export const weeklyChallenge: WeeklyChallenge = {
  title: 'Aumentar Vendas em 10%',
  description: 'Aumente as vendas totais em 10% em relação à semana passada.',
  progress: 85,
  target: 100,
};