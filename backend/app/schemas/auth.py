from pydantic import BaseModel, EmailStr
from typing import List, Optional


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    university: str = ""
    major_semester: str = ""
    interests: List[str] = []
    country: str = ""


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    university: str
    major_semester: str
    interests: List[str]
    country: str


class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    university: Optional[str] = None
    major_semester: Optional[str] = None
    interests: Optional[List[str]] = None
    country: Optional[str] = None
