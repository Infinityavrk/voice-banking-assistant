import os
import logging
import shutil
import datetime
from dotenv import load_dotenv
from flask import Flask, request, jsonify

# Load environment variables
load_dotenv()
from flask_cors import CORS
import numpy as np
import joblib
import json
from scipy.io import wavfile
from voiceauth.gmm import load_features_from_directory, train_gmm, save_gmm_model
from voiceauth.feature_extraction import extract_features
from DeepfakeDetection.DataProcessing import process_audio
from DeepfakeDetection.run_record import DeepfakeDetector
from banking_service import get_user_data, transfer_funds
from nlp_service import NLPService
from asr_service import IndicASR
from otp_service import OTPService

nlp_service = NLPService()
otp_service = OTPService()
asr_service = None # Initialize lazily or in main block

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UBM_MODEL_PATH = os.path.join(BASE_DIR, 'voiceauth', 'model', 'ubm_model.pkl')
DEEPFAKE_MODEL_PATH = os.path.join(BASE_DIR, 'DeepfakeDetection', 'models', 'best_model.pth')
GMM_MODEL_DIR = os.path.join(BASE_DIR, 'voiceauth', 'model')
DATA_DIR = os.path.join(BASE_DIR, 'Data')

# Ensure directories exist
os.makedirs(GMM_MODEL_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

# Initialize Deepfake Detector globally
try:
    deepfake_detector = DeepfakeDetector(DEEPFAKE_MODEL_PATH)
    logger.info("Deepfake Detector initialized successfully.")
except Exception as e:
    logger.error(f"Failed to initialize Deepfake Detector: {e}")
    deepfake_detector = None

# Initialize ASR Service
try:
    asr_service = IndicASR()
    logger.info("IndicASR initialized successfully.")
except Exception as e:
    logger.error(f"Failed to initialize IndicASR: {e}")
    asr_service = None

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "Voice Authentication API"}), 200

@app.route('/api/signup', methods=['POST'])
def signup():
    try:
        username = request.form.get('username')
        email = request.form.get('email', f'{username}@example.com')  # Optional email
        
        if not username:
            return jsonify({"error": "Username is required"}), 400

        files = request.files.getlist('audio_samples')
        if not files or len(files) == 0:
            return jsonify({"error": "No audio samples provided"}), 400

        # Create user directory
        user_dir = os.path.join(DATA_DIR, username)
        if os.path.exists(user_dir):
            shutil.rmtree(user_dir)  # Clear existing data if re-enrolling
        os.makedirs(user_dir, exist_ok=True)
        
        # Store email in banking service
        from banking_service import create_user
        create_user(username, email)

        # Save audio files
        saved_files = []
        for i, file in enumerate(files):
            filename = f"sample_{i+1}.wav"
            file_path = os.path.join(user_dir, filename)
            file.save(file_path)
            saved_files.append(file_path)
        
        logger.info(f"Saved {len(saved_files)} samples for user {username}")

        # Train GMM
        features = load_features_from_directory(user_dir)
        if features.size == 0:
            return jsonify({"error": "No valid features extracted from audio samples"}), 400

        n_components = 32
        gmm_model = train_gmm(features, UBM_MODEL_PATH, n_components)
        
        # Save GMM model
        gmm_model_save_path = os.path.join(GMM_MODEL_DIR, f"{username}.gmm")
        save_gmm_model(gmm_model, gmm_model_save_path)

        # Calculate and save baseline stats
        # We use the training features to establish a baseline score for this user
        baseline_scores = gmm_model.score_samples(features)
        mean_score = np.mean(baseline_scores)
        std_score = np.std(baseline_scores)
        
        stats = {
            "mean_score": float(mean_score),
            "std_score": float(std_score),
            "timestamp": str(datetime.datetime.now())
        }
        
        stats_path = os.path.join(user_dir, "model_stats.json")
        with open(stats_path, 'w') as f:
            json.dump(stats, f)
            
        logger.info(f"Saved baseline stats for {username}: Mean={mean_score:.2f}, Std={std_score:.2f}")

        return jsonify({
            "message": f"User {username} registered successfully",
            "samples_processed": len(saved_files),
            "model_path": gmm_model_save_path,
            "baseline_score": mean_score
        }), 201

    except Exception as e:
        logger.error(f"Error during signup: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        username = request.form.get('username')
        if not username:
            return jsonify({"error": "Username is required"}), 400

        file = request.files.get('audio')
        if not file:
            return jsonify({"error": "Audio file is required"}), 400

        # Check if user exists
        gmm_model_path = os.path.join(GMM_MODEL_DIR, f"{username}.gmm")
        if not os.path.exists(gmm_model_path):
            return jsonify({"error": "User not found. Please sign up first."}), 404

        # Save temporary file for processing
        user_dir = os.path.join(DATA_DIR, username)
        os.makedirs(user_dir, exist_ok=True)
        temp_filename = f"{username}_login_attempt.wav"
        temp_file_path = os.path.join(user_dir, temp_filename)
        file.save(temp_file_path)

        # 1. Deepfake Detection
        if deepfake_detector:
            cutoff_frequency = 4000
            histogram_path = process_audio(temp_file_path, cutoff_frequency=cutoff_frequency, output_dir=user_dir)
            result = deepfake_detector.predict_single(histogram_path)
            
            if result:
                logger.info(f"Deepfake result for {username}: {result}")
                if result['prediction'] == 'FAKE':
                    return jsonify({
                        "success": False,
                        "message": "Deepfake detected. Authentication failed.",
                        "details": result
                    }), 401
            else:
                logger.warning("Deepfake detection returned None")
        
        # 2. Speaker Verification (GMM)
        gmm_model = joblib.load(gmm_model_path)
        
        import librosa
        audio, rate = librosa.load(temp_file_path, sr=44100)
        audio = (audio * 32768).astype(np.int16)
        
        features = extract_features(audio, rate)
        
        log_likelihood = gmm_model.score(features)
        logger.info(f"Log-Likelihood for {username}: {log_likelihood}")

        # Adaptive Thresholding
        user_dir = os.path.join(DATA_DIR, username)
        stats_path = os.path.join(user_dir, "model_stats.json")
        
        threshold = -35.0 # Fallback default
        
        if os.path.exists(stats_path):
            try:
                with open(stats_path, 'r') as f:
                    stats = json.load(f)
                
                # Logic: Threshold = Mean - Margin
                # A margin of 3-5 is usually good for GMM log-likelihoods
                # If the user varies a lot (high std), we might want a wider margin, 
                # but for security, a fixed margin from the mean is often safer.
                # Let's use a margin of 5.0
                margin = 5.0
                threshold = stats['mean_score'] - margin
                logger.info(f"Using Adaptive Threshold: {threshold} (Mean: {stats['mean_score']:.2f} - Margin: {margin})")
            except Exception as e:
                logger.warning(f"Failed to load stats for {username}, using default threshold: {e}")
        else:
             logger.warning(f"No stats found for {username}, using default threshold.")

        if log_likelihood > threshold:
            return jsonify({
                "success": True,
                "message": "Authentication Successful",
                "score": log_likelihood,
                "threshold": threshold
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": "Voice verification failed. Voice did not match.",
                "score": log_likelihood,
                "threshold": threshold
            }), 401

    except Exception as e:
        logger.error(f"Error during login: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/send-otp', methods=['POST'])
def send_otp():
    try:
        data = request.json
        username = data.get('username')
        
        if not username:
            return jsonify({"error": "Username is required"}), 400
        
        # Get user email from banking service
        user_data = get_user_data(username)
        email = user_data.get('email')
        
        if not email:
            return jsonify({"error": "No email found for this user"}), 404
        
        result = otp_service.send_otp(email)
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error sending OTP: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/verify-otp', methods=['POST'])
def verify_otp():
    try:
        data = request.json
        username = data.get('username')
        otp = data.get('otp')
        
        if not username or not otp:
            return jsonify({"error": "Username and OTP are required"}), 400
        
        # Get user email
        user_data = get_user_data(username)
        email = user_data.get('email')
        
        if not email:
            return jsonify({"error": "No email found for this user"}), 404
        
        result = otp_service.verify_otp(email, otp)
        return jsonify(result), 200 if result['success'] else 401
        
    except Exception as e:
        logger.error(f"Error verifying OTP: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/banking/data', methods=['GET'])
def get_banking_data():
    username = request.args.get('username')
    if not username:
        return jsonify({"error": "Username is required"}), 400
    
    data = get_user_data(username)
    return jsonify(data), 200

@app.route('/api/banking/transfer', methods=['POST'])
def transfer():
    try:
        data = request.json
        username = data.get('username')
        recipient = data.get('recipient')
        amount = float(data.get('amount'))
        
        if not username or not recipient or not amount:
            return jsonify({"error": "Missing required fields"}), 400
            
        result = transfer_funds(username, recipient, amount)
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        # Check if audio file is present
        if 'audio' in request.files:
            audio_file = request.files['audio']
            username = request.form.get('username')
            language = request.form.get('language', 'en-US')
            
            # Save temp audio
            user_dir = os.path.join(DATA_DIR, username)
            os.makedirs(user_dir, exist_ok=True)
            temp_path = os.path.join(user_dir, "chat_audio.wav")
            audio_file.save(temp_path)
            
            # Transcribe using ASR
            if asr_service and asr_service.client:
                text = asr_service.transcribe(temp_path, language)
                logger.info(f"ASR Transcribed: {text}")
            elif not asr_service:
                return jsonify({"error": "ASR service not available. Please restart the backend."}), 500
            else:
                return jsonify({"error": "Sarvam AI API key not configured. Please add SARVAM_API_KEY to .env file and restart the server."}), 400
                
            if not text:
                return jsonify({"error": "Could not transcribe audio"}), 400
                
        else:
            # Fallback to text input
            data = request.json or request.form
            text = data.get('text')
            username = data.get('username')
            language = data.get('language', 'en-US')
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
            
        # Process intent
        nlp_result = nlp_service.process_command(text, language)
        
        # Execute action if entities are present
        response_data = {"nlp": nlp_result, "transcription": text}
        
        if nlp_result['intent'] == 'CHECK_BALANCE':
            user_data = get_user_data(username)
            response_data['balance'] = user_data['balance']
            response_data['message'] = nlp_service.get_response_text('BALANCE', language, balance=user_data['balance'])
            
        elif nlp_result['intent'] == 'TRANSACTION_HISTORY':
            user_data = get_user_data(username)
            response_data['transactions'] = user_data['transactions'][:3]
            response_data['message'] = nlp_service.get_response_text('HISTORY', language)
            
        elif nlp_result['intent'] == 'TRANSFER_FUNDS':
            if 'missing_info' in nlp_result:
                response_data['message'] = nlp_result['message']
            else:
                response_data['message'] = nlp_service.get_response_text(
                    'TRANSFER_CONFIRM', 
                    language, 
                    amount=nlp_result['entities']['amount'], 
                    recipient=nlp_result['entities']['recipient']
                )
                
        elif nlp_result['intent'] == 'LOAN_INFO':
            user_data = get_user_data(username)
            response_data['loans'] = user_data['loans']
            response_data['message'] = nlp_service.get_response_text('LOAN', language, count=len(user_data['loans']))
            
        elif nlp_result['intent'] == 'SET_REMINDER':
            amount = nlp_service.extract_amount(text)
            if amount:
                # In a real app, this would save the reminder to a database
                response_data['reminder'] = {'amount': amount, 'set': True}
                response_data['message'] = nlp_service.get_response_text('REMINDER', language, amount=amount)
            else:
                response_data['message'] = "Please specify the amount for the reminder."
                
        else:
            response_data['message'] = nlp_result.get('message', nlp_service.get_response_text('HELP', language))

        return jsonify(response_data), 200

    except Exception as e:
        logger.error(f"Chat error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
