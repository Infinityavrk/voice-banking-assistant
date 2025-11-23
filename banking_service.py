import datetime

# Mock Database
# Structure: { username: { email: str, balance: float, transactions: list, loans: list } }
mock_db = {
    "test_user": {
        "email": "test@example.com",
        "balance": 5420.50,
        "account_number": "XXXX-XXXX-XXXX-1234",
        "transactions": [
            {"id": 1, "date": "2023-10-25", "desc": "Grocery Store", "amount": -150.00, "type": "debit"},
            {"id": 2, "date": "2023-10-24", "desc": "Salary Deposit", "amount": 3000.00, "type": "credit"},
            {"id": 3, "date": "2023-10-22", "desc": "Netflix Subscription", "amount": -15.99, "type": "debit"},
            {"id": 4, "date": "2023-10-20", "desc": "Electric Bill", "amount": -120.50, "type": "debit"},
        ],
        "loans": [
            {"type": "Personal Loan", "amount": 10000, "rate": "12.5%", "status": "Active"},
            {"type": "Home Loan", "amount": 250000, "rate": "7.2%", "status": "Eligible"}
        ]
    }
}

def create_user(username, email):
    """Initialize a new user profile with default data."""
    if username not in mock_db:
        mock_db[username] = {
            "email": email,
            "balance": 1000.00,
            "account_number": f"XXXX-XXXX-XXXX-{len(mock_db)+1000}",
            "transactions": [
                {"id": 1, "date": datetime.date.today().isoformat(), "desc": "Welcome Bonus", "amount": 1000.00, "type": "credit"}
            ],
            "loans": [
                {"type": "Personal Loan", "amount": 5000, "rate": "12.5%", "status": "Eligible"}
            ]
        }
    else:
        # Update email if user exists (e.g. re-enrollment)
        mock_db[username]['email'] = email
    return mock_db[username]

def get_user_data(username):
    """Retrieve all banking data for a user."""
    # For demo purposes, if user doesn't exist, create a default profile
    if username not in mock_db:
        return create_user(username, f"{username}@example.com")
    return mock_db[username]

def transfer_funds(username, recipient, amount):
    """Execute a fund transfer."""
    user_data = get_user_data(username)
    
    if user_data['balance'] < amount:
        return {"success": False, "message": "Insufficient funds"}
    
    # Deduct from sender
    user_data['balance'] -= amount
    user_data['transactions'].insert(0, {
        "id": len(user_data['transactions']) + 1,
        "date": datetime.date.today().isoformat(),
        "desc": f"Transfer to {recipient}",
        "amount": -amount,
        "type": "debit"
    })
    
    # Add to recipient (if exists in our mock DB, otherwise just simulate)
    if recipient in mock_db:
        mock_db[recipient]['balance'] += amount
        mock_db[recipient]['transactions'].insert(0, {
            "id": len(mock_db[recipient]['transactions']) + 1,
            "date": datetime.date.today().isoformat(),
            "desc": f"Transfer from {username}",
            "amount": amount,
            "type": "credit"
        })
        
    return {
        "success": True, 
        "message": f"Successfully transferred ${amount} to {recipient}",
        "new_balance": user_data['balance']
    }
