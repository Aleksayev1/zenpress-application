import requests
import json
import unittest
import random
import string
from datetime import datetime

class AcuPressaoAPIUpdateTest(unittest.TestCase):
    """Test suite for AcuPressão backend API after updates"""
    
    # Base URL from frontend .env
    BASE_URL = "https://c549d31a-4214-4247-b527-b965adda71c3.preview.emergentagent.com/api"
    
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
        self.assertIn("AcuPressão API", response.json()["message"])
    
    def test_02_seed_techniques(self):
        """Seed updated technique data"""
        print("\n--- Seeding techniques with updated images ---")
        
        response = requests.post(f"{self.BASE_URL}/seed/techniques")
        print(f"Seed response: {response.status_code}")
        print(response.json())
        
        self.assertEqual(response.status_code, 200)
        self.assertIn("message", response.json())
        self.assertIn("Seeded", response.json()["message"])
        self.assertIn("updated images", response.json()["message"])
    
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
    
    def test_05_get_all_techniques(self):
        """Test getting all techniques and verify count"""
        print("\n--- Testing get all techniques and verify count ---")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        response = requests.get(
            f"{self.BASE_URL}/techniques",
            headers=headers
        )
        
        print(f"Get techniques response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Non-premium user should only see non-premium techniques
        non_premium_techniques = [t for t in data if not t["is_premium"]]
        
        print(f"Found {len(data)} techniques (non-premium: {len(non_premium_techniques)})")
        
        # Verify we have the expected number of non-premium techniques
        # According to the seed data, there should be 6 non-premium techniques
        self.assertEqual(len(non_premium_techniques), 6)
        
        # Check image URLs are not the generic ones
        generic_image_urls = [
            "https://images.pexels.com/photos/17108475/pexels-photo-17108475.jpeg",
            "https://images.pexels.com/photos/6076128/pexels-photo-6076128.jpeg",
            "https://images.pexels.com/photos/6076122/pexels-photo-6076122.jpeg"
        ]
        
        for technique in non_premium_techniques:
            print(f"Technique: {technique['name']} - Image: {technique['image']}")
            if technique["category"] == "craniopuntura":
                self.assertNotIn(technique["image"], generic_image_urls, 
                                f"Technique {technique['name']} still has a generic image URL")
    
    def test_06_get_techniques_by_category(self):
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
            print(f"Craniopuntura technique: {technique['name']} - Image: {technique['image']}")
        
        for technique in mtc_data:
            self.assertEqual(technique["category"], "mtc")
            print(f"MTC technique: {technique['name']} - Image: {technique['image']}")
        
        print(f"Found {len(cranio_data)} craniopuntura techniques and {len(mtc_data)} mtc techniques")
        
        # Verify we have the expected number of non-premium techniques in each category
        non_premium_cranio = [t for t in cranio_data if not t["is_premium"]]
        non_premium_mtc = [t for t in mtc_data if not t["is_premium"]]
        
        self.assertEqual(len(non_premium_cranio), 3, "Should have 3 non-premium craniopuntura techniques")
        self.assertEqual(len(non_premium_mtc), 3, "Should have 3 non-premium mtc techniques")
    
    def test_07_upgrade_to_premium(self):
        """Upgrade user to premium to test all techniques"""
        print("\n--- Upgrading user to premium to test all techniques ---")
        
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
        
        # Verify premium status
        response = requests.get(
            f"{self.BASE_URL}/users/me",
            headers=headers
        )
        
        self.assertEqual(response.status_code, 200)
        user_data = response.json()
        
        self.assertEqual(user_data["is_premium"], True)
        self.assertIsNotNone(user_data["subscription_expires"])
    
    def test_08_get_all_techniques_premium(self):
        """Test getting all techniques as premium user and verify count"""
        print("\n--- Testing get all techniques as premium user ---")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        response = requests.get(
            f"{self.BASE_URL}/techniques",
            headers=headers
        )
        
        print(f"Get all techniques response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Count premium and non-premium techniques
        premium_techniques = [t for t in data if t["is_premium"]]
        non_premium_techniques = [t for t in data if not t["is_premium"]]
        
        print(f"Found {len(data)} total techniques")
        print(f"Premium techniques: {len(premium_techniques)}")
        print(f"Non-premium techniques: {len(non_premium_techniques)}")
        
        # Verify we have the expected number of techniques (17 total)
        self.assertEqual(len(data), 17, "Should have 17 total techniques")
        self.assertEqual(len(premium_techniques), 11, "Should have 11 premium techniques")
        self.assertEqual(len(non_premium_techniques), 6, "Should have 6 non-premium techniques")
        
        # Check image URLs for all techniques
        generic_image_urls = [
            "https://images.pexels.com/photos/17108475/pexels-photo-17108475.jpeg",
            "https://images.pexels.com/photos/6076128/pexels-photo-6076128.jpeg",
            "https://images.pexels.com/photos/6076122/pexels-photo-6076122.jpeg",
            "https://images.pexels.com/photos/27730422/pexels-photo-27730422.jpeg",
            "https://images.pexels.com/photos/6193366/pexels-photo-6193366.jpeg"
        ]
        
        # Count techniques by category
        cranio_count = 0
        mtc_count = 0
        
        for technique in data:
            print(f"Technique: {technique['name']} - Category: {technique['category']} - Image: {technique['image']}")
            
            # Count by category
            if technique["category"] == "craniopuntura":
                cranio_count += 1
            elif technique["category"] == "mtc":
                mtc_count += 1
            
            # Check image URLs
            if technique["category"] == "craniopuntura":
                self.assertNotIn(technique["image"], generic_image_urls, 
                                f"Technique {technique['name']} still has a generic image URL")
        
        print(f"Craniopuntura techniques: {cranio_count}")
        print(f"MTC techniques: {mtc_count}")
        
        # Verify category counts
        self.assertEqual(cranio_count, 9, "Should have 9 craniopuntura techniques")
        self.assertEqual(mtc_count, 8, "Should have 8 mtc techniques")
    
    def test_09_verify_technique_details(self):
        """Test getting specific technique details"""
        print("\n--- Testing technique details ---")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        # Get all techniques first
        response = requests.get(
            f"{self.BASE_URL}/techniques",
            headers=headers
        )
        
        self.assertEqual(response.status_code, 200)
        techniques = response.json()
        
        # Select one technique from each category
        cranio_technique = next((t for t in techniques if t["category"] == "craniopuntura"), None)
        mtc_technique = next((t for t in techniques if t["category"] == "mtc"), None)
        
        # Test craniopuntura technique details
        if cranio_technique:
            response = requests.get(
                f"{self.BASE_URL}/techniques/{cranio_technique['id']}",
                headers=headers
            )
            
            print(f"Get craniopuntura technique details response: {response.status_code}")
            
            self.assertEqual(response.status_code, 200)
            technique_data = response.json()
            
            self.assertEqual(technique_data["id"], cranio_technique["id"])
            self.assertEqual(technique_data["category"], "craniopuntura")
            self.assertIsNotNone(technique_data["image"])
            self.assertIsNotNone(technique_data["instructions"])
            self.assertGreater(len(technique_data["instructions"]), 0)
            
            print(f"Craniopuntura technique details: {technique_data['name']}")
            print(f"Image: {technique_data['image']}")
            print(f"Instructions: {technique_data['instructions']}")
        
        # Test mtc technique details
        if mtc_technique:
            response = requests.get(
                f"{self.BASE_URL}/techniques/{mtc_technique['id']}",
                headers=headers
            )
            
            print(f"Get mtc technique details response: {response.status_code}")
            
            self.assertEqual(response.status_code, 200)
            technique_data = response.json()
            
            self.assertEqual(technique_data["id"], mtc_technique["id"])
            self.assertEqual(technique_data["category"], "mtc")
            self.assertIsNotNone(technique_data["image"])
            self.assertIsNotNone(technique_data["instructions"])
            self.assertGreater(len(technique_data["instructions"]), 0)
            
            print(f"MTC technique details: {technique_data['name']}")
            print(f"Image: {technique_data['image']}")
            print(f"Instructions: {technique_data['instructions']}")

if __name__ == "__main__":
    unittest.main(verbosity=2)