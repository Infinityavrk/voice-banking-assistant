import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import axios from 'axios';
import AudioRecorder from '../components/AudioRecorder';
import { Lock, AlertTriangle, CheckCircle } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [audioBlob, setAudioBlob] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!username || !audioBlob) {
            setError('Please provide username and record audio.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await login(username, audioBlob);
            if (response.data.success) {
                // Voice authentication successful, now trigger OTP
                setShowOtpModal(true);
                // Send OTP to user's email
                await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/send-otp`, { username });
            } else {
                setError(response.data.message || 'Authentication failed.');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setOtpLoading(true);
        setError('');
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/verify-otp`, { username, otp });
            if (response.data.success) {
                // Get the voice auth score from previous response
                const voiceResponse = await login(username, audioBlob);
                navigate('/dashboard', { state: { username, score: voiceResponse.data.score } });
            } else {
                setError(response.data.message || 'Invalid OTP.');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setOtpLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md glass-panel p-8 rounded-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="p-4 rounded-full bg-blue-500/20 mb-4">
                        <Lock className="text-blue-400" size={40} />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
                    <p className="text-gray-400">Voice Authentication Required</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3 text-red-200">
                        <AlertTriangle size={20} className="mt-1 flex-shrink-0" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg glass-input text-lg"
                            placeholder="Enter your username"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Voice Verification</label>
                        <p className="text-xs text-gray-500 mb-4">
                            Please read: "My voice is my password for secure banking and financial transactions."
                        </p>
                        <AudioRecorder
                            onRecordingComplete={setAudioBlob}
                            label="Record Verification Sample"
                        />
                    </div>

                    <button
                        onClick={handleLogin}
                        disabled={!username || !audioBlob || loading}
                        className="w-full py-3 rounded-lg glass-button font-bold text-lg shadow-lg flex items-center justify-center gap-2"
                    >
                        {loading && (
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {loading ? 'Verifying Voice...' : 'Authenticate'}
                    </button>

                    <div className="text-center mt-4">
                        <span className="text-gray-400 text-sm">Don't have an account? </span>
                        <button
                            onClick={() => navigate('/signup')}
                            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>

            {/* OTP Verification Modal */}
            {showOtpModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="w-full max-w-md glass-panel p-8 rounded-2xl">
                        <div className="text-center mb-6">
                            <div className="p-4 rounded-full bg-green-500/20 inline-block mb-4">
                                <CheckCircle className="text-green-400" size={40} />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Voice Verified! ✅</h2>
                            <p className="text-gray-400 text-sm">An OTP has been sent to your registered email</p>
                            <p className="text-xs text-gray-500 mt-1">(Check the backend console for the OTP)</p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleOtpSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Enter 6-Digit OTP</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="w-full px-4 py-3 rounded-lg glass-input text-2xl text-center tracking-widest"
                                    placeholder="000000"
                                    maxLength={6}
                                    disabled={otpLoading}
                                    autoFocus
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={otp.length !== 6 || otpLoading}
                                className="w-full py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg hover:shadow-green-500/30 transition-all disabled:opacity-50"
                            >
                                {otpLoading ? 'Verifying...' : 'Complete Login'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowOtpModal(false)}
                                className="w-full py-2 rounded-lg glass-button text-sm"
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
