from nlp_service import NLPService

nlp = NLPService()

test_sentences = [
    "Send ₹5000 to Mr. Shyam.",
    "Transfer 10000 to mom",
    "Pay 500 to John",
    "Send money to dad",
    "Check balance",
    "What is my account balance?"
]

print("Testing NLP Service...")
for text in test_sentences:
    result = nlp.process_command(text)
    print(f"\nInput: '{text}'")
    print(f"Intent: {result.get('intent')}")
    if 'entities' in result:
        print(f"Entities: {result['entities']}")
