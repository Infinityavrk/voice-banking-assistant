import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const signup = async (username, audioBlobs, email) => {
    const formData = new FormData();
    formData.append('username', username);
    if (email) formData.append('email', email);
    audioBlobs.forEach((blob, index) => {
        formData.append('audio_samples', blob, `sample_${index}.wav`);
    });

    return axios.post(`${API_URL}/signup`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

export const login = async (username, audioBlob) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('audio', audioBlob, 'login.wav');

    return axios.post(`${API_URL}/login`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

export const getBankingData = async (username) => {
    return axios.get(`${API_URL}/banking/data`, { params: { username } });
};

export const processVoiceCommand = async (username, input, language = 'en-US') => {
    if (input instanceof Blob) {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('audio', input, 'command.wav');
        formData.append('language', language);
        return axios.post(`${API_URL}/chat`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    } else {
        return axios.post(`${API_URL}/chat`, { username, text: input, language });
    }
};
