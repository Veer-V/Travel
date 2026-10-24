from typing import Optional
from pydantic import BaseModel, Field

try:
    import email_validator
    from pydantic import EmailStr
except ImportError:
    EmailStr = str

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    full_name: Optional[str] = None

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True
