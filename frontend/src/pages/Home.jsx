import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Shield, Sparkles, ArrowRight, Zap, Lock, Globe } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="max-w-5xl w-full glass-panel p-12 rounded-3xl relative overflow-hidden">
                {/* Top gradient bar */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"></div>

                {/* Logo/Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4 shadow-lg shadow-blue-500/50">
                        <Mic size={40} className="text-white" />
                    </div>
                    <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-2">
                        AI Voice Banking Assistant
                    </h1>
                    <p className="text-gray-400 text-lg">Secure. Intelligent. Conversational.</p>
                </div>

                {/* Background/Motivation */}
                <div className="mb-8 bg-white/5 rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="text-blue-400" size={24} />
                        <h2 className="text-2xl font-bold text-white">Background & Motivation</h2>
                    </div>
                    <p className="text-gray-300 leading-relaxed">
                        In today's digital banking world, customers expect seamless, personalized, and hands-free experiences.
                        However, many users—especially those less familiar with complex banking apps—still find it difficult to
                        navigate multiple menus for simple tasks like checking balances, transferring funds, or inquiring about loans.
                    </p>
                    <p className="text-gray-300 leading-relaxed mt-4">
                        An <span className="text-blue-400 font-semibold">AI-powered Voice Banking Assistant</span> can bridge
                        this gap by enabling users to perform financial operations through natural voice interactions, ensuring
                        convenience, accessibility, and speed.
                    </p>
                </div>

                {/* Problem Statement */}
                <div className="mb-10 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-2xl p-6 border border-purple-500/30">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="text-purple-400" size={24} />
                        <h2 className="text-2xl font-bold text-white">Problem Statement</h2>
                    </div>
                    <p className="text-gray-200 leading-relaxed">
                        Design and build an <span className="font-semibold text-purple-300">AI Voice Assistant</span> that
                        allows users to perform secure financial operations through conversational interaction. The assistant
                        should understand natural language commands, respond intelligently, and execute actions safely while
                        maintaining compliance and privacy standards.
                    </p>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-4 mb-10">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
                        <Shield className="text-green-400 mb-2" size={32} />
                        <h3 className="text-white font-semibold mb-2">Voice Biometrics</h3>
                        <p className="text-gray-400 text-sm">Secure authentication using your unique voice signature</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
                        <Globe className="text-blue-400 mb-2" size={32} />
                        <h3 className="text-white font-semibold mb-2">Multilingual</h3>
                        <p className="text-gray-400 text-sm">Supports Hindi, English, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada & more</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
                        <Lock className="text-yellow-400 mb-2" size={32} />
                        <h3 className="text-white font-semibold mb-2">OTP Security</h3>
                        <p className="text-gray-400 text-sm">Dual-factor authentication with email OTP</p>
                    </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={() => navigate('/signup')}
                        className="group px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg shadow-lg hover:shadow-blue-500/50 transition-all transform hover:scale-105 flex items-center gap-2"
                    >
                        Get Started
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-8 py-4 rounded-xl glass-button font-bold text-lg flex items-center gap-2"
                    >
                        <Lock size={20} />
                        Already Enrolled? Login
                    </button>
                </div>

                {/* Footer Note */}
                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-sm">
                        Powered by Innovation Brigade • Secure Voice Biometrics
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Home;
