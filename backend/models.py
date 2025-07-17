from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime
import uuid

# User Models
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_premium: bool = False
    subscription_expires: Optional[datetime] = None

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    is_premium: bool
    subscription_expires: Optional[datetime] = None

# Technique Models
class Technique(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str  # 'craniopuntura' or 'mtc'
    condition: str
    description: str
    instructions: List[str]
    image: str
    duration: int = 60
    pressure: str
    warnings: List[str]
    is_premium: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TechniqueCreate(BaseModel):
    name: str
    category: str
    condition: str
    description: str
    instructions: List[str]
    image: str
    duration: int = 60
    pressure: str
    warnings: List[str]
    is_premium: bool = False

# Session Models
class SessionCreate(BaseModel):
    technique_id: str
    complaint: str
    duration: int
    rating: Optional[int] = None

class Session(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    technique_id: str
    technique_name: str
    complaint: str
    duration: int
    rating: Optional[int] = None
    date: datetime = Field(default_factory=datetime.utcnow)

# Favorites Models
class FavoriteCreate(BaseModel):
    technique_id: str

class Favorite(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    technique_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Statistics Models
class UserStats(BaseModel):
    total_sessions: int
    avg_rating: float
    most_used_complaint: str
    total_time_practiced: int
    streak_days: int
    favorite_techniques: List[str]

class ComplaintStats(BaseModel):
    complaint: str
    count: int
    trending: bool

# Premium Models
class SubscriptionCreate(BaseModel):
    plan: str  # 'monthly' or 'yearly'
    payment_method: str

class Subscription(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    plan: str
    status: str = "active"
    started_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime
    amount_paid: float

# Professional Content Models (Premium Feature)
class ProfessionalContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content_type: str  # 'video', 'article', 'course'
    description: str
    content_url: str
    thumbnail: str
    professional_name: str
    professional_credentials: str
    price: float
    duration_minutes: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Token Models
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse