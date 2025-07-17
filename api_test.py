import requests
import json
import unittest
from datetime import datetime

class AcuPressaoAPITest(unittest.TestCase):
    """Test suite for AcuPressão backend API"""
    
    # Base URL from frontend .env
    BASE_URL = "https://748086f4-225c-48d2-ab08-693c2bafb41d.preview.emergentagent.com/api"
    
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