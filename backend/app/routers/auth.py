from fastapi import APIRouter, Depends, Response

from app.services.auth_service import SupabaseUser, get_current_admin

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"message": "Successfully logged out"}


@router.get("/verify")
async def verify_token(current_admin: SupabaseUser = Depends(get_current_admin)):
    return {"email": current_admin.email, "role": current_admin.role}
