'use client';

import { useState } from 'react';
import api from '../../../lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        setIsLoading(true);
        setMessage('');
        try {
            await api.get('/sanctum/csrf-cookie');
            await api.post('/api/login', { email, password });
            router.push('/home');
        } catch {
            setMessage('ログイン失敗');
        } finally {
            setIsLoading(false);
        }
    };

    interface KeyPressEvent extends React.KeyboardEvent<HTMLInputElement> {}

    const handleKeyPress = (e: KeyPressEvent) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 flex items-center justify-center p-4">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Main login card */}
                <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
                            {/* Fast rotating outer rings */}
                            <div className="absolute -inset-2 rounded-full border-4 border-transparent border-t-indigo-500 border-r-purple-500 animate-spin" style={{ animationDuration: '1s' }}></div>
                            <div className="absolute -inset-1 rounded-full border-3 border-transparent border-b-purple-400 border-l-indigo-400 animate-spin" style={{ animationDuration: '0.8s', animationDirection: 'reverse' }}></div>
                            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-300 animate-spin" style={{ animationDuration: '0.6s' }}></div>

                            {/* Floating geometric shapes with complex motion */}
                            <div className="absolute -top-4 -right-4 w-4 h-4 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0s', animationDuration: '1s', transform: 'translateX(4px) translateY(-4px)' }}></div>
                            <div className="absolute -bottom-4 -left-4 w-3 h-3 bg-gradient-to-r from-purple-400 to-indigo-400 rotate-45 animate-bounce shadow-lg" style={{ animationDelay: '0.3s', animationDuration: '1.2s', transform: 'translateX(-4px) translateY(4px)' }}></div>
                            <div className="absolute -top-2 -left-5 w-2 h-6 bg-gradient-to-b from-indigo-300 to-transparent animate-pulse" style={{ animationDelay: '0.7s', animationDuration: '0.8s', transform: 'rotate(15deg)' }}></div>
                            <div className="absolute -bottom-2 -right-5 w-2 h-6 bg-gradient-to-t from-purple-300 to-transparent animate-pulse" style={{ animationDelay: '0.2s', animationDuration: '0.9s', transform: 'rotate(-15deg)' }}></div>

                            {/* Central icon container with breathing effect */}
                            <div className="relative z-20 w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse hover:scale-250 transition-all duration-500" style={{ animationDuration: '2s' }}>
                                <span className="ri-compasses-2-line text-2xl text-white transform hover:rotate-12 transition-transform duration-300"></span>
                            </div>

                            {/* Multiple pulsing glow layers */}
                            <div className="absolute inset-2 bg-gradient-to-r from-indigo-500/30 to-purple-600/30 rounded-2xl blur-lg animate-pulse" style={{ animationDuration: '1.5s' }}></div>
                            <div className="absolute inset-1 bg-gradient-to-r from-purple-500/20 to-indigo-600/20 rounded-2xl blur-xl animate-pulse" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 rounded-2xl blur-2xl animate-pulse" style={{ animationDuration: '3s', animationDelay: '1s' }}></div>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight animate-pulse" style={{ animationDuration: '4s' }}>TransPiece</h1>
                        <p className="text-gray-400 text-sm">アカウントにログインしてください</p>
                    </div>

                    {/* Form */}
                    <div className="space-y-6">
                        {/* Email input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">メールアドレス</label>
                            <div className="relative">
                                <span className="ri-mail-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></span>
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all duration-200"
                                />
                            </div>
                        </div>

                        {/* Password input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">パスワード</label>
                            <div className="relative">
                                <span className="ri-lock-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></span>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all duration-200"
                                />
                            </div>
                        </div>

                        {/* Login button */}
                        <button
                            onClick={handleLogin}
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>ログイン中...</span>
                                </>
                            ) : (
                                <>
                                    <span>ログイン</span>
                                    <span className="ri-arrow-right-line"></span>
                                </>
                            )}
                        </button>

                        {/* Error message */}
                        {message && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center space-x-2">
                                <span className="ri-error-warning-line text-red-400"></span>
                                <span className="text-red-400 text-sm">{message}</span>
                            </div>
                        )}

                        {/* Forgot password link */}
                        <div className="text-center">
                            <Link
                                href="/forgot-password"
                                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
                            >
                                パスワードを忘れた方はこちら
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Register link */}
                <div className="mt-6 text-center bg-gray-800/20 backdrop-blur-xl border border-gray-700/30 rounded-xl p-4">
                    <p className="text-gray-400 text-sm">
                        アカウントをお持ちでない方は{' '}
                        <Link
                            href="/register"
                            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors duration-200"
                        >
                            新規登録
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}