import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, Activity, Zap, CreditCard, DollarSign, History, ArrowRightLeft } from 'lucide-react';
import { getBankingData } from '../services/api';
import VoiceAssistant from '../components/VoiceAssistant';

const Dashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { username, score } = location.state || { username: 'User', score: 0 };

    const [bankingData, setBankingData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const response = await getBankingData(username);
            setBankingData(response.data);
        } catch (error) {
            console.error("Failed to fetch banking data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [username]);

    return (
        <div className="min-h-screen flex flex-col items-center p-4 relative">
            <div className="w-full max-w-6xl glass-panel p-8 rounded-3xl text-center relative overflow-hidden mb-20">
                {/* Header */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-purple-500"></div>

                <div className="flex justify-between items-center mb-8">
                    <div className="text-left">
                        <h1 className="text-3xl font-bold text-white">Welcome back, {username}</h1>
                        <p className="text-gray-400 text-sm">Voice Authentication Verified • Score: {score?.toFixed(2)}</p>
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors text-sm"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">

                    {/* Left Column: Banking Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Balance Card */}
                        <div className="bg-gradient-to-br from-blue-600/40 to-purple-600/40 rounded-2xl p-6 border border-white/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-20">
                                <CreditCard size={120} />
                            </div>
                            <h3 className="text-gray-300 text-sm font-medium mb-1">Total Balance</h3>
                            <div className="text-4xl font-bold text-white mb-6">
                                ₹{bankingData?.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '---'}
                            </div>
                            <div className="flex gap-3">
                                <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm transition-all">
                                    <ArrowRightLeft size={16} /> Transfer
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm transition-all">
                                    <History size={16} /> History
                                </button>
                            </div>
                        </div>

                        {/* Recent Transactions */}
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <History size={18} className="text-blue-400" />
                                Recent Transactions
                            </h3>
                            <div className="space-y-3">
                                {bankingData?.transactions?.slice(0, 3).map((tx) => (
                                    <div key={tx.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${tx.type === 'credit' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                <DollarSign size={16} />
                                            </div>
                                            <div>
                                                <p className="text-white text-sm font-medium">{tx.desc}</p>
                                                <p className="text-gray-500 text-xs">{tx.date}</p>
                                            </div>
                                        </div>
                                        <span className={`font-mono font-bold ${tx.type === 'credit' ? 'text-green-400' : 'text-white'}`}>
                                            {tx.type === 'credit' ? '+' : ''}{tx.amount.toFixed(2)}
                                        </span>
                                    </div>
                                )) || <p className="text-gray-500 text-sm">Loading transactions...</p>}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Security Stats */}
                    <div className="space-y-6">
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <h3 className="text-sm uppercase tracking-wider text-green-400 font-semibold mb-4 flex items-center gap-2">
                                <ShieldCheck size={16} />
                                Security Status
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300 text-sm">Authentication</span>
                                    <span className="text-green-400 font-bold text-xs bg-green-500/20 px-2 py-1 rounded">VERIFIED</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300 text-sm">Deepfake Check</span>
                                    <span className="text-green-400 font-bold text-xs bg-green-500/20 px-2 py-1 rounded">PASSED</span>
                                </div>
                                <div className="h-px bg-white/10 my-2"></div>
                                <div className="text-xs text-gray-400">
                                    Your session is secured by dual-stage voice biometrics.
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
                            <h3 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
                                <Zap size={18} />
                                Voice Assistant
                            </h3>
                            <p className="text-blue-200/70 text-sm mb-4">
                                Try saying: "Check my balance" or "Transfer $100 to Mom".
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Voice Assistant Overlay */}
            <VoiceAssistant username={username} onAction={fetchData} />
        </div>
    );
};

export default Dashboard;
