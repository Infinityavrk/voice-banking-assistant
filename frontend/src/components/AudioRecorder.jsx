import React, { useState, useRef } from 'react';
import { Mic, Square, RefreshCw } from 'lucide-react';

const AudioRecorder = ({ onRecordingComplete, label = "Record Audio" }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
                const url = URL.createObjectURL(blob);
                setAudioURL(url);
                onRecordingComplete(blob);

                // Stop all tracks to release microphone
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone. Please ensure you have granted permission.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const resetRecording = () => {
        setAudioURL(null);
        onRecordingComplete(null);
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4 glass-panel rounded-xl">
            <h3 className="text-lg font-semibold text-gray-200">{label}</h3>

            <div className="flex items-center gap-4">
                {!isRecording && !audioURL && (
                    <button
                        onClick={startRecording}
                        className="flex items-center gap-2 px-6 py-3 rounded-full glass-button font-medium"
                    >
                        <Mic size={20} />
                        Start Recording
                    </button>
                )}

                {isRecording && (
                    <button
                        onClick={stopRecording}
                        className="flex items-center gap-2 px-6 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white font-medium transition-colors animate-pulse"
                    >
                        <Square size={20} />
                        Stop Recording
                    </button>
                )}

                {audioURL && (
                    <div className="flex flex-col items-center gap-3">
                        <audio src={audioURL} controls className="h-10 w-64" />
                        <button
                            onClick={resetRecording}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white text-sm transition-colors"
                        >
                            <RefreshCw size={16} />
                            Record Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AudioRecorder;
