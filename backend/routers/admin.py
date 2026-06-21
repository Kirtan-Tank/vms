import re
from fastapi import APIRouter, HTTPException, Header, Depends
from supabase import Client
from models import CreateUserRequest
from deps import get_db

router = APIRouter(prefix="/admin", tags=["admin"])

PHONE_DOMAIN = "@vms.local"


def normalize_phone(raw: str) -> str:
    digits = re.sub(r"\D", "", raw)
    if len(digits) == 12 and digits.startswith("91"):
        digits = digits[2:]
    if len(digits) == 11 and digits.startswith("0"):
        digits = digits[1:]
    return digits


async def require_admin(authorization: str = Header(None), db: Client = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.split(" ", 1)[1]
    try:
        resp = db.auth.get_user(token)
        user_id = resp.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    result = db.table("users").select("id, role, property_id").eq("id", user_id).single().execute()
    if not result.data or result.data["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return result.data


@router.post("/users", status_code=201)
async def create_user(
    body: CreateUserRequest,
    caller: dict = Depends(require_admin),
    db: Client = Depends(get_db),
):
    if body.role not in ("guard", "host"):
        raise HTTPException(status_code=400, detail="Role must be 'guard' or 'host'")

    phone = normalize_phone(body.phone)
    if len(phone) != 10:
        raise HTTPException(status_code=400, detail="Phone number must be 10 digits after removing country code")

    email = phone + PHONE_DOMAIN

    try:
        resp = db.auth.admin.create_user({
            "email": email,
            "password": body.password,
            "email_confirm": True,
        })
    except Exception as e:
        msg = str(e)
        if "already" in msg.lower() or "duplicate" in msg.lower():
            raise HTTPException(status_code=409, detail="A user with this phone number already exists")
        raise HTTPException(status_code=400, detail=msg)

    new_user_id = resp.user.id

    db.table("users").update({
        "name": body.name,
        "role": body.role,
        "property_id": caller["property_id"],
    }).eq("id", new_user_id).execute()

    return {"id": new_user_id, "phone": phone, "name": body.name, "role": body.role}
