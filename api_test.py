import requests
import json
import unittest
from datetime import datetime

class AcuPressaoAPITest(unittest.TestCase):
    """Test suite for AcuPressão backend API"""
    
    # Base URL from frontend .env
    BASE_URL = "https://4056fc8a-6f77-408a-9a05-e104bf1c8341.preview.emergentagent.com/api"
    
    def test_api_connection(self):
        """Test if the API is accessible"""
        try:
            response = requests.get(f"{self.BASE_URL}/")
            print(f"API connection test: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code == 200:
                print("✅ API is accessible")
            else:
                print("❌ API is not accessible")
        except Exception as e:
            print(f"❌ Error connecting to API: {e}")
            self.fail(f"Error connecting to API: {e}")

if __name__ == "__main__":
    unittest.main()