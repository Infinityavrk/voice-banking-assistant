# AI Voice Banking Assistant - Project Documentation

## 1. Technology Stack
*   **Frontend**: React.js, Tailwind CSS, Lucide React (Icons), Axios, Vite.
*   **Backend**: Python, Flask, Flask-CORS.
*   **AI/ML Libraries**: 
    *   **Librosa**: Audio processing and feature extraction.
    *   **Scikit-learn**: Gaussian Mixture Models (GMM) for speaker verification.
    *   **PyTorch**: Deep Learning models for Deepfake detection.
    *   **Numpy**: Numerical computations.
*   **External APIs**: 
    *   **Sarvam AI**: Indic Speech-to-Text (ASR) for multilingual support.
    *   **Resend**: Email API for OTP delivery.
*   **Environment**: Python 3.10+, Node.js.

## 2. System Architecture
The system follows a modular Client-Server architecture:
*   **Client (Frontend)**: A responsive Web Application (React) that captures user audio, manages UI states (Glassmorphism design), and communicates with the backend via REST APIs.
*   **Server (Backend)**: A Flask-based REST API that orchestrates:
    *   **Auth Service**: Handles Signup, Login, and OTP verification.
    *   **Voice Service**: Manages GMM training, scoring, and Anti-spoofing checks.
    *   **NLP Service**: Parses text commands into banking intents (Transfer, Balance, History).
    *   **Banking Service**: Manages mock user data and transaction logic.

**Flow**: `User Audio` -> `Frontend` -> `Backend API` -> `Anti-Spoofing` -> `Speaker Verification` -> `ASR` -> `NLP` -> `Banking Action`.

## 3. Data Model & Storage
Currently utilizes a file-based storage system for portability and demonstration:
*   **User Profiles**: In-memory Python dictionary (Mock DB) persisting runtime data (Balance, Transactions).
*   **Voice Biometrics**: 
    *   **GMM Models**: Serialized `.gmm` (Pickle) files stored in `voiceauth/model/`.
    *   **Enrollment Samples**: Raw `.wav` audio files stored in `Data/{username}/`.
*   **Security**: No passwords are stored. Authentication relies strictly on Voice Biometrics and OTP.

## 4. AI / ML / Automation Components
*   **Speaker Verification (Biometrics)**: 
    *   Uses **Gaussian Mixture Models (GMM)** trained on MFCC (Mel-frequency cepstral coefficients) features extracted from user voice samples.
    *   Verifies identity by calculating the Log-Likelihood score of the input audio against the user's trained model.
*   **Anti-Spoofing (Security)**:
    *   Deploys a **Deepfake Detection Model** (ResNet/CNN-based) to analyze audio artifacts and distinguish between human speech and synthetic/AI-generated voice.
*   **Speech-to-Text (ASR)**:
    *   Integrates **Sarvam AI** for high-accuracy transcription, supporting Indian languages and English.
*   **Natural Language Processing (NLP)**:
    *   Custom Rule-based NLP Engine using Regex.
    *   **Intent Recognition**: Identifies intents like `TRANSFER_FUNDS`, `CHECK_BALANCE`, `TRANSACTION_HISTORY`.
    *   **Entity Extraction**: Extracts `Amount` (supports "ten thousand", "₹500") and `Recipient` (supports "Mr. Shyam", "Mom").
*   **Automation**:
    *   Automated Email OTP generation and delivery via Resend API for 2FA.

## 5. Security & Compliance
*   **Multi-Factor Authentication (MFA)**: Combines **Something you are** (Voice) with **Something you own** (Email OTP).
*   **Liveness Detection**: The Anti-spoofing module ensures that recorded or generated voices cannot breach the system.
*   **Data Privacy**: 
    *   Audio is processed securely.
    *   External API calls (Sarvam/Resend) use secure HTTPS channels.
*   **Session Management**: Banking operations are only permitted after successful biometric + OTP verification.

## 6. Scalability & Performance
*   **Lightweight Models**: GMMs are computationally efficient, allowing for fast verification (<1 second) even on standard CPUs.
*   **Modular Design**: The separation of concerns (NLP, Auth, Banking) allows individual components to be scaled or upgraded (e.g., swapping GMM for a Vector Embedding model).
*   **Cloud Ready**: The Flask application is stateless (apart from file storage) and can be easily containerized (Docker) and deployed to AWS/Azure/GCP.
*   **Async Processing**: Email sending and heavy ML inference can be offloaded to background workers (Celery/Redis) for high-load scenarios.

---

## Project Links

*   **Code Repository (GitHub)**: [https://github.com/Infinityavrk/voice-banking-assistant](https://github.com/Infinityavrk/voice-banking-assistant)
*   **Prototype Demo (Video)**: [Watch Video](https://drive.google.com/drive/folders/1j1cRtRjr4RIBHx1KFMTL3tJSS4Ie4oO4?usp=sharing)
