import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, User } from 'lucide-react';

const HeartIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
);

export default function LoginApple() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simular delay de red
        setTimeout(() => {
            setLoading(false);
            navigate('/dashboard'); // Ir al Dashboard
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[70vh] h-[70vh] rounded-full bg-gradient-to-br from-rose-50 to-pink-50 blur-3xl opacity-60"></div>
                <div className="absolute top-[40%] -right-[10%] w-[60vh] h-[60vh] rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 blur-3xl opacity-60"></div>
            </div>

            <div className="w-full max-w-sm relative z-10">
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-black rounded-3xl mx-auto flex items-center justify-center mb-8 shadow-2xl shadow-black/20 transform rotate-3">
                        <HeartIcon className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-semibold text-black tracking-tight mb-3">Dental Life</h1>
                    <p className="text-gray-500 text-lg font-light">Inicia sesión en tu espacio</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="group">
                        <div className="relative">
                            <User className="absolute left-5 top-4 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors" />
                            <input
                                type="text"
                                placeholder="Usuario"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-black/5 rounded-2xl outline-none text-base font-medium transition-all hover:bg-gray-100 focus:bg-white focus:shadow-sm"
                                required
                            />
                        </div>
                    </div>

                    <div className="group">
                        <div className="relative">
                            <Lock className="absolute left-5 top-4 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors" />
                            <input
                                type="password"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-black/5 rounded-2xl outline-none text-base font-medium transition-all hover:bg-gray-100 focus:bg-white focus:shadow-sm"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white rounded-2xl py-4 font-semibold text-lg hover:bg-gray-900 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/10 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Ingresar <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center mt-10 text-sm text-gray-400 font-light">
                    Versión 2.0 • Dental Life System
                </p>
            </div>
        </div>
    );
}
