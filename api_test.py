import requests
import json
import unittest
from datetime import datetime

class AcuPressaoAPITest(unittest.TestCase):
    """Test suite for AcuPressão backend API"""
    
    # Base URL from frontend .env
    BASE_URL = "https://429b38d5-6a73-460c-a938-66a7eb9ba46e.preview.emergentagent.com/api"
    
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