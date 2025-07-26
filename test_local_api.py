import requests
import json
import unittest
from datetime import datetime

class AcuPressaoAPITest(unittest.TestCase):
    """Test suite for AcuPressão backend API"""
    
    # Base URL for local testing
    BASE_URL = "http://localhost:8001/api"
    
    # Test user credentials
    test_user = {
        "name": f"Test User {datetime.now().strftime('%Y%m%d%H%M%S')}",
        "email": f"test_{datetime.now().strftime('%Y%m%d%H%M%S')}@example.com",
        "password": "TestPassword123!"
    }
    
    access_token = None
    user_id = None
    
    def test_01_root_endpoint(self):
        """Test root endpoint"""
        print("\n--- Testing root endpoint ---")
        
        response = requests.get(f"{self.BASE_URL}/")
        print(f"Root endpoint response: {response.status_code}")
        print(response.json())
        
        self.assertEqual(response.status_code, 200)
        self.assertIn("message", response.json())
    
    def test_02_register_user(self):
        """Test user registration"""
        print("\n--- Testing user registration ---")
        
        response = requests.post(
            f"{self.BASE_URL}/auth/register",
            json=self.test_user
        )
        
        print(f"Register response: {response.status_code}")
        print(response.json())
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Save token for future requests
        self.__class__.access_token = data["access_token"]
        self.__class__.user_id = data["user"]["id"]
        
        print(f"Registered user: {data['user']['name']} (ID: {data['user']['id']})")
        self.assertIsNotNone(data["access_token"])
        self.assertEqual(data["user"]["email"], self.test_user["email"])
        self.assertEqual(data["user"]["is_premium"], False)
    
    def test_03_login_user(self):
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
        print(response.json())
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Update token
        self.__class__.access_token = data["access_token"]
        
        self.assertIsNotNone(data["access_token"])
        self.assertEqual(data["user"]["email"], self.test_user["email"])
    
    def test_04_get_current_user(self):
        """Test getting current user info"""
        print("\n--- Testing get current user ---")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        response = requests.get(
            f"{self.BASE_URL}/users/me",
            headers=headers
        )
        
        print(f"Get user response: {response.status_code}")
        print(response.json())
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertEqual(data["id"], self.user_id)
        self.assertEqual(data["email"], self.test_user["email"])
        self.assertEqual(data["name"], self.test_user["name"])

if __name__ == "__main__":
    unittest.main(verbosity=2)