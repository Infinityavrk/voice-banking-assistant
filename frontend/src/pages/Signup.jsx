import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../services/api';
import AudioRecorder from '../components/AudioRecorder';
import { UserPlus, CheckCircle, AlertCircle, Info } from 'lucide-react';

const REQUIRED_SAMPLES = 10;

const Signup = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [samples, setSamples] = useState(Array(REQUIRED_SAMPLES).fill(null));
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isCredentialsValid, setIsCredentialsValid] = useState(false);
    const navigate = useNavigate();

    const handleRecordingComplete = (blob) => {
        const newSamples = [...samples];
        newSamples[currentStep] = blob;
        setSamples(newSamples);
    };

    const handleNext = () => {
        if (samples[currentStep]) {
            setCurrentStep(prev => Math.min(prev + 1, REQUIRED_SAMPLES - 1));
        }
    };

    const handlePrev = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (samples.some(s => !s)) {
            setError('Please record all samples.');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await signup(username, samples, email);
            alert('Signup successful! Please login.');
            navigate('/login');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Validate credentials in real-time
    const validateCredentials = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = username.trim() !== '' && emailRegex.test(email);
        setIsCredentialsValid(isValid);
        return isValid;
    };

    // Check credentials whenever username or email changes
    React.useEffect(() => {
        validateCredentials();
    }, [username, email]);

    const progress = ((samples.filter(s => s !== null).length) / REQUIRED_SAMPLES) * 100;

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-2xl glass-panel p-8 rounded-2xl">
                <div className="flex items-center gap-3 mb-8">
                    <UserPlus className="text-blue-400" size={32} />
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        Voice Enrollment
                    </h1>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-200">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg glass-input text-lg"
                        placeholder="Enter your unique username"
                        disabled={loading}
                        required
                    />
                </div>

                <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg glass-input text-lg"
                        placeholder="your.email@example.com"
                        pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                        title="Please enter a valid email address"
                        disabled={loading}
                        required
                    />
                    <p className="text-xs text-blue-300 mt-2 flex items-center gap-1">
                        <Info size={14} />
                        Important: Please enter a valid email to receive OTP during login verification.
                    </p>
                </div>

                {/* Credential Validation Warning */}
                {!isCredentialsValid && (
                    <div className="mb-8 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-200 text-sm text-center">
                        ⚠️ Please enter a valid username and email address to begin voice enrollment.
                    </div>
                )}

                {/* Recording Section - Only show if credentials are valid */}
                {isCredentialsValid && (
                    <>
                        <div className="mb-8">
                            <div className="flex justify-between text-sm text-gray-400 mb-2">
                                <span>Recording Progress</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xl font-semibold mb-4 text-center">
                                Sample {currentStep + 1} of {REQUIRED_SAMPLES}
                            </h3>
                            <p className="text-gray-400 text-center mb-6 italic">
                                "My voice is my password for secure banking and financial transactions."
                            </p>

                            <AudioRecorder
                                onRecordingComplete={handleRecordingComplete}
                                label={`Record Sample ${currentStep + 1}`}
                                key={currentStep} // Reset recorder on step change
                            />
                        </div>

                        <div className="flex justify-between mt-8">
                            <button
                                onClick={handlePrev}
                                disabled={currentStep === 0 || loading}
                                className="px-6 py-2 rounded-lg glass-button bg-gray-600 disabled:opacity-50"
                            >
                                Previous
                            </button>

                            {currentStep < REQUIRED_SAMPLES - 1 ? (
                                <button
                                    onClick={handleNext}
                                    disabled={!samples[currentStep]}
                                    className="px-6 py-2 rounded-lg glass-button disabled:opacity-50"
                                >
                                    Next Sample
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={!samples.every(s => s) || loading || !username || !email}
                                    className="px-8 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg hover:shadow-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {loading && (
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    )}
                                    {loading ? 'Processing Enrollment...' : 'Complete Enrollment'}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Signup;
