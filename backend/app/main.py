from typing import List, Optional

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .supabase_client import get_supabase

app = FastAPI(title="Lean Flow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _client():
    try:
        return get_supabase()
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


def _payload(model: BaseModel) -> dict:
    if hasattr(model, "model_dump"):
        return model.model_dump()
    return model.dict()


def _handle(response):
    if getattr(response, "error", None):
        raise HTTPException(status_code=400, detail=str(response.error))
    return response.data


def _get_user_id(authorization: Optional[str] = Header(None)) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing auth token.")
    token = authorization.strip()
    if token.lower().startswith("bearer "):
        token = token[7:].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Invalid auth token.")
    response = _client().auth.get_user(token)
    if getattr(response, "error", None):
        raise HTTPException(status_code=401, detail="Invalid auth token.")
    user = getattr(response, "user", None)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid auth token.")
    return user.id


class RecipeIn(BaseModel):
    name: str
    servings: Optional[str] = None
    method: Optional[str] = None
    tags: Optional[str] = None
    ingredients: str
    calories: Optional[float] = 0
    protein: Optional[float] = 0
    carbs: Optional[float] = 0
    fat: Optional[float] = 0


class MealLogIn(BaseModel):
    meal: str
    items: List[str]
    calories: Optional[float] = 0
    protein: Optional[float] = 0
    carbs: Optional[float] = 0
    fat: Optional[float] = 0
    log_date: Optional[str] = None


class BodyEntryIn(BaseModel):
    log_date: Optional[str] = None
    weight: Optional[float] = None
    body_fat: Optional[float] = None
    waist: Optional[float] = None
    sleep: Optional[float] = None


class ProfileIn(BaseModel):
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    age: Optional[int] = None
    sex: Optional[str] = None
    activity_level: Optional[str] = None
    goal_weight: Optional[float] = None


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/recipes")
def list_recipes(current_user_id: str = Depends(_get_user_id)):
    response = (
        _client()
        .table("recipes")
        .select("*")
        .eq("user_id", current_user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return _handle(response)


@app.post("/recipes")
def create_recipe(payload: RecipeIn, current_user_id: str = Depends(_get_user_id)):
    data = _payload(payload)
    data["user_id"] = current_user_id
    response = _client().table("recipes").insert(data).execute()
    return _handle(response)


@app.delete("/recipes/{recipe_id}")
def delete_recipe(recipe_id: str, current_user_id: str = Depends(_get_user_id)):
    response = (
        _client()
        .table("recipes")
        .delete()
        .eq("id", recipe_id)
        .eq("user_id", current_user_id)
        .execute()
    )
    return _handle(response)


@app.get("/meal-logs")
def list_meal_logs(
    log_date: Optional[str] = None, current_user_id: str = Depends(_get_user_id)
):
    query = (
        _client().table("meal_logs").select("*").eq("user_id", current_user_id)
    )
    if log_date:
        query = query.eq("log_date", log_date)
    response = query.order("created_at", desc=True).execute()
    return _handle(response)


@app.post("/meal-logs")
def create_meal_log(payload: MealLogIn, current_user_id: str = Depends(_get_user_id)):
    data = _payload(payload)
    data["user_id"] = current_user_id
    if not data.get("log_date"):
        data.pop("log_date", None)
    response = _client().table("meal_logs").insert(data).execute()
    return _handle(response)


@app.delete("/meal-logs/{meal_id}")
def delete_meal_log(meal_id: str, current_user_id: str = Depends(_get_user_id)):
    response = (
        _client()
        .table("meal_logs")
        .delete()
        .eq("id", meal_id)
        .eq("user_id", current_user_id)
        .execute()
    )
    return _handle(response)


@app.get("/body-entries")
def list_body_entries(
    log_date: Optional[str] = None, current_user_id: str = Depends(_get_user_id)
):
    query = (
        _client()
        .table("body_entries")
        .select("*")
        .eq("user_id", current_user_id)
    )
    if log_date:
        query = query.eq("log_date", log_date)
    response = query.order("created_at", desc=True).execute()
    return _handle(response)


@app.post("/body-entries")
def create_body_entry(payload: BodyEntryIn, current_user_id: str = Depends(_get_user_id)):
    data = _payload(payload)
    data["user_id"] = current_user_id
    if not data.get("log_date"):
        data.pop("log_date", None)
    response = _client().table("body_entries").insert(data).execute()
    return _handle(response)


@app.delete("/body-entries/{entry_id}")
def delete_body_entry(
    entry_id: str, current_user_id: str = Depends(_get_user_id)
):
    response = (
        _client()
        .table("body_entries")
        .delete()
        .eq("id", entry_id)
        .eq("user_id", current_user_id)
        .execute()
    )
    return _handle(response)


@app.get("/profiles/me")
def get_profile(current_user_id: str = Depends(_get_user_id)):
    response = (
        _client()
        .table("profiles")
        .select("*")
        .eq("user_id", current_user_id)
        .limit(1)
        .execute()
    )
    data = _handle(response)
    return data[0] if data else None


@app.post("/profiles")
def upsert_profile(payload: ProfileIn, current_user_id: str = Depends(_get_user_id)):
    data = _payload(payload)
    data["user_id"] = current_user_id
    response = (
        _client()
        .table("profiles")
        .upsert(data, on_conflict="user_id")
        .execute()
    )
    return _handle(response)
