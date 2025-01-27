from pydantic import BaseModel, Field, field_validator
from typing import Literal, Union, List, Optional, Dict
from typing_extensions import Annotated

class RequestModel(BaseModel):
    device_type: Literal["Телефон", "Компьютер", "Ноутбук", "Принтер", "Сканер", "МФУ", "Шрэдэр", "Ламинатор", "Компьютерная переферия", "Монитор"]
    breakdown: str = Field(max_length=50)
    description: str = Field(max_length=500)
    repair_method: Literal["В сервисе", "Мастер на дом"]

class PutRequest(BaseModel):
    status: Literal["waiting", "at work", "completed", "cancelled"]
    warranty_period: str = Field(max_length=50)
    price: int = Field(le=1000000)
    email: str = Field(max_length=100, pattern="^\S+@\S+\.\S+$")

class User(BaseModel):
    username: str = Field(max_length=100)
    password: str = Field(max_length=100)
    email: str = Field(max_length=100, pattern="^\S+@\S+\.\S+$")
    phone_number: str = Field(pattern="^8[0-9]{10}$")

    @field_validator("password")
    def check_password(cls, value):
        value = str(value)
        if len(value) < 8:
            raise ValueError("Password must have at least 8 characters.")
        if not any(c.isupper() for c in value):
            raise ValueError("Password must have at least one uppercase letter.")
        if not any(c.islower() for c in value):
            raise ValueError("Password must have at least one lowercase letter.")
        if not any(c.isdigit() for c in value):
            raise ValueError("Password must have at least one digit.")
        if not any(c in '#?!@$%^&*-' for c in value):
            raise ValueError("Password must have at least one special character.")
        return value

class Login(BaseModel):
    email: str = Field(max_length=100, pattern="^\S+@\S+\.\S+$")
    password: str = Field(max_length=100)

class RefreshToken(BaseModel):
    refresh_token: str

class ResetPasswordEmail(BaseModel):
    email: str = Field(max_length=100, pattern="^\S+@\S+\.\S+$")

class ResetPassword(BaseModel):
    password: str = Field(max_length=100)

    @field_validator("password")
    def check_password(cls, value):
        value = str(value)
        if len(value) < 8:
            raise ValueError("Password must have at least 8 characters.")
        if not any(c.isupper() for c in value):
            raise ValueError("Password must have at least one uppercase letter.")
        if not any(c.islower() for c in value):
            raise ValueError("Password must have at least one lowercase letter.")
        if not any(c.isdigit() for c in value):
            raise ValueError("Password must have at least one digit.")
        if not any(c in '#?!@$%^&*-' for c in value):
            raise ValueError("Password must have at least one special character.")
        return value