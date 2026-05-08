from fastapi import Depends, HTTPException, Request, status
import httpx

from app.config import Settings, get_settings
from app.schemas import AuthUser


async def get_current_user(
    request: Request, settings: Settings = Depends(get_settings)
) -> AuthUser:
    if settings.auth_disabled:
        return AuthUser(
            id=settings.dev_user_id,
            email=settings.dev_user_email,
            full_name="Development User",
        )

    auth_header = request.headers.get("authorization", "")
    scheme, _, token = auth_header.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Supabase access token.",
        )

    if not settings.supabase_url or not settings.supabase_anon_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase auth is not configured on the backend.",
        )

    user_url = f"{settings.supabase_url.rstrip('/')}/auth/v1/user"
    headers = {
        "apikey": settings.supabase_anon_key,
        "Authorization": f"Bearer {token}",
    }

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(user_url, headers=headers)

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Supabase access token.",
        )

    data = response.json()
    metadata = data.get("user_metadata") or {}
    return AuthUser(
        id=data["id"],
        email=data.get("email") or "",
        full_name=metadata.get("full_name") or metadata.get("name") or "",
    )

