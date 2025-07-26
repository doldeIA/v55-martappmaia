import React, { useState } from 'react';
import { UserIcon, KeyIcon, ExclamationTriangleIcon } from './Icons';

interface LoginScreenProps {
    onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === 'dolde2027' && password === 'dolde2027') {
            onLoginSuccess();
        } else {
            setError('Usuário ou senha inválidos.');
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center w-full">
            <div className="w-full max-w-sm">
                <div className="bg-gradient-to-br from-gray-900 via-slate-900 to-black/90 text-white rounded-2xl border border-white/10 shadow-2xl p-8">
                    <header className="text-center mb-6">
                        <h2 className="text-2xl font-bold">Acesso ao Dashboard</h2>
                        <p className="text-white/60 mt-1">Por favor, insira suas credenciais.</p>
                    </header>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="text-sm font-medium text-white/80 block mb-2">Usuário</label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="seu.usuario"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password" className="text-sm font-medium text-white/80 block mb-2">Senha</label>
                            <div className="relative">
                                <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm p-3 rounded-lg flex items-center gap-2">
                                <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                        >
                            Login
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
