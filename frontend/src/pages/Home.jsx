import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Shield, Sparkles, ArrowRight, Zap, Lock, Globe } from 'lucide-react';
import heroImg from '../assets/hero.png';
import multilingualImg from '../assets/multilingual.png';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="max-w-6xl w-full glass-panel p-8 md:p-12 rounded-3xl relative overflow-hidden">
                {/* Top gradient bar */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"></div>

                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-6 shadow-lg shadow-blue-500/50 animate-bounce-slow">
                        <Mic size={40} className="text-white" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-4 tracking-tight">
                        AI Voice Banking Assistant
                    </h1>
                    <p className="text-gray-400 text-xl font-light">Secure. Intelligent. Conversational.</p>
                </div>

                {/* Hero Image Section */}
                <div className="flex justify-center mb-16 relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full transform scale-75"></div>
                    <img
                        src={heroImg}
                        alt="Voice Banking Hero"
                        className="relative z-10 w-full max-w-2xl rounded-2xl shadow-2xl border border-white/10 hover:scale-[1.02] transition-transform duration-500"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    {/* Background & Motivation */}
                    <div className="bg-white/5 rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400">
                                <Sparkles size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-white">The Future of Banking</h2>
                        </div>
                        <p className="text-gray-300 leading-relaxed mb-6">
                            Experience a seamless, hands-free banking journey. Navigate complex financial tasks like checking balances, transferring funds, or inquiring about loans simply by speaking.
                        </p>
                        <div className="rounded-xl overflow-hidden h-48 relative">
                            <img src={multilingualImg} alt="Global Connectivity" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                <p className="text-white text-sm font-medium">Connecting users globally</p>
                            </div>
                        </div>
                    </div>

                    {/* Problem Statement */}
                    <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-2xl p-8 border border-purple-500/30 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400">
                                <Zap size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Why Voice?</h2>
                        </div>
                        <p className="text-gray-200 leading-relaxed text-lg">
                            Traditional banking apps can be complex and overwhelming. Our <span className="text-purple-300 font-semibold">AI Assistant</span> breaks down these barriers, offering an intuitive interface that understands natural language, ensuring financial inclusion for everyone.
                        </p>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-green-500/50 transition-all group">
                        <Shield className="text-green-400 mb-4 group-hover:scale-110 transition-transform" size={40} />
                        <h3 className="text-white text-xl font-semibold mb-2">Voice Biometrics</h3>
                        <p className="text-gray-400">Login securely with your unique voiceprint. No passwords needed.</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-blue-500/50 transition-all group">
                        <Globe className="text-blue-400 mb-4 group-hover:scale-110 transition-transform" size={40} />
                        <h3 className="text-white text-xl font-semibold mb-2">Multilingual</h3>
                        <p className="text-gray-400">Speak in Hindi, English, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada & more. We understand you.</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-yellow-500/50 transition-all group">
                        <Lock className="text-yellow-400 mb-4 group-hover:scale-110 transition-transform" size={40} />
                        <h3 className="text-white text-xl font-semibold mb-2">Dual Security</h3>
                        <p className="text-gray-400">Voice Auth + Email OTP (Dual-factor authentication) ensures your money stays safe.</p>
                    </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <button
                        onClick={() => navigate('/signup')}
                        className="group px-10 py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xl shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 transition-all transform hover:-translate-y-1 flex items-center gap-3"
                    >
                        Get Started
                        <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-10 py-5 rounded-2xl glass-button font-bold text-xl flex items-center gap-3 hover:bg-white/10 transition-colors"
                    >
                        <Lock size={24} />
                        Already Enrolled? Login
                    </button>
                </div>

                {/* Footer Note */}
                <div className="mt-12 text-center border-t border-white/5 pt-8">
                    <p className="text-gray-500 text-sm">
                        Powered by Innovation Brigade • Secure Voice Biometrics
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Home;
