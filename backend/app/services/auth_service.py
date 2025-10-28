from google.auth.transport import requests
from google.oauth2 import id_token
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
import os
from sqlalchemy.orm import Session
from ..models.database import User, get_db
from ..models.schemas import UserCreate, UserResponse, TokenData
import json

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "your-google-client-id")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    
    def __init__(self):
        self.secret_key = SECRET_KEY
        self.algorithm = ALGORITHM
        self.access_token_expire_minutes = ACCESS_TOKEN_EXPIRE_MINUTES
        self.google_client_id = GOOGLE_CLIENT_ID
    
    def verify_google_token(self, token: str) -> Optional[dict]:
        try:
            # Verify the token
            idinfo = id_token.verify_oauth2_token(
                token, 
                requests.Request(), 
                self.google_client_id
            )
            
            # Verify the issuer
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise ValueError('Wrong issuer.')
            
            return {
                'google_id': idinfo['sub'],
                'email': idinfo['email'],
                'name': idinfo['name'],
                'picture': idinfo.get('picture', ''),
                'email_verified': idinfo.get('email_verified', False)
            }
            
        except ValueError as e:
            return None
    
    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def verify_token(self, token: str) -> Optional[TokenData]:
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            user_id: int = payload.get("sub")
            email: str = payload.get("email")
            if user_id is None or email is None:
                return None
            token_data = TokenData(user_id=user_id, email=email)
            return token_data
        except JWTError:
            return None
    
    def get_or_create_user(self, db: Session, google_user_info: dict) -> User:
        # Try to find existing user by Google ID
        user = db.query(User).filter(User.google_id == google_user_info['google_id']).first()
        
        if user:
            # Update last login
            user.last_login = datetime.utcnow()
            db.commit()
            db.refresh(user)
            return user
        
        # Create new user
        new_user = User(
            google_id=google_user_info['google_id'],
            email=google_user_info['email'],
            name=google_user_info['name'],
            picture=google_user_info.get('picture', ''),
            last_login=datetime.utcnow()
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    
    def authenticate_user(self, db: Session, google_token: str) -> Optional[dict]:
        # Verify Google token
        google_user_info = self.verify_google_token(google_token)
        if not google_user_info:
            return None
        
        # Get or create user
        user = self.get_or_create_user(db, google_user_info)
        
        # Create access token
        access_token_expires = timedelta(minutes=self.access_token_expire_minutes)
        access_token = self.create_access_token(
            data={"sub": str(user.id), "email": user.email}, 
            expires_delta=access_token_expires
        )
        
        # Return authentication result
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": self.access_token_expire_minutes * 60,
            "user": {
                "id": user.id,
                "google_id": user.google_id,
                "email": user.email,
                "name": user.name,
                "picture": user.picture,
                "is_active": user.is_active,
                "created_at": user.created_at.isoformat(),
                "last_login": user.last_login.isoformat() if user.last_login else None
            }
        }
    
    def get_current_user(self, db: Session, token: str) -> Optional[User]:
        token_data = self.verify_token(token)
        if token_data is None:
            return None
        
        user = db.query(User).filter(User.id == token_data.user_id).first()
        return user


auth_service = AuthService()
