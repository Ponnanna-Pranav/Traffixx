import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await client.post('/auth/authenticate', { email, password });
            const { token, role } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('role', role);

            if (role === 'RIDER') {
                navigate('/rider');
            } else if (role === 'DRIVER') {
                navigate('/driver');
            } else {
                setError('Unknown role');
            }
        } catch (err) {
            setError('Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md glass rounded-3xl shadow-xl border border-white p-8 relative overflow-hidden">
            <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-50px] left-[-50px] w-32 h-32 bg-secondary/20 rounded-full blur-3xl"></div>

            <div className="relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white mb-4 shadow-lg">
                        <LogIn className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h2>
                    <p className="text-gray-500 mt-2 font-medium">Please enter your details to sign in.</p>
                </div>

                {error && (
                    <div className="bg-red-50/80 border-l-4 border-red-500 p-4 mb-6 rounded-r-xl">
                        <p className="text-red-700 text-sm font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-white/50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-white/50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                        {!loading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>
                <div className="mt-8 text-center text-sm">
                    <span className="text-gray-500 font-medium">Don't have an account? </span>
                    <Link to="/register" className="font-bold text-primary hover:text-primary-hover transition-colors">
                        Create one now
                    </Link>
                </div>
            </div>
        </div>
    );
}
