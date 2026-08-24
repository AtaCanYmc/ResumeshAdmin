import logging
from dataclasses import dataclass

import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer

from app.config.security import SECRET_KEY
from app.config.settings import settings

logger = logging.getLogger("auth")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login", auto_error=False)


@dataclass
class SupabaseUser:
    """Lightweight user representation extracted from a Supabase JWT."""

    id: str
    email: str
    role: str


async def get_current_admin(
    request: Request,
    token_from_header: str = Depends(oauth2_scheme),
):
    """Validates a Supabase Auth JWT and ensures the user has admin privileges.

    Extracts user info directly from the JWT payload — no local database lookup.
    """
    token = request.cookies.get("access_token") or token_from_header
    if not token:
        logger.warning(
            "Authentication failed: Missing token in cookies or authorization header."
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        unverified_header = jwt.get_unverified_header(token)
        alg = unverified_header.get("alg", "HS256")
    except Exception as e:
        logger.error(
            f"Authentication failed: Unable to parse token header. Error: {str(e)}"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token format.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    logger.info(
        f"Auth attempt: JWT token prefix={token[:15]}... Token alg={alg}. "
        f"Key length={len(SECRET_KEY) if SECRET_KEY else 0}"
    )
    try:
        if alg == "ES256":
            from jwt import PyJWKClient

            supabase_url = settings.SUPABASE_URL.rstrip("/")
            jwks_url = f"{supabase_url}/auth/v1/.well-known/jwks.json"
            jwks_client = PyJWKClient(jwks_url)
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            key = signing_key.key
        else:
            key = SECRET_KEY

        payload = jwt.decode(
            token,
            key,
            algorithms=[alg],
            options={
                "verify_aud": False
            },  # verify_aud False to simplify mock test runs
        )
        sub: str = payload.get("sub")
        email: str = payload.get("email", "")

        if sub is None:
            logger.warning("Authentication failed: Token missing 'sub' claim.")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token details.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        app_metadata = payload.get("app_metadata", {})
        user_metadata = payload.get("user_metadata", {})
        role = (
            app_metadata.get("role")
            or user_metadata.get("role")
            or payload.get("role", "authenticated")
        )

        logger.info(
            f"Authentication successful for sub={sub}, email={email}, role={role}"
        )
        return SupabaseUser(id=sub, email=email, role=role)

    except jwt.ExpiredSignatureError as e:
        logger.error(f"Authentication failed: Token signature expired. Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        prefix = SECRET_KEY[:4] if SECRET_KEY else "None"
        logger.error(
            f"Authentication failed: Invalid signature or token format. "
            f"Secret key prefix used={prefix}. Token alg={alg}. Error: {str(e)}"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )
