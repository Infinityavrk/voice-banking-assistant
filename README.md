# 🎙️ AI Voice Banking Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18-cyan)](https://reactjs.org/)
[![Sarvam AI](https://img.shields.io/badge/Powered%20by-Sarvam%20AI-orange)](https://www.sarvam.ai/)

> **"My voice is my password."**  
> A secure, multilingual, and hands-free banking experience powered by advanced Voice Biometrics and AI.

---

## 🌟 Overview

The **AI Voice Banking Assistant** revolutionizes digital banking by enabling users to perform financial operations through natural voice interactions. Designed for accessibility and security, it bridges the gap for users unfamiliar with complex banking interfaces.

### 🚀 Key Features

*   **🔐 Voice Biometric Authentication**: Secure login using your unique voice print (GMM Models).
*   **🛡️ Dual-Factor Security**: Voice Auth + Email OTP (via Resend API) for maximum protection.
*   **🗣️ Multilingual Support**: Speaks and understands **English, Hindi, Spanish, and French** (powered by Sarvam AI).
*   **🤖 AI-Powered NLP**: Understands natural commands like *"Transfer ₹5000 to Mom"* or *"Check my balance"*.
*   **🕵️ Anti-Spoofing**: Deepfake detection to prevent replay attacks and synthetic voice fraud.
*   **🎨 Glassmorphism UI**: A stunning, modern interface designed for the next generation of banking.

---

## 📸 Project Screenshots

| **Landing Page** | **Secure Login** |
|:---:|:---:|
| ![Landing Page](screenshots/landing_page.png) | ![Login Page](screenshots/login_page.png) |
| *Modern Landing Page with Glassmorphism* | *Voice Verification with Waveform* |

| **Voice Enrollment** |
|:---:|
| ![Signup Page](screenshots/signup_page.png) |
| *10-Sample Voice Enrollment Process* |

---

## 🏗️ System Architecture

The system follows a modular **Client-Server Architecture**:

1.  **Frontend (React + Vite)**: Handles UI, Audio Recording, and Visualizations.
2.  **Backend (Flask)**: Orchestrates Auth, NLP, and Banking Services.
3.  **AI Engine**:
    *   **Speaker Verification**: Gaussian Mixture Models (GMM).
    *   **Anti-Spoofing**: ResNet/CNN Deepfake Detector.
    *   **ASR**: Sarvam AI (Indic Speech-to-Text).

---

## 🛠️ Technology Stack

*   **Frontend**: React, Tailwind CSS, Lucide Icons, Framer Motion.
*   **Backend**: Python, Flask, NumPy, Scikit-learn, Librosa.
*   **External APIs**: Sarvam AI (ASR), Resend (Email/OTP).
*   **Storage**: File-based (Pickle/JSON) for portability.

---

## 🚀 Getting Started

### Prerequisites
*   Python 3.10+
*   Node.js 16+
*   Sarvam AI API Key
*   Resend API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Infinityavrk/voice-banking-assistant.git
    cd voice-banking-assistant
    ```

2.  **Backend Setup**
    ```bash
    python -m venv .venv
    source .venv/bin/activate  # Windows: .venv\Scripts\activate
    pip install -r requirements.txt
    ```

3.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    ```

4.  **Environment Variables**
    Create a `.env` file in the root directory:
    ```env
    SARVAM_API_KEY=your_sarvam_key
    RESEND_API_KEY=your_resend_key
    ```

5.  **Run the Application**
    *   Backend: `python app.py` (Port 5001)
    *   Frontend: `npm run dev` (Port 5173)

---

## 🤝 Contributors

*   **Innovation Brigade** - *Lead Developers*

---
