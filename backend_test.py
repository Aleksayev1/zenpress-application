import requests
import json
import time
import unittest
import random
import string
from datetime import datetime

class AcuPressaoAPITest(unittest.TestCase):
    """Test suite for AcuPressão backend API"""
    
    # Base URL from frontend .env
    BASE_URL = "https://7c91efa5-eccf-49fb-bbc9-fe44ce8fab17.preview.emergentagent.com/api"
    
    # Test user credentials
    test_user = {
        "name": f"Test User {datetime.now().strftime('%Y%m%d%H%M%S')}",
        "email": f"test_{datetime.now().strftime('%Y%m%d%H%M%S')}@example.com",
        "password": "TestPassword123!"
    }
    
    access_token = None
    user_id = None
    technique_ids = []
    favorite_technique_id = None
    session_id = None
    
    def test_01_root_endpoint(self):
        """Test root endpoint"""
        print("\n--- Testing root endpoint ---")
        
        response = requests.get(f"{self.BASE_URL}/")
        print(f"Root endpoint response: {response.status_code}")
        print(response.json())
        
        self.assertEqual(response.status_code, 200)
        self.assertIn("message", response.json())
    
    def test_02_seed_techniques(self):
        """Seed initial technique data"""
        print("\n--- Seeding techniques ---")
        
        response = requests.post(f"{self.BASE_URL}/seed/techniques")
        print(f"Seed response: {response.status_code}")
        print(response.json())
        
        # Even if techniques are already seeded, we should get a 200 response
        self.assertEqual(response.status_code, 200)
    
    def test_03_register_user(self):
        """Test user registration"""
        print("\n--- Testing user registration ---")
        
        response = requests.post(
            f"{self.BASE_URL}/auth/register",
            json=self.test_user
        )
        
        print(f"Register response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Save token for future requests
        self.__class__.access_token = data["access_token"]
        self.__class__.user_id = data["user"]["id"]
        
        print(f"Registered user: {data['user']['name']} (ID: {data['user']['id']})")
        self.assertIsNotNone(data["access_token"])
        self.assertEqual(data["user"]["email"], self.test_user["email"])
        self.assertEqual(data["user"]["is_premium"], False)
    
    def test_04_login_user(self):
        """Test user login"""
        print("\n--- Testing user login ---")
        
        login_data = {
            "email": self.test_user["email"],
            "password": self.test_user["password"]
        }
        
        response = requests.post(
            f"{self.BASE_URL}/auth/login",
            json=login_data
        )
        
        print(f"Login response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Update token
        self.__class__.access_token = data["access_token"]
        
        self.assertIsNotNone(data["access_token"])
        self.assertEqual(data["user"]["email"], self.test_user["email"])
    
    def test_05_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        print("\n--- Testing login with invalid credentials ---")
        
        login_data = {
            "email": self.test_user["email"],
            "password": "WrongPassword123!"
        }
        
        response = requests.post(
            f"{self.BASE_URL}/auth/login",
            json=login_data
        )
        
        print(f"Invalid login response: {response.status_code}")
        
        self.assertEqual(response.status_code, 401)
    
    def test_06_get_current_user(self):
        """Test getting current user info"""
        print("\n--- Testing get current user ---")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        response = requests.get(
            f"{self.BASE_URL}/users/me",
            headers=headers
        )
        
        print(f"Get user response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertEqual(data["id"], self.user_id)
        self.assertEqual(data["email"], self.test_user["email"])
        self.assertEqual(data["name"], self.test_user["name"])
    
    def test_07_get_techniques(self):
        """Test getting all techniques"""
        print("\n--- Testing get all techniques ---")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        response = requests.get(
            f"{self.BASE_URL}/techniques",
            headers=headers
        )
        
        print(f"Get techniques response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Save technique IDs for later tests
        self.__class__.technique_ids = [technique["id"] for technique in data]
        
        # Non-premium user should only see non-premium techniques
        for technique in data:
            self.assertEqual(technique["is_premium"], False)
        
        print(f"Found {len(data)} techniques")
        self.assertGreater(len(data), 0)
    
    def test_08_get_techniques_by_category(self):
        """Test getting techniques filtered by category"""
        print("\n--- Testing get techniques by category ---")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        # Test craniopuntura category
        response = requests.get(
            f"{self.BASE_URL}/techniques?category=craniopuntura",
            headers=headers
        )
        
        print(f"Get craniopuntura techniques response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        cranio_data = response.json()
        
        # Test mtc category
        response = requests.get(
            f"{self.BASE_URL}/techniques?category=mtc",
            headers=headers
        )
        
        print(f"Get mtc techniques response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        mtc_data = response.json()
        
        # Verify categories
        for technique in cranio_data:
            self.assertEqual(technique["category"], "craniopuntura")
        
        for technique in mtc_data:
            self.assertEqual(technique["category"], "mtc")
        
        print(f"Found {len(cranio_data)} craniopuntura techniques and {len(mtc_data)} mtc techniques")
    
    def test_09_get_technique_by_id(self):
        """Test getting a specific technique by ID"""
        print("\n--- Testing get technique by ID ---")
        
        if not self.technique_ids:
            self.skipTest("No technique IDs available")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        technique_id = self.technique_ids[0]
        
        response = requests.get(
            f"{self.BASE_URL}/techniques/{technique_id}",
            headers=headers
        )
        
        print(f"Get technique {technique_id} response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertEqual(data["id"], technique_id)
        print(f"Retrieved technique: {data['name']}")
    
    def test_10_get_nonexistent_technique(self):
        """Test getting a non-existent technique"""
        print("\n--- Testing get non-existent technique ---")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        fake_id = "nonexistent-id-12345"
        
        response = requests.get(
            f"{self.BASE_URL}/techniques/{fake_id}",
            headers=headers
        )
        
        print(f"Get non-existent technique response: {response.status_code}")
        
        self.assertEqual(response.status_code, 404)
    
    def test_11_create_session(self):
        """Test creating a practice session"""
        print("\n--- Testing create session ---")
        
        if not self.technique_ids:
            self.skipTest("No technique IDs available")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        technique_id = self.technique_ids[0]
        
        session_data = {
            "technique_id": technique_id,
            "complaint": "Dor de cabeça",
            "duration": 300,  # 5 minutes
            "rating": 4
        }
        
        response = requests.post(
            f"{self.BASE_URL}/sessions",
            headers=headers,
            json=session_data
        )
        
        print(f"Create session response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.__class__.session_id = data["id"]
        
        self.assertEqual(data["technique_id"], technique_id)
        self.assertEqual(data["complaint"], session_data["complaint"])
        self.assertEqual(data["duration"], session_data["duration"])
        self.assertEqual(data["rating"], session_data["rating"])
        print(f"Created session ID: {data['id']}")
    
    def test_12_get_user_sessions(self):
        """Test getting user's practice history"""
        print("\n--- Testing get user sessions ---")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        response = requests.get(
            f"{self.BASE_URL}/sessions",
            headers=headers
        )
        
        print(f"Get sessions response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertGreater(len(data), 0)
        self.assertEqual(data[0]["id"], self.session_id)
        print(f"Found {len(data)} sessions")
    
    def test_13_add_favorite(self):
        """Test adding a technique to favorites"""
        print("\n--- Testing add favorite ---")
        
        if not self.technique_ids:
            self.skipTest("No technique IDs available")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        technique_id = self.technique_ids[0]
        self.__class__.favorite_technique_id = technique_id
        
        favorite_data = {
            "technique_id": technique_id
        }
        
        response = requests.post(
            f"{self.BASE_URL}/favorites",
            headers=headers,
            json=favorite_data
        )
        
        print(f"Add favorite response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertEqual(data["technique_id"], technique_id)
        print(f"Added technique {technique_id} to favorites")
    
    def test_14_get_favorites(self):
        """Test getting user's favorite techniques"""
        print("\n--- Testing get favorites ---")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        response = requests.get(
            f"{self.BASE_URL}/favorites",
            headers=headers
        )
        
        print(f"Get favorites response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertGreater(len(data), 0)
        favorite_ids = [fav["id"] for fav in data]
        self.assertIn(self.favorite_technique_id, favorite_ids)
        print(f"Found {len(data)} favorites")
    
    def test_15_add_duplicate_favorite(self):
        """Test adding a duplicate favorite"""
        print("\n--- Testing add duplicate favorite ---")
        
        if not self.favorite_technique_id:
            self.skipTest("No favorite technique ID available")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        favorite_data = {
            "technique_id": self.favorite_technique_id
        }
        
        response = requests.post(
            f"{self.BASE_URL}/favorites",
            headers=headers,
            json=favorite_data
        )
        
        print(f"Add duplicate favorite response: {response.status_code}")
        
        self.assertEqual(response.status_code, 400)
    
    def test_16_remove_favorite(self):
        """Test removing a technique from favorites"""
        print("\n--- Testing remove favorite ---")
        
        if not self.favorite_technique_id:
            self.skipTest("No favorite technique ID available")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        response = requests.delete(
            f"{self.BASE_URL}/favorites/{self.favorite_technique_id}",
            headers=headers
        )
        
        print(f"Remove favorite response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertEqual(data["message"], "Favorite removed")
        print(f"Removed technique {self.favorite_technique_id} from favorites")
    
    def test_17_get_user_stats(self):
        """Test getting user statistics"""
        print("\n--- Testing get user stats ---")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        response = requests.get(
            f"{self.BASE_URL}/users/stats",
            headers=headers
        )
        
        print(f"Get user stats response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertGreaterEqual(data["total_sessions"], 1)
        self.assertEqual(data["most_used_complaint"], "Dor de cabeça")
        self.assertGreaterEqual(data["total_time_practiced"], 300)  # At least 5 minutes
        print(f"User stats: {data}")
    
    def test_18_get_complaint_stats(self):
        """Test getting global complaint statistics"""
        print("\n--- Testing get complaint stats ---")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        response = requests.get(
            f"{self.BASE_URL}/stats/complaints",
            headers=headers
        )
        
        print(f"Get complaint stats response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Should have at least our complaint
        self.assertGreaterEqual(len(data), 1)
        print(f"Found {len(data)} complaint stats")
    
    def test_19_create_subscription(self):
        """Test creating a premium subscription"""
        print("\n--- Testing create subscription ---")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        subscription_data = {
            "plan": "monthly",
            "payment_method": "credit_card"
        }
        
        response = requests.post(
            f"{self.BASE_URL}/subscription/create",
            headers=headers,
            json=subscription_data
        )
        
        print(f"Create subscription response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertEqual(data["plan"], "monthly")
        self.assertEqual(data["status"], "active")
        self.assertEqual(data["user_id"], self.user_id)
        print(f"Created subscription: {data['id']}")
    
    def test_20_verify_premium_status(self):
        """Test verifying premium status after subscription"""
        print("\n--- Testing verify premium status ---")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        response = requests.get(
            f"{self.BASE_URL}/users/me",
            headers=headers
        )
        
        print(f"Get user response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertEqual(data["is_premium"], True)
        self.assertIsNotNone(data["subscription_expires"])
        print(f"User is premium: {data['is_premium']}, expires: {data['subscription_expires']}")
    
    def test_21_access_premium_content(self):
        """Test accessing premium content after subscription"""
        print("\n--- Testing access premium content ---")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        # Get all techniques including premium ones
        response = requests.get(
            f"{self.BASE_URL}/techniques",
            headers=headers
        )
        
        print(f"Get all techniques response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Find premium techniques
        premium_techniques = [t for t in data if t["is_premium"]]
        
        self.assertGreater(len(premium_techniques), 0)
        print(f"Found {len(premium_techniques)} premium techniques")
        
        # Try to access a premium technique
        if premium_techniques:
            premium_id = premium_techniques[0]["id"]
            response = requests.get(
                f"{self.BASE_URL}/techniques/{premium_id}",
                headers=headers
            )
            
            print(f"Get premium technique response: {response.status_code}")
            
            self.assertEqual(response.status_code, 200)
            technique_data = response.json()
            
            self.assertEqual(technique_data["id"], premium_id)
            self.assertEqual(technique_data["is_premium"], True)
            print(f"Successfully accessed premium technique: {technique_data['name']}")

    def test_22_create_crypto_payment_monthly_btc(self):
        """Test creating crypto payment for monthly subscription with BTC"""
        print("\n--- Testing create crypto payment (monthly BTC) ---")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        payment_data = {
            "subscription_type": "premium_monthly",
            "crypto_currency": "BTC"
        }
        
        response = requests.post(
            f"{self.BASE_URL}/crypto/create-payment",
            headers=headers,
            json=payment_data
        )
        
        print(f"Create crypto payment response: {response.status_code}")
        print(f"Response text: {response.text}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Save transaction ID for later tests
        self.__class__.crypto_transaction_id = data["transaction_id"]
        
        # Verify response structure
        self.assertIn("transaction_id", data)
        self.assertEqual(data["crypto_currency"], "BTC")
        self.assertIn("wallet_address", data)
        self.assertEqual(data["amount_usd"], 5.99)
        self.assertEqual(data["amount_brl"], 29.90)
        self.assertIn("qr_code", data)
        self.assertTrue(data["qr_code"].startswith("data:image/png;base64,"))
        self.assertIn("expires_at", data)
        self.assertIn("instructions", data)
        
        print(f"Created crypto payment: {data['transaction_id']}")
        print(f"Wallet address: {data['wallet_address']}")
        print(f"Amount: ${data['amount_usd']} USD / R${data['amount_brl']} BRL")

    def test_23_create_crypto_payment_yearly_usdt_trc20(self):
        """Test creating crypto payment for yearly subscription with USDT TRC20"""
        print("\n--- Testing create crypto payment (yearly USDT TRC20) ---")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        payment_data = {
            "subscription_type": "premium_yearly",
            "crypto_currency": "USDT_TRC20"
        }
        
        response = requests.post(
            f"{self.BASE_URL}/crypto/create-payment",
            headers=headers,
            json=payment_data
        )
        
        print(f"Create crypto payment response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify response structure for yearly subscription
        self.assertIn("transaction_id", data)
        self.assertEqual(data["crypto_currency"], "USDT_TRC20")
        self.assertIn("wallet_address", data)
        self.assertEqual(data["amount_usd"], 59.99)
        self.assertEqual(data["amount_brl"], 299.90)
        self.assertIn("qr_code", data)
        self.assertTrue(data["qr_code"].startswith("data:image/png;base64,"))
        
        print(f"Created yearly crypto payment: {data['transaction_id']}")
        print(f"Amount: ${data['amount_usd']} USD / R${data['amount_brl']} BRL")

    def test_24_create_crypto_payment_usdt_erc20(self):
        """Test creating crypto payment with USDT ERC20"""
        print("\n--- Testing create crypto payment (USDT ERC20) ---")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        payment_data = {
            "subscription_type": "premium_monthly",
            "crypto_currency": "USDT_ERC20"
        }
        
        response = requests.post(
            f"{self.BASE_URL}/crypto/create-payment",
            headers=headers,
            json=payment_data
        )
        
        print(f"Create crypto payment response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify USDT ERC20 specific response
        self.assertEqual(data["crypto_currency"], "USDT_ERC20")
        self.assertIn("wallet_address", data)
        
        print(f"Created USDT ERC20 payment: {data['transaction_id']}")

    def test_25_create_crypto_payment_invalid_subscription(self):
        """Test creating crypto payment with invalid subscription type"""
        print("\n--- Testing create crypto payment with invalid subscription ---")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        payment_data = {
            "subscription_type": "invalid_subscription",
            "crypto_currency": "BTC"
        }
        
        response = requests.post(
            f"{self.BASE_URL}/crypto/create-payment",
            headers=headers,
            json=payment_data
        )
        
        print(f"Invalid subscription response: {response.status_code}")
        
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("detail", data)

    def test_26_create_crypto_payment_invalid_currency(self):
        """Test creating crypto payment with unsupported crypto currency"""
        print("\n--- Testing create crypto payment with invalid currency ---")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        payment_data = {
            "subscription_type": "premium_monthly",
            "crypto_currency": "INVALID_COIN"
        }
        
        response = requests.post(
            f"{self.BASE_URL}/crypto/create-payment",
            headers=headers,
            json=payment_data
        )
        
        print(f"Invalid currency response: {response.status_code}")
        
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("detail", data)

    def test_27_get_crypto_payment_status(self):
        """Test getting crypto payment status"""
        print("\n--- Testing get crypto payment status ---")
        
        if not hasattr(self.__class__, 'crypto_transaction_id'):
            self.skipTest("No crypto transaction ID available")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        response = requests.get(
            f"{self.BASE_URL}/crypto/payment-status/{self.crypto_transaction_id}",
            headers=headers
        )
        
        print(f"Get payment status response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify status response structure
        self.assertEqual(data["transaction_id"], self.crypto_transaction_id)
        self.assertEqual(data["status"], "pending")
        self.assertIn("status_message", data)
        self.assertIn("created_at", data)
        self.assertIn("expires_at", data)
        self.assertIn("crypto_currency", data)
        self.assertIn("amount_usd", data)
        
        print(f"Payment status: {data['status']} - {data['status_message']}")

    def test_28_get_crypto_payment_status_invalid_id(self):
        """Test getting crypto payment status with invalid transaction ID"""
        print("\n--- Testing get crypto payment status with invalid ID ---")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        fake_transaction_id = "invalid-transaction-id-12345"
        
        response = requests.get(
            f"{self.BASE_URL}/crypto/payment-status/{fake_transaction_id}",
            headers=headers
        )
        
        print(f"Invalid transaction ID response: {response.status_code}")
        
        self.assertEqual(response.status_code, 404)
        data = response.json()
        self.assertIn("detail", data)

    def test_29_confirm_crypto_payment(self):
        """Test confirming crypto payment"""
        print("\n--- Testing confirm crypto payment ---")
        
        if not hasattr(self.__class__, 'crypto_transaction_id'):
            self.skipTest("No crypto transaction ID available")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        confirmation_data = {
            "tx_hash": "1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890",
            "message": "Pagamento realizado via Binance. Aguardando confirmação."
        }
        
        response = requests.post(
            f"{self.BASE_URL}/crypto/confirm-payment/{self.crypto_transaction_id}",
            headers=headers,
            json=confirmation_data
        )
        
        print(f"Confirm payment response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify confirmation response
        self.assertEqual(data["status"], "confirmed")
        self.assertIn("message", data)
        self.assertIn("verification_time", data)
        
        print(f"Payment confirmed: {data['message']}")

    def test_30_verify_payment_status_after_confirmation(self):
        """Test verifying payment status changed to user_confirmed"""
        print("\n--- Testing payment status after confirmation ---")
        
        if not hasattr(self.__class__, 'crypto_transaction_id'):
            self.skipTest("No crypto transaction ID available")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        response = requests.get(
            f"{self.BASE_URL}/crypto/payment-status/{self.crypto_transaction_id}",
            headers=headers
        )
        
        print(f"Get updated payment status response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify status changed to user_confirmed
        self.assertEqual(data["status"], "user_confirmed")
        self.assertIn("status_message", data)
        
        print(f"Updated payment status: {data['status']} - {data['status_message']}")

    def test_31_confirm_crypto_payment_invalid_id(self):
        """Test confirming crypto payment with invalid transaction ID"""
        print("\n--- Testing confirm crypto payment with invalid ID ---")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        fake_transaction_id = "invalid-transaction-id-12345"
        
        confirmation_data = {
            "tx_hash": "fake_hash",
            "message": "Test confirmation"
        }
        
        response = requests.post(
            f"{self.BASE_URL}/crypto/confirm-payment/{fake_transaction_id}",
            headers=headers,
            json=confirmation_data
        )
        
        print(f"Invalid transaction ID confirmation response: {response.status_code}")
        
        self.assertEqual(response.status_code, 404)
        data = response.json()
        self.assertIn("detail", data)

    def test_32_confirm_already_processed_payment(self):
        """Test confirming an already processed payment"""
        print("\n--- Testing confirm already processed payment ---")
        
        if not hasattr(self.__class__, 'crypto_transaction_id'):
            self.skipTest("No crypto transaction ID available")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        confirmation_data = {
            "tx_hash": "another_hash",
            "message": "Trying to confirm again"
        }
        
        response = requests.post(
            f"{self.BASE_URL}/crypto/confirm-payment/{self.crypto_transaction_id}",
            headers=headers,
            json=confirmation_data
        )
        
        print(f"Already processed payment response: {response.status_code}")
        
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("detail", data)
        self.assertIn("processado", data["detail"].lower())

    def test_33_get_user_crypto_payments(self):
        """Test getting user's crypto payment history"""
        print("\n--- Testing get user crypto payments ---")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        response = requests.get(
            f"{self.BASE_URL}/crypto/my-payments",
            headers=headers
        )
        
        print(f"Get user crypto payments response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify response structure
        self.assertIn("payments", data)
        self.assertIn("total", data)
        self.assertGreater(data["total"], 0)
        
        # Verify our payment is in the list
        payment_ids = [p["transaction_id"] for p in data["payments"]]
        if hasattr(self.__class__, 'crypto_transaction_id'):
            self.assertIn(self.crypto_transaction_id, payment_ids)
        
        print(f"Found {data['total']} crypto payments for user")

    def test_34_crypto_payment_without_auth(self):
        """Test crypto payment endpoints without authentication"""
        print("\n--- Testing crypto payment without authentication ---")
        
        payment_data = {
            "subscription_type": "premium_monthly",
            "crypto_currency": "BTC"
        }
        
        response = requests.post(
            f"{self.BASE_URL}/crypto/create-payment",
            json=payment_data
        )
        
        print(f"Unauthenticated crypto payment response: {response.status_code}")
        
        self.assertEqual(response.status_code, 401)

    def test_35_get_techniques_without_auth(self):
        """Test getting techniques WITHOUT authentication - should return only non-premium techniques"""
        print("\n--- Testing get techniques WITHOUT authentication ---")
        
        # No Authorization header - testing unauthenticated access
        response = requests.get(f"{self.BASE_URL}/techniques")
        
        print(f"Get techniques without auth response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Should return only non-premium techniques
        for technique in data:
            self.assertEqual(technique["is_premium"], False, 
                           f"Technique '{technique['name']}' is premium but returned for unauthenticated user")
        
        print(f"Found {len(data)} non-premium techniques for unauthenticated user")
        self.assertGreater(len(data), 0, "Should have at least some non-premium techniques")
        
        # Save some technique IDs for further testing
        self.__class__.non_premium_technique_ids = [t["id"] for t in data if not t["is_premium"]]

    def test_36_get_techniques_by_category_without_auth(self):
        """Test getting techniques by category WITHOUT authentication"""
        print("\n--- Testing get techniques by category WITHOUT authentication ---")
        
        # Test craniopuntura category without auth
        response = requests.get(f"{self.BASE_URL}/techniques?category=craniopuntura")
        
        print(f"Get craniopuntura techniques without auth response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        cranio_data = response.json()
        
        # Should only return non-premium craniopuntura techniques
        for technique in cranio_data:
            self.assertEqual(technique["category"], "craniopuntura")
            self.assertEqual(technique["is_premium"], False, 
                           f"Premium craniopuntura technique '{technique['name']}' returned for unauthenticated user")
        
        # Test mtc category without auth
        response = requests.get(f"{self.BASE_URL}/techniques?category=mtc")
        
        print(f"Get mtc techniques without auth response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        mtc_data = response.json()
        
        # Should only return non-premium mtc techniques
        for technique in mtc_data:
            self.assertEqual(technique["category"], "mtc")
            self.assertEqual(technique["is_premium"], False, 
                           f"Premium mtc technique '{technique['name']}' returned for unauthenticated user")
        
        print(f"Found {len(cranio_data)} non-premium craniopuntura and {len(mtc_data)} non-premium mtc techniques")

    def test_37_get_non_premium_technique_by_id_without_auth(self):
        """Test getting a non-premium technique by ID WITHOUT authentication"""
        print("\n--- Testing get non-premium technique by ID WITHOUT authentication ---")
        
        if not hasattr(self.__class__, 'non_premium_technique_ids') or not self.non_premium_technique_ids:
            # Fallback: get techniques first
            response = requests.get(f"{self.BASE_URL}/techniques")
            if response.status_code == 200:
                techniques = response.json()
                non_premium_techniques = [t for t in techniques if not t["is_premium"]]
                if non_premium_techniques:
                    technique_id = non_premium_techniques[0]["id"]
                else:
                    self.skipTest("No non-premium techniques available")
            else:
                self.skipTest("Cannot get techniques list")
        else:
            technique_id = self.non_premium_technique_ids[0]
        
        # Access non-premium technique without auth
        response = requests.get(f"{self.BASE_URL}/techniques/{technique_id}")
        
        print(f"Get non-premium technique {technique_id} without auth response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertEqual(data["id"], technique_id)
        self.assertEqual(data["is_premium"], False)
        print(f"Successfully accessed non-premium technique: {data['name']}")

    def test_38_get_premium_technique_by_id_without_auth(self):
        """Test getting a premium technique by ID WITHOUT authentication - should return 403"""
        print("\n--- Testing get premium technique by ID WITHOUT authentication ---")
        
        # First, get all techniques with auth to find a premium one
        headers = {"Authorization": f"Bearer {self.access_token}"}
        response = requests.get(f"{self.BASE_URL}/techniques", headers=headers)
        
        if response.status_code != 200:
            self.skipTest("Cannot get techniques list with auth")
        
        techniques = response.json()
        premium_techniques = [t for t in techniques if t["is_premium"]]
        
        if not premium_techniques:
            self.skipTest("No premium techniques available")
        
        premium_technique_id = premium_techniques[0]["id"]
        
        # Try to access premium technique without auth - should get 403
        response = requests.get(f"{self.BASE_URL}/techniques/{premium_technique_id}")
        
        print(f"Get premium technique {premium_technique_id} without auth response: {response.status_code}")
        
        self.assertEqual(response.status_code, 403)
        data = response.json()
        
        self.assertIn("detail", data)
        self.assertIn("Premium subscription required", data["detail"])
        print(f"Correctly blocked access to premium technique: {data['detail']}")

    def test_39_verify_mongodb_has_non_premium_techniques(self):
        """Test to verify MongoDB has techniques with is_premium=false"""
        print("\n--- Verifying MongoDB has non-premium techniques ---")
        
        # Get all techniques without auth to verify non-premium ones exist
        response = requests.get(f"{self.BASE_URL}/techniques")
        
        print(f"Get all techniques response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify we have non-premium techniques
        non_premium_count = len([t for t in data if not t["is_premium"]])
        
        self.assertGreater(non_premium_count, 0, "MongoDB should have at least some non-premium techniques")
        
        # Verify we have both categories
        cranio_non_premium = len([t for t in data if t["category"] == "craniopuntura" and not t["is_premium"]])
        mtc_non_premium = len([t for t in data if t["category"] == "mtc" and not t["is_premium"]])
        
        self.assertGreater(cranio_non_premium, 0, "Should have non-premium craniopuntura techniques")
        self.assertGreater(mtc_non_premium, 0, "Should have non-premium mtc techniques")
        
        print(f"MongoDB verification: {non_premium_count} total non-premium techniques")
        print(f"  - {cranio_non_premium} craniopuntura non-premium")
        print(f"  - {mtc_non_premium} mtc non-premium")

    def test_40_verify_seed_data_executed(self):
        """Test to verify seed data was executed and contains expected techniques"""
        print("\n--- Verifying seed data was executed ---")
        
        # Get all techniques with auth to see both premium and non-premium
        headers = {"Authorization": f"Bearer {self.access_token}"}
        response = requests.get(f"{self.BASE_URL}/techniques", headers=headers)
        
        print(f"Get all techniques with auth response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify we have the expected techniques from seed data
        technique_names = [t["name"] for t in data]
        
        # Check for some expected non-premium techniques
        expected_non_premium = [
            "Ponto Yintang (EX-HN3)",
            "Ponto Baihui (GV20)", 
            "Pontos Taiyang (EX-HN5)",
            "Ponto Hegu (LI4)",
            "Ponto Zusanli (ST36)",
            "Ponto Shenmen (HE7)"
        ]
        
        for expected_name in expected_non_premium:
            self.assertIn(expected_name, technique_names, 
                         f"Expected non-premium technique '{expected_name}' not found in seed data")
        
        # Check for some expected premium techniques
        expected_premium = [
            "Ponto Yamamoto A (YNSA)",
            "Protocolo Local-Distal: Dor Cervical",
            "Protocolo Avançado de Craniopuntura"
        ]
        
        for expected_name in expected_premium:
            self.assertIn(expected_name, technique_names, 
                         f"Expected premium technique '{expected_name}' not found in seed data")
        
        # Verify premium/non-premium distribution
        premium_count = len([t for t in data if t["is_premium"]])
        non_premium_count = len([t for t in data if not t["is_premium"]])
        
        print(f"Seed data verification: {len(data)} total techniques")
        print(f"  - {non_premium_count} non-premium techniques")
        print(f"  - {premium_count} premium techniques")
        
        self.assertGreater(non_premium_count, 0, "Should have non-premium techniques from seed")
        self.assertGreater(premium_count, 0, "Should have premium techniques from seed")

    def test_41_create_review_valid(self):
        """Test creating a review with valid data"""
        print("\n--- Testing create review with valid data ---")
        
        if not self.technique_ids:
            self.skipTest("No technique IDs available")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        technique_id = self.technique_ids[0]
        
        review_data = {
            "technique_id": technique_id,
            "rating": 5,
            "comment": "Excelente técnica! Ajudou muito com minha dor de cabeça.",
            "session_duration": 120
        }
        
        response = requests.post(
            f"{self.BASE_URL}/reviews/create",
            headers=headers,
            json=review_data
        )
        
        print(f"Create review response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Save review ID for later tests
        self.__class__.review_id = data["id"]
        
        self.assertEqual(data["technique_id"], technique_id)
        self.assertEqual(data["rating"], 5)
        self.assertEqual(data["comment"], review_data["comment"])
        self.assertEqual(data["session_duration"], 120)
        self.assertEqual(data["user_id"], self.user_id)
        self.assertIn("created_at", data)
        
        print(f"Created review ID: {data['id']} with rating {data['rating']}")

    def test_42_create_review_invalid_rating(self):
        """Test creating a review with invalid rating"""
        print("\n--- Testing create review with invalid rating ---")
        
        if not self.technique_ids:
            self.skipTest("No technique IDs available")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        technique_id = self.technique_ids[0]
        
        # Test rating > 5
        review_data = {
            "technique_id": technique_id,
            "rating": 6,
            "comment": "Test review"
        }
        
        response = requests.post(
            f"{self.BASE_URL}/reviews/create",
            headers=headers,
            json=review_data
        )
        
        print(f"Invalid rating (6) response: {response.status_code}")
        self.assertEqual(response.status_code, 400)
        
        # Test rating < 1
        review_data["rating"] = 0
        
        response = requests.post(
            f"{self.BASE_URL}/reviews/create",
            headers=headers,
            json=review_data
        )
        
        print(f"Invalid rating (0) response: {response.status_code}")
        self.assertEqual(response.status_code, 400)

    def test_43_create_review_invalid_technique(self):
        """Test creating a review with invalid technique ID"""
        print("\n--- Testing create review with invalid technique ID ---")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        review_data = {
            "technique_id": "nonexistent-technique-id",
            "rating": 4,
            "comment": "Test review"
        }
        
        response = requests.post(
            f"{self.BASE_URL}/reviews/create",
            headers=headers,
            json=review_data
        )
        
        print(f"Invalid technique ID response: {response.status_code}")
        self.assertEqual(response.status_code, 404)

    def test_44_create_review_without_auth(self):
        """Test creating a review without authentication"""
        print("\n--- Testing create review without authentication ---")
        
        if not self.technique_ids:
            self.skipTest("No technique IDs available")
        
        technique_id = self.technique_ids[0]
        
        review_data = {
            "technique_id": technique_id,
            "rating": 4,
            "comment": "Test review"
        }
        
        response = requests.post(
            f"{self.BASE_URL}/reviews/create",
            json=review_data
        )
        
        print(f"Unauthenticated review creation response: {response.status_code}")
        self.assertEqual(response.status_code, 401)

    def test_45_create_multiple_reviews(self):
        """Test creating multiple reviews for statistics"""
        print("\n--- Testing create multiple reviews for statistics ---")
        
        if not self.technique_ids:
            self.skipTest("No technique IDs available")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        # Create reviews with different ratings
        reviews_data = [
            {"technique_id": self.technique_ids[0], "rating": 4, "comment": "Boa técnica"},
            {"technique_id": self.technique_ids[0], "rating": 2, "comment": "Não funcionou bem"},
            {"technique_id": self.technique_ids[0], "rating": 3, "comment": "Neutro"},
        ]
        
        if len(self.technique_ids) > 1:
            reviews_data.extend([
                {"technique_id": self.technique_ids[1], "rating": 5, "comment": "Excelente!"},
                {"technique_id": self.technique_ids[1], "rating": 1, "comment": "Muito ruim"},
            ])
        
        created_reviews = 0
        for review_data in reviews_data:
            response = requests.post(
                f"{self.BASE_URL}/reviews/create",
                headers=headers,
                json=review_data
            )
            
            if response.status_code == 200:
                created_reviews += 1
        
        print(f"Created {created_reviews} additional reviews for testing")
        self.assertGreater(created_reviews, 0)

    def test_46_get_review_stats_public(self):
        """Test getting general review statistics (public endpoint)"""
        print("\n--- Testing get review statistics (public) ---")
        
        # Test without authentication (public endpoint)
        response = requests.get(f"{self.BASE_URL}/reviews/stats")
        
        print(f"Get review stats response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify response structure
        required_fields = [
            "total_reviews", "positive_reviews", "neutral_reviews", 
            "negative_reviews", "average_rating", "positive_percentage", 
            "negative_percentage"
        ]
        
        for field in required_fields:
            self.assertIn(field, data)
        
        # Should have at least our created reviews
        self.assertGreaterEqual(data["total_reviews"], 1)
        self.assertGreaterEqual(data["average_rating"], 0)
        self.assertGreaterEqual(data["positive_percentage"], 0)
        
        print(f"Review stats: {data['total_reviews']} total, {data['positive_reviews']} positive, avg {data['average_rating']}")

    def test_47_get_technique_reviews_valid(self):
        """Test getting reviews for a specific technique"""
        print("\n--- Testing get technique reviews ---")
        
        if not self.technique_ids:
            self.skipTest("No technique IDs available")
        
        technique_id = self.technique_ids[0]
        
        response = requests.get(f"{self.BASE_URL}/reviews/technique/{technique_id}")
        
        print(f"Get technique reviews response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify response structure
        required_fields = [
            "technique_id", "technique_name", "total_reviews", 
            "average_rating", "positive_reviews", "negative_reviews", 
            "latest_reviews"
        ]
        
        for field in required_fields:
            self.assertIn(field, data)
        
        self.assertEqual(data["technique_id"], technique_id)
        self.assertIsInstance(data["latest_reviews"], list)
        self.assertLessEqual(len(data["latest_reviews"]), 5)  # Max 5 latest reviews
        
        print(f"Technique {technique_id}: {data['total_reviews']} reviews, avg {data['average_rating']}")

    def test_48_get_technique_reviews_invalid(self):
        """Test getting reviews for invalid technique ID"""
        print("\n--- Testing get technique reviews with invalid ID ---")
        
        fake_technique_id = "nonexistent-technique-id"
        
        response = requests.get(f"{self.BASE_URL}/reviews/technique/{fake_technique_id}")
        
        print(f"Invalid technique reviews response: {response.status_code}")
        
        self.assertEqual(response.status_code, 404)

    def test_49_get_developer_analytics_premium_required(self):
        """Test developer analytics endpoint requires premium access"""
        print("\n--- Testing developer analytics requires premium ---")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        response = requests.get(
            f"{self.BASE_URL}/reviews/analytics",
            headers=headers
        )
        
        print(f"Developer analytics response: {response.status_code}")
        
        # Should work since we have premium subscription from earlier tests
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify response structure
        required_fields = [
            "overall_stats", "daily_reviews", "technique_rankings", 
            "recent_feedback", "trends"
        ]
        
        for field in required_fields:
            self.assertIn(field, data)
        
        self.assertIsInstance(data["daily_reviews"], list)
        self.assertIsInstance(data["technique_rankings"], list)
        self.assertIsInstance(data["recent_feedback"], list)
        
        print(f"Analytics: {len(data['daily_reviews'])} daily entries, {len(data['technique_rankings'])} techniques")

    def test_50_get_developer_analytics_with_days_filter(self):
        """Test developer analytics with different day filters"""
        print("\n--- Testing developer analytics with day filters ---")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        # Test different day filters
        for days in [7, 30, 90]:
            response = requests.get(
                f"{self.BASE_URL}/reviews/analytics?days={days}",
                headers=headers
            )
            
            print(f"Analytics for {days} days response: {response.status_code}")
            
            self.assertEqual(response.status_code, 200)
            data = response.json()
            
            # Should have daily_reviews for the specified number of days
            self.assertEqual(len(data["daily_reviews"]), days)
            
            print(f"  - {days} days: {len(data['daily_reviews'])} daily entries")

    def test_51_get_developer_analytics_without_auth(self):
        """Test developer analytics without authentication"""
        print("\n--- Testing developer analytics without authentication ---")
        
        response = requests.get(f"{self.BASE_URL}/reviews/analytics")
        
        print(f"Unauthenticated analytics response: {response.status_code}")
        
        self.assertEqual(response.status_code, 401)

    def test_52_get_user_reviews(self):
        """Test getting current user's reviews"""
        print("\n--- Testing get user reviews ---")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        response = requests.get(
            f"{self.BASE_URL}/reviews/my-reviews",
            headers=headers
        )
        
        print(f"Get user reviews response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify response structure
        self.assertIn("reviews", data)
        self.assertIn("total", data)
        self.assertIsInstance(data["reviews"], list)
        
        # Should have at least our created reviews
        self.assertGreater(data["total"], 0)
        
        # All reviews should belong to current user
        for review in data["reviews"]:
            self.assertEqual(review["user_id"], self.user_id)
        
        print(f"Found {data['total']} reviews for current user")

    def test_53_delete_review_own(self):
        """Test deleting own review"""
        print("\n--- Testing delete own review ---")
        
        if not hasattr(self.__class__, 'review_id'):
            self.skipTest("No review ID available")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        response = requests.delete(
            f"{self.BASE_URL}/reviews/{self.review_id}",
            headers=headers
        )
        
        print(f"Delete own review response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertIn("message", data)
        print(f"Deleted review: {data['message']}")

    def test_54_delete_review_nonexistent(self):
        """Test deleting non-existent review"""
        print("\n--- Testing delete non-existent review ---")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        fake_review_id = "nonexistent-review-id"
        
        response = requests.delete(
            f"{self.BASE_URL}/reviews/{fake_review_id}",
            headers=headers
        )
        
        print(f"Delete non-existent review response: {response.status_code}")
        
        self.assertEqual(response.status_code, 404)

    def test_55_delete_review_without_auth(self):
        """Test deleting review without authentication"""
        print("\n--- Testing delete review without authentication ---")
        
        fake_review_id = "some-review-id"
        
        response = requests.delete(f"{self.BASE_URL}/reviews/{fake_review_id}")
        
        print(f"Unauthenticated delete review response: {response.status_code}")
        
        self.assertEqual(response.status_code, 401)

    def test_56_verify_mongodb_reviews_collection(self):
        """Test to verify reviews are saved in MongoDB"""
        print("\n--- Verifying MongoDB reviews collection ---")
        
        # Get user reviews to verify data persistence
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        response = requests.get(
            f"{self.BASE_URL}/reviews/my-reviews",
            headers=headers
        )
        
        print(f"Get user reviews for MongoDB verification: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Should have reviews in the database
        self.assertGreater(data["total"], 0)
        
        # Verify review structure matches expected MongoDB schema
        if data["reviews"]:
            review = data["reviews"][0]
            required_fields = [
                "id", "user_id", "technique_id", "technique_name", 
                "rating", "comment", "created_at", "session_duration"
            ]
            
            for field in required_fields:
                self.assertIn(field, review)
            
            # Verify data types
            self.assertIsInstance(review["rating"], int)
            self.assertTrue(1 <= review["rating"] <= 5)
            self.assertIsInstance(review["comment"], str)
            self.assertIsInstance(review["session_duration"], int)
            
            print(f"MongoDB verification: Reviews collection working correctly")
            print(f"  - Sample review: {review['rating']} stars, technique: {review['technique_name']}")

    def test_57_launch_strategy_endpoint(self):
        """Test the new launch strategy endpoint"""
        print("\n--- Testing launch strategy endpoint ---")
        
        response = requests.get(f"{self.BASE_URL}/launch-strategy")
        
        print(f"Launch strategy response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify response structure
        required_fields = ["title", "description", "steps", "benefits", "considerations"]
        for field in required_fields:
            self.assertIn(field, data)
        
        # Verify steps structure
        self.assertIsInstance(data["steps"], list)
        self.assertGreater(len(data["steps"]), 0)
        
        # Check first step structure
        if data["steps"]:
            step = data["steps"][0]
            step_fields = ["step", "title", "description", "details"]
            for field in step_fields:
                self.assertIn(field, step)
        
        print(f"Launch strategy: {data['title']}")
        print(f"  - {len(data['steps'])} steps")
        print(f"  - {len(data['benefits'])} benefits")
        print(f"  - {len(data['considerations'])} considerations")

    def test_58_stripe_payment_products_endpoint(self):
        """Test Stripe payment products endpoint (should work despite placeholder key)"""
        print("\n--- Testing Stripe payment products endpoint ---")
        
        response = requests.get(f"{self.BASE_URL}/payments/v1/products")
        
        print(f"Payment products response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Should return list of products
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)
        
        # Check product structure
        if data:
            product = data[0]
            product_fields = ["id", "name", "description", "price", "type"]
            for field in product_fields:
                self.assertIn(field, product)
        
        print(f"Found {len(data)} payment products")

    def test_59_stripe_checkout_session_failure(self):
        """Test Stripe checkout session creation (should fail with placeholder key)"""
        print("\n--- Testing Stripe checkout session (expected failure) ---")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        checkout_data = {
            "product_id": "premium_monthly",
            "product_type": "premium_subscription",
            "quantity": 1,
            "origin_url": "https://example.com"
        }
        
        response = requests.post(
            f"{self.BASE_URL}/payments/v1/checkout/session",
            headers=headers,
            json=checkout_data
        )
        
        print(f"Stripe checkout response: {response.status_code}")
        
        # Should fail due to invalid Stripe key
        self.assertEqual(response.status_code, 500)
        data = response.json()
        self.assertIn("detail", data)
        
        print(f"Expected failure: {data['detail']}")

    def test_60_crypto_currencies_endpoint(self):
        """Test crypto currencies endpoint"""
        print("\n--- Testing crypto currencies endpoint ---")
        
        # This endpoint might not exist, but let's test if it does
        response = requests.get(f"{self.BASE_URL}/crypto/currencies")
        
        print(f"Crypto currencies response: {response.status_code}")
        
        # If endpoint doesn't exist, that's fine - we'll note it
        if response.status_code == 404:
            print("Crypto currencies endpoint not implemented (expected)")
        else:
            # If it exists, verify structure
            self.assertEqual(response.status_code, 200)
            data = response.json()
            print(f"Crypto currencies data: {data}")

    def test_61_spotify_login_endpoint(self):
        """Test Spotify login endpoint"""
        print("\n--- Testing Spotify login endpoint ---")
        
        response = requests.get(f"{self.BASE_URL}/spotify/login")
        
        print(f"Spotify login response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Should return auth URL
        self.assertIn("auth_url", data)
        self.assertTrue(data["auth_url"].startswith("https://accounts.spotify.com"))
        
        print(f"Spotify auth URL generated successfully")

if __name__ == "__main__":
    unittest.main(verbosity=2)