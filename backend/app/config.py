
import os
from typing import List


class Settings:


    APP_TITLE: str = os.getenv("QKD_APP_TITLE", "QKD Simulator API")
    APP_DESCRIPTION: str = os.getenv(
        "QKD_APP_DESCRIPTION",
        "Quantum Key Distribution Simulator and Demonstrator",
    )
    APP_VERSION: str = os.getenv("QKD_APP_VERSION", "1.0.0")


    CORS_ALLOW_ORIGINS: List[str] = (
        [
            origin.strip()
            for origin in os.getenv("QKD_CORS_ALLOW_ORIGINS", "*").split(",")
            if origin.strip()
        ]
        or ["*"]
    )
    CORS_ALLOW_CREDENTIALS: bool = os.getenv("QKD_CORS_ALLOW_CREDENTIALS", "true").lower() == "true"
    CORS_ALLOW_METHODS: List[str] = [
        method.strip()
        for method in os.getenv("QKD_CORS_ALLOW_METHODS", "*").split(",")
        if method.strip()
    ] or ["*"]
    CORS_ALLOW_HEADERS: List[str] = [
        header.strip()
        for header in os.getenv("QKD_CORS_ALLOW_HEADERS", "*").split(",")
        if header.strip()
    ] or ["*"]


settings = Settings()


