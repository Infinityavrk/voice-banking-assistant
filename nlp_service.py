import re

class NLPService:
    def __init__(self):
        self.intents = {
            'CHECK_BALANCE': [
                # English
                r'balance', r'how much money', r'account status', r'what do i have',
                # Spanish
                r'saldo', r'cuánto dinero', r'estado de cuenta',
                # Hindi
                r'balance', r'kitna paisa', r'khata', r'paise',
                # French
                r'solde', r'combien d\'argent', r'compte'
            ],
            'TRANSFER_FUNDS': [
                # English
                r'transfer', r'send', r'pay',
                # Spanish
                r'transferir', r'enviar dinero', r'pagar',
                # Hindi
                r'transfer', r'bhejo', r'dena', r'pay',
                # French
                r'transférer', r'envoyer', r'payer'
            ],
            'TRANSACTION_HISTORY': [
                # English
                r'transactions', r'history', r'last spent', r'recent activity',
                # Spanish
                r'transacciones', r'historial', r'movimientos',
                # Hindi
                r'transaction', r'history', r'len den', r'kharch',
                # French
                r'transactions', r'historique', r'dépenses'
            ],
            'LOAN_INFO': [
                # English
                r'loan', r'interest rate', r'borrow', r'credit limit',
                # Spanish
                r'préstamo', r'tasa de interés', r'crédito',
                # Hindi
                r'loan', r'udhar', r'byaj', r'credit',
                # French
                r'prêt', r'taux d\'intérêt', r'crédit'
            ],
            'SET_REMINDER': [
                # English
                r'remind', r'reminder', r'alert', r'notify', r'set alarm',
                # Spanish
                r'recordar', r'recordatorio', r'alerta',
                # Hindi
                r'yaad', r'reminder', r'yaad dilana', r'alert',
                # French
                r'rappel', r'rappeler', r'alerte'
            ]
        }
        
        self.responses = {
            'en-US': {
                'UNKNOWN': "I didn't understand that command.",
                'MISSING_INFO': "I need to know how much and who to send it to.",
                'TRANSFER_CONFIRM': "I can help you transfer ₹{amount} to {recipient}. Please confirm.",
                'BALANCE': "Your current balance is ₹{balance}",
                'HISTORY': "Here are your last 3 transactions.",
                'REMINDER': "Reminder set for payment of ₹{amount}.",
                'LOAN': "You have {count} loan(s). Eligible for Personal Loan at 12.5% interest.",
                'HELP': "I'm not sure how to help with that."
            },
            'es-ES': {
                'UNKNOWN': "No entendí ese comando.",
                'MISSING_INFO': "Necesito saber cuánto y a quién enviarlo.",
                'TRANSFER_CONFIRM': "Puedo ayudarte a transferir ₹{amount} a {recipient}. Por favor confirma.",
                'BALANCE': "Tu saldo actual es ₹{balance}",
                'HISTORY': "Aquí están tus últimas 3 transacciones.",
                'REMINDER': "Recordatorio establecido para pago de ₹{amount}.",
                'LOAN': "Tienes {count} préstamo(s). Elegible para préstamo personal al 12.5%.",
                'HELP': "No estoy seguro de cómo ayudar con eso."
            },
            'hi-IN': {
                'UNKNOWN': "Mujhe wo samajh nahi aaya.",
                'MISSING_INFO': "Mujhe janana hai ki kitna aur kise bhejna hai.",
                'TRANSFER_CONFIRM': "Main ₹{amount} {recipient} ko bhejne mein madad kar sakta hoon. Kripya confirm karein.",
                'BALANCE': "Aapka current balance ₹{balance} hai",
                'HISTORY': "Ye rahe aapke pichle 3 transactions.",
                'REMINDER': "₹{amount} ka payment reminder set ho gaya hai.",
                'LOAN': "Aapke paas {count} loan hai. Personal loan ke liye eligible - 12.5% interest.",
                'HELP': "Mujhe nahi pata ki isme kaise madad karoon."
            },
            'fr-FR': {
                'UNKNOWN': "Je n'ai pas compris cette commande.",
                'MISSING_INFO': "J'ai besoin de savoir combien et à qui l'envoyer.",
                'TRANSFER_CONFIRM': "Je peux vous aider à transférer ₹{amount} à {recipient}. Veuillez confirmer.",
                'BALANCE': "Votre solde actuel est de ₹{balance}",
                'HISTORY': "Voici vos 3 dernières transactions.",
                'REMINDER': "Rappel défini pour le paiement de ₹{amount}.",
                'LOAN': "Vous avez {count} prêt(s). Éligible pour un prêt personnel à 12.5%.",
                'HELP': "Je ne suis pas sûr de savoir comment aider avec ça."
            }
        }

    def text_to_digits(self, text):
        """Convert number words to digits (basic implementation)."""
        # Simple mapping for common banking amounts
        multipliers = {'thousand': 1000, 'million': 1000000, 'lakh': 100000, 'crore': 10000000}
        numbers = {
            'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
            'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
            'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50,
            'hundred': 100, 'five hundred': 500
        }
        
        text_lower = text.lower()
        for word, value in multipliers.items():
            if word in text_lower:
                # Very basic handling: "ten thousand" -> 10 * 1000
                parts = text_lower.split(word)
                if parts[0].strip() in numbers:
                    return numbers[parts[0].strip()] * value
                # Handle "10 thousand"
                match = re.search(r'(\d+)\s+' + word, text_lower)
                if match:
                    return float(match.group(1)) * value
                    
        return None

    def extract_amount(self, text):
        """Extract monetary amount from text (digits or words)."""
        # 1. Try word-to-number first
        word_amount = self.text_to_digits(text)
        if word_amount:
            return float(word_amount)

        # 2. Try regex for digits: $500, ₹500, 500 dollars, 500.50
        # Added support for ₹ symbol and Indian comma format (1,00,000)
        match = re.search(r'[₹$]?\s?(\d+(?:,\d{2,3})*(?:\.\d{2})?)', text)
        if match:
            return float(match.group(1).replace(',', ''))
        return None

    def extract_recipient(self, text):
        """Extract recipient name."""
        # Look for "to [Name]" pattern, handling case insensitivity
        # Matches: "to Mom", "to Mr. Shyam", "to Dr. Who"
        # Added support for titles (Mr.|Mrs.|Ms.|Dr.) and periods
        match = re.search(r'(?:to|a|ko|à)\s+((?:(?:Mr\.|Mrs\.|Ms\.|Dr\.)\s+)?[a-zA-Z]+(?:\s[a-zA-Z]+)*)', text, re.IGNORECASE)
        if match:
            # Filter out common non-names if needed
            name = match.group(1).strip()
            if name.lower() not in ['me', 'us', 'bank']:
                return name.title() # Return capitalized
        return None

    def process_command(self, text, language='en-US'):
        """Process natural language text and return intent + entities."""
        text_lower = text.lower()
        
        detected_intent = None
        
        # Priority check: if "transaction" or "history" is present, it's HISTORY
        # This overrides "give" which might be in TRANSFER
        if any(w in text_lower for w in ['transaction', 'history', 'statement', 'last spent']):
            detected_intent = 'TRANSACTION_HISTORY'
        else:
            for intent, patterns in self.intents.items():
                if any(re.search(pattern, text_lower) for pattern in patterns):
                    detected_intent = intent
                    break
        
        # Default to English if language not supported
        lang_responses = self.responses.get(language, self.responses['en-US'])

        if not detected_intent:
            return {"intent": "UNKNOWN", "message": lang_responses['UNKNOWN']}

        response = {"intent": detected_intent}

        if detected_intent == 'TRANSFER_FUNDS':
            amount = self.extract_amount(text)
            recipient = self.extract_recipient(text)
            response['entities'] = {'amount': amount, 'recipient': recipient}
            
            if not amount or not recipient:
                response['missing_info'] = True
                response['message'] = lang_responses['MISSING_INFO']

        return response

    def get_response_text(self, key, language='en-US', **kwargs):
        """Get localized response text."""
        lang_responses = self.responses.get(language, self.responses['en-US'])
        template = lang_responses.get(key, lang_responses['HELP'])
        
        # Fixed string formatting - look for {k} not ${k}
        for k, v in kwargs.items():
            if k == 'balance':
                 template = template.replace(f"{{{k}}}", f"{v:,.2f}")
            else:
                template = template.replace(f"{{{k}}}", str(v))
                
        return template
