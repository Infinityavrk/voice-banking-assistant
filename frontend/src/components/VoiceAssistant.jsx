import React, { useState, useEffect, useRef } from 'react';
import { Mic, X, Send, Volume2, MessageSquare, Globe } from 'lucide-react';
import { processVoiceCommand } from '../services/api';

const VoiceAssistant = ({ username, onAction }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [language, setLanguage] = useState('en-US');
    const [messages, setMessages] = useState([
        { type: 'bot', text: 'Hello! I am your banking assistant. You can ask me to check your balance, transfer funds, or show transactions.\n\nनमस्ते! मैं आपका बैंकिंग सहायक हूं। आप मुझसे अपना बैलेंस चेक करने, पैसे ट्रांसफर करने या ट्रांजेक्शन देखने के लिए कह सकते हैं।' }
    ]);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef(null);

    const languages = [
        { code: 'en-US', name: 'English', flag: '🇺🇸' },
        { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
        { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
        { code: 'fr-FR', name: 'Français', flag: '🇫🇷' }
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const speak = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        window.speechSynthesis.speak(utterance);
    };

    const handleSend = async (input) => {
        if (!input) return;

        // Add user message (if text) or placeholder (if audio)
        if (typeof input === 'string') {
            setMessages(prev => [...prev, { type: 'user', text: input }]);
            setInputText('');
        } else {
            setMessages(prev => [...prev, { type: 'user', text: "🎤 Audio Message..." }]);
        }

        try {
            // Send to backend (text or audio)
            const response = await processVoiceCommand(username, input, language);
            const botMessage = response.data.message;
            const transcription = response.data.transcription;

            // If audio was sent, update the user's message with the transcription
            if (transcription) {
                setMessages(prev => {
                    const newMessages = [...prev];
                    // Find the last "Audio Message..." and replace it
                    const lastUserMsgIndex = newMessages.map(m => m.text).lastIndexOf("🎤 Audio Message...");
                    if (lastUserMsgIndex !== -1) {
                        newMessages[lastUserMsgIndex].text = transcription;
                    }
                    return newMessages;
                });
            }

            setMessages(prev => [...prev, { type: 'bot', text: botMessage }]);
            speak(botMessage);

            if (onAction && response.data.nlp.intent !== 'UNKNOWN') {
                onAction();
            }

        } catch (error) {
            console.error("Error processing command:", error);
            setMessages(prev => [...prev, { type: 'bot', text: "Sorry, I'm having trouble connecting to the server.\n\nक्षमा करें, मुझे सर्वर से कनेक्ट करने में परेशानी हो रही है।" }]);
        }
    };

    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    const startListening = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
                setIsListening(false);

                // Send audio to backend
                handleSend(audioBlob);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsListening(true);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone.");
        }
    };

    const stopListening = () => {
        if (mediaRecorderRef.current && isListening) {
            mediaRecorderRef.current.stop();
        }
    };

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-8 right-8 p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-blue-500/50 transition-all transform hover:scale-110 z-50"
                >
                    <MessageSquare size={28} />
                </button>
            )}

            {/* Chat Interface */}
            {isOpen && (
                <div className="fixed bottom-8 right-8 w-96 h-[500px] glass-panel rounded-2xl flex flex-col shadow-2xl z-50 border border-white/20 overflow-hidden">
                    {/* Header */}
                    <div className="p-4 bg-white/10 flex justify-between items-center border-b border-white/10">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                            <h3 className="font-semibold text-white">Voice Assistant</h3>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative group">
                                <button className="text-gray-300 hover:text-white flex items-center gap-1 text-xs bg-white/10 px-2 py-1 rounded-lg">
                                    <Globe size={14} />
                                    {languages.find(l => l.code === language).flag}
                                </button>
                                <div className="absolute right-0 top-full mt-2 w-32 bg-gray-800 rounded-lg shadow-xl border border-white/10 overflow-hidden hidden group-hover:block z-50">
                                    {languages.map(lang => (
                                        <button
                                            key={lang.code}
                                            onClick={() => setLanguage(lang.code)}
                                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 flex items-center gap-2 ${language === lang.code ? 'text-blue-400 bg-white/5' : 'text-gray-300'}`}
                                        >
                                            <span>{lang.flag}</span>
                                            {lang.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.type === 'user'
                                        ? 'bg-blue-500 text-white rounded-tr-none'
                                        : 'bg-white/10 text-gray-200 rounded-tl-none'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-black/20 border-t border-white/10">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={isListening ? stopListening : startListening}
                                className={`p-3 rounded-full transition-all ${isListening ? 'bg-red-500 animate-pulse' : 'bg-blue-500 hover:bg-blue-600'}`}
                            >
                                {isListening ? <X size={20} className="text-white" /> : <Mic size={20} className="text-white" />}
                            </button>

                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend(inputText)}
                                placeholder="Type or speak..."
                                className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-sm"
                            />

                            <button
                                onClick={() => handleSend(inputText)}
                                disabled={!inputText.trim()}
                                className="text-blue-400 hover:text-blue-300 disabled:opacity-50"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default VoiceAssistant;
