from dotenv import load_dotenv
load_dotenv()

import os
import uuid
import json
import random
import logging
import bcrypt
import jwt
import httpx
from datetime import datetime, timezone, timedelta, date
from typing import Optional, List
from fastapi import FastAPI, APIRouter, Request, Response, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from emergentintegrations.llm.chat import LlmChat, UserMessage

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("up-analytics")

mongo_client = AsyncIOMotorClient(os.environ["MONGO_URL"])
db = mongo_client[os.environ["DB_NAME"]]

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"
EMERGENT_LLM_KEY = os.environ["EMERGENT_LLM_KEY"]

app = FastAPI(title="UP Analytics API")
api = APIRouter(prefix="/api")


def now_utc():
    return datetime.now(timezone.utc)


def iso(dt=None):
    return (dt or now_utc()).isoformat()


# ------------------- AUTH HELPERS -------------------

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": now_utc() + timedelta(days=7), "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def set_auth_cookie(response: Response, token: str, key: str = "access_token"):
    response.set_cookie(key=key, value=token, httponly=True, secure=True, samesite="none", max_age=7 * 24 * 3600, path="/")


async def get_current_user(request: Request) -> dict:
    # 1. Google-managed session token
    session_token = request.cookies.get("session_token")
    auth_header = request.headers.get("Authorization", "")
    bearer = auth_header[7:] if auth_header.startswith("Bearer ") else None

    for tok in [session_token, bearer]:
        if not tok:
            continue
        session_doc = await db.user_sessions.find_one({"session_token": tok}, {"_id": 0})
        if session_doc:
            expires_at = session_doc["expires_at"]
            if isinstance(expires_at, str):
                expires_at = datetime.fromisoformat(expires_at)
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if expires_at < now_utc():
                raise HTTPException(status_code=401, detail="Sessão expirada")
            user = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0, "password_hash": 0})
            if user:
                return user

    # 2. JWT access token
    token = request.cookies.get("access_token") or bearer
    if not token:
        raise HTTPException(status_code=401, detail="Não autenticado")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Token inválido")
        user = await db.users.find_one({"user_id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Usuário não encontrado")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")


# ------------------- DEMO DATA SEEDING -------------------

POST_TEMPLATES = [
    ("3 Hacks de Social Media que você não conhecia 🚀 #marketing", "REELS"),
    ("Estratégia vs. Postagem Aleatória: O que realmente funciona em 2026? 📊", "FEED"),
    ("Como estruturar um funil de conteúdo magnético no Reels 🧲", "REELS"),
    ("Métricas de vaidade vs métricas reais: pare de comemorar likes 💡", "FEED"),
    ("Bastidores da estratégia que triplicou o alcance de um cliente 🔥", "REELS"),
    ("Checklist do post perfeito: salve para não esquecer ✅", "CAROUSEL_ALBUM"),
    ("O erro nº1 que trava o crescimento do seu perfil ⚠️", "REELS"),
    ("Como transformar seguidores em clientes com CTA estratégico 💰", "FEED"),
    ("Tendências de conteúdo para dominar o Instagram este mês 📈", "REELS"),
]


async def seed_user_demo_data(user_id: str):
    existing = await db.instagram_accounts.find_one({"user_id": user_id})
    if existing:
        return
    account_id = str(uuid.uuid4())
    followers = random.randint(11500, 13500)
    account = {
        "id": account_id,
        "user_id": user_id,
        "client_id": None,
        "instagram_user_id": f"ig_{uuid.uuid4().hex[:10]}",
        "username": "upideias",
        "name": "UP Ideias",
        "profile_picture_url": None,
        "account_type": "BUSINESS",
        "followers_count": followers,
        "media_count": len(POST_TEMPLATES),
        "access_token": "demo_token",
        "token_expires_at": iso(now_utc() + timedelta(days=60)),
        "connected_at": iso(),
        "disconnected_at": None,
        "status": "connected",
        "created_at": iso(),
        "updated_at": iso(),
    }
    await db.instagram_accounts.insert_one(dict(account))

    # 30 days of daily metrics with realistic growth trend
    metrics = []
    base_followers = followers - random.randint(300, 500)
    base_reach = random.randint(9000, 12000)
    for i in range(30):
        day = date.today() - timedelta(days=29 - i)
        growth = i / 29
        reach = int(base_reach * (1 + growth * 1.6) * random.uniform(0.85, 1.15))
        interactions = int(reach * random.uniform(0.03, 0.055))
        metrics.append({
            "id": str(uuid.uuid4()),
            "instagram_account_id": account_id,
            "metric_date": day.isoformat(),
            "followers_count": int(base_followers + (followers - base_followers) * growth),
            "reach": reach,
            "views": int(reach * random.uniform(1.4, 1.9)),
            "profile_views": int(reach * random.uniform(0.01, 0.02)),
            "website_clicks": int(reach * random.uniform(0.004, 0.009)),
            "interactions": interactions,
            "engagement_rate": round(interactions / reach * 100, 2),
            "created_at": iso(),
        })
    await db.instagram_daily_metrics.insert_many([dict(m) for m in metrics])

    # Posts
    posts = []
    for idx, (caption, ptype) in enumerate(POST_TEMPLATES):
        published = now_utc() - timedelta(days=random.randint(1, 28), hours=random.randint(0, 12))
        reach = random.randint(6000, 22000)
        likes = int(reach * random.uniform(0.05, 0.09))
        comments = int(likes * random.uniform(0.03, 0.08))
        posts.append({
            "id": str(uuid.uuid4()),
            "instagram_account_id": account_id,
            "instagram_media_id": f"media_{uuid.uuid4().hex[:12]}",
            "media_type": "VIDEO" if ptype == "REELS" else "IMAGE",
            "media_product_type": ptype,
            "caption": caption,
            "permalink": f"https://instagram.com/p/demo{idx}",
            "thumbnail_url": None,
            "media_url": f"https://instagram.com/p/demo{idx}/media",
            "published_at": iso(published),
            "published_weekday": published.weekday(),
            "published_hour": published.hour,
            "like_count": likes,
            "comments_count": comments,
            "reach": reach,
            "engagement": f"{round((likes + comments) / reach * 100, 1)}%",
            "created_at": iso(),
            "updated_at": iso(),
        })
    await db.instagram_media.insert_many([dict(p) for p in posts])


async def create_user(email: str, name: str, password: Optional[str] = None, picture: Optional[str] = None, role: str = "user") -> dict:
    user = {
        "user_id": f"user_{uuid.uuid4().hex[:12]}",
        "email": email.lower(),
        "name": name,
        "picture": picture,
        "phone": None,
        "role": role,
        "plan": "pro",
        "whatsapp_opt_in": True,
        "created_at": iso(),
        "updated_at": iso(),
    }
    if password:
        user["password_hash"] = hash_password(password)
    await db.users.insert_one(dict(user))
    await seed_user_demo_data(user["user_id"])
    user.pop("password_hash", None)
    return user


# ------------------- AUTH ENDPOINTS -------------------

class RegisterBody(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginBody(BaseModel):
    email: EmailStr
    password: str


@api.post("/auth/register")
async def register(body: RegisterBody, response: Response):
    if len(body.password) < 6:
        raise HTTPException(status_code=400, detail="A senha deve ter no mínimo 6 caracteres")
    existing = await db.users.find_one({"email": body.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Este e-mail já está cadastrado")
    user = await create_user(body.email, body.name, password=body.password)
    token = create_access_token(user["user_id"], user["email"])
    set_auth_cookie(response, token)
    return user


@api.post("/auth/login")
async def login(body: LoginBody, request: Request, response: Response):
    client_ip = (request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
                 or request.headers.get("X-Real-IP", "")
                 or request.client.host)
    identifier = f"{client_ip}:{body.email.lower()}"
    attempt = await db.login_attempts.find_one({"identifier": identifier}, {"_id": 0})
    if attempt and attempt.get("count", 0) >= 5:
        locked_until = datetime.fromisoformat(attempt["locked_until"])
        if locked_until > now_utc():
            raise HTTPException(status_code=429, detail="Muitas tentativas. Tente novamente em 15 minutos.")
        await db.login_attempts.delete_one({"identifier": identifier})

    user = await db.users.find_one({"email": body.email.lower()}, {"_id": 0})
    if not user or not user.get("password_hash") or not verify_password(body.password, user["password_hash"]):
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$inc": {"count": 1}, "$set": {"locked_until": iso(now_utc() + timedelta(minutes=15))}},
            upsert=True,
        )
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos")

    await db.login_attempts.delete_one({"identifier": identifier})
    token = create_access_token(user["user_id"], user["email"])
    set_auth_cookie(response, token)
    user.pop("password_hash", None)
    return user


@api.post("/auth/session")
async def google_session(request: Request, response: Response):
    session_id = request.headers.get("X-Session-ID")
    if not session_id:
        raise HTTPException(status_code=400, detail="X-Session-ID header ausente")
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id},
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="session_id inválido")
    data = resp.json()

    user = await db.users.find_one({"email": data["email"].lower()}, {"_id": 0, "password_hash": 0})
    if not user:
        user = await create_user(data["email"], data.get("name") or data["email"], picture=data.get("picture"))
    elif data.get("picture") and not user.get("picture"):
        await db.users.update_one({"user_id": user["user_id"]}, {"$set": {"picture": data["picture"]}})
        user["picture"] = data["picture"]

    session_token = data["session_token"]
    await db.user_sessions.insert_one({
        "user_id": user["user_id"],
        "session_token": session_token,
        "expires_at": iso(now_utc() + timedelta(days=7)),
        "created_at": iso(),
    })
    set_auth_cookie(response, session_token, key="session_token")
    return user


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


@api.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("session_token", path="/")
    return {"ok": True}


# ------------------- PROFILE -------------------

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    whatsapp_opt_in: Optional[bool] = None


@api.put("/profile")
async def update_profile(body: ProfileUpdate, user: dict = Depends(get_current_user)):
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    updates["updated_at"] = iso()
    await db.users.update_one({"user_id": user["user_id"]}, {"$set": updates})
    return await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0, "password_hash": 0})


# ------------------- INSTAGRAM (SIMULATED DATA) -------------------

@api.get("/instagram/accounts")
async def get_accounts(user: dict = Depends(get_current_user)):
    await seed_user_demo_data(user["user_id"])
    return await db.instagram_accounts.find(
        {"user_id": user["user_id"], "status": "connected"}, {"_id": 0}
    ).to_list(50)


@api.get("/instagram/accounts/{account_id}/metrics")
async def get_metrics(account_id: str, days: int = 30, user: dict = Depends(get_current_user)):
    return await db.instagram_daily_metrics.find(
        {"instagram_account_id": account_id}, {"_id": 0}
    ).sort("metric_date", 1).to_list(days)


@api.get("/instagram/accounts/{account_id}/posts")
async def get_posts(account_id: str, user: dict = Depends(get_current_user)):
    return await db.instagram_media.find(
        {"instagram_account_id": account_id}, {"_id": 0}
    ).sort("published_at", -1).to_list(100)


@api.post("/instagram/accounts/{account_id}/sync")
async def sync_account(account_id: str, user: dict = Depends(get_current_user)):
    # Simulated sync: adds/updates today's metric with slight variation
    last = await db.instagram_daily_metrics.find(
        {"instagram_account_id": account_id}, {"_id": 0}
    ).sort("metric_date", -1).to_list(1)
    if last:
        m = last[0]
        reach = int(m["reach"] * random.uniform(0.98, 1.08))
        interactions = int(reach * random.uniform(0.03, 0.055))
        await db.instagram_daily_metrics.update_one(
            {"instagram_account_id": account_id, "metric_date": date.today().isoformat()},
            {"$set": {
                "reach": reach,
                "views": int(reach * 1.6),
                "profile_views": int(reach * 0.015),
                "website_clicks": int(reach * 0.006),
                "interactions": interactions,
                "engagement_rate": round(interactions / reach * 100, 2),
                "followers_count": m["followers_count"] + random.randint(5, 40),
            },
             "$setOnInsert": {"id": str(uuid.uuid4()), "instagram_account_id": account_id,
                              "metric_date": date.today().isoformat(), "created_at": iso()}},
            upsert=True,
        )
    await db.sync_logs.insert_one({
        "id": str(uuid.uuid4()),
        "instagram_account_id": account_id,
        "status": "success",
        "message": "Métricas sincronizadas (simulação — conecte a Meta API para dados reais)",
        "started_at": iso(),
        "finished_at": iso(),
        "created_at": iso(),
    })
    return {"ok": True}


# ------------------- AI (GEMINI via EMERGENT LLM KEY) -------------------

async def call_gemini(system: str, prompt: str, session_suffix: str) -> str:
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"upanalytics-{session_suffix}-{uuid.uuid4().hex[:8]}",
        system_message=system,
    ).with_model("gemini", "gemini-3-flash-preview")
    result = await chat.send_message(UserMessage(text=prompt))
    return result if isinstance(result, str) else str(result)


def extract_json(text: str):
    text = text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    start = min([i for i in [text.find("{"), text.find("[")] if i >= 0], default=0)
    end = max(text.rfind("}"), text.rfind("]")) + 1
    return json.loads(text[start:end])


async def log_ai_request(user_id: str, account_id: Optional[str], request_type: str, status: str = "success"):
    await db.ai_requests.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "instagram_account_id": account_id,
        "request_type": request_type,
        "prompt_tokens": 0,
        "completion_tokens": 0,
        "status": status,
        "created_at": iso(),
    })


class InsightBody(BaseModel):
    account_id: str


@api.post("/ai/insight")
async def ai_insight(body: InsightBody, user: dict = Depends(get_current_user)):
    account = await db.instagram_accounts.find_one({"user_id": user["user_id"]}, {"_id": 0})
    metrics = await db.instagram_daily_metrics.find(
        {"instagram_account_id": account["id"]} if account else {}, {"_id": 0}
    ).sort("metric_date", 1).to_list(30)

    first, last = (metrics[0], metrics[-1]) if len(metrics) >= 2 else (None, None)
    metrics_summary = ""
    if first and last:
        metrics_summary = (
            f"Seguidores: {first['followers_count']} -> {last['followers_count']}. "
            f"Alcance diário: {first['reach']} -> {last['reach']}. "
            f"Engajamento atual: {last['engagement_rate']}%. "
            f"Cliques no site: {last['website_clicks']}/dia. Visitas ao perfil: {last['profile_views']}/dia."
        )

    system = "Você é um estrategista sênior de Instagram da UP Analytics. Responda SEMPRE em português brasileiro e SOMENTE com JSON válido, sem markdown."
    prompt = f"""Analise as métricas dos últimos 30 dias do perfil @{account['username'] if account else 'perfil'}:
{metrics_summary}

Retorne JSON exatamente neste formato:
{{"title": "título estratégico curto", "summary": "resumo de 2-3 frases do diagnóstico", "what_improved": ["item com % estimado", "item"], "what_got_worse": ["item", "item"], "opportunities": ["oportunidade concreta", "oportunidade"], "recommended_actions": ["ação prática 1", "ação 2", "ação 3"], "content_suggestions": [{{"format": "Reels", "theme": "tema", "objective": "objetivo"}}, {{"format": "Carrossel", "theme": "tema", "objective": "objetivo"}}]}}"""

    try:
        raw = await call_gemini(system, prompt, "insight")
        parsed = extract_json(raw)
        await log_ai_request(user["user_id"], body.account_id, "weekly_insight")
    except Exception as e:
        logger.error(f"Gemini insight error: {e}")
        await log_ai_request(user["user_id"], body.account_id, "weekly_insight", "failed")
        raise HTTPException(status_code=502, detail="Erro ao gerar diagnóstico com IA. Tente novamente.")

    insight = {
        "id": str(uuid.uuid4()),
        "user_id": user["user_id"],
        "instagram_account_id": body.account_id,
        "period_start": (date.today() - timedelta(days=30)).isoformat(),
        "period_end": date.today().isoformat(),
        "insight_type": "weekly_digest",
        "created_at": iso(),
        **{k: parsed.get(k) for k in ["title", "summary", "what_improved", "what_got_worse", "opportunities", "recommended_actions", "content_suggestions"]},
    }
    await db.ai_insights.insert_one(dict(insight))
    return insight


class IdeasBody(BaseModel):
    niche: str
    objective: str
    tone: str = "Profissional"
    count: int = 3


@api.post("/ai/ideas")
async def ai_ideas(body: IdeasBody, user: dict = Depends(get_current_user)):
    account = await db.instagram_accounts.find_one({"user_id": user["user_id"]}, {"_id": 0})
    system = "Você é um copywriter e estrategista de conteúdo de Instagram da UP Analytics. Responda SEMPRE em português brasileiro e SOMENTE com JSON válido (array), sem markdown."
    prompt = f"""Gere {min(body.count, 5)} ideias completas de postagem para Instagram.
Nicho: {body.niche}. Objetivo: {body.objective}. Tom: {body.tone}.

Retorne um array JSON, cada item exatamente neste formato:
{{"format": "REELS ou FEED ou CAROUSEL", "theme": "tema", "title": "título chamativo", "hook": "gancho forte para os 3 primeiros segundos", "caption": "legenda completa com emojis e quebras de linha", "script": "roteiro cena a cena (se Reels) ou estrutura do post", "cta": "chamada para ação", "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5"], "visual_suggestion": "sugestão visual detalhada"}}"""

    try:
        raw = await call_gemini(system, prompt, "ideas")
        parsed = extract_json(raw)
        if isinstance(parsed, dict):
            parsed = [parsed]
        await log_ai_request(user["user_id"], account["id"] if account else None, "content_ideas")
    except Exception as e:
        logger.error(f"Gemini ideas error: {e}")
        await log_ai_request(user["user_id"], None, "content_ideas", "failed")
        raise HTTPException(status_code=502, detail="Erro ao gerar ideias com IA. Tente novamente.")

    ideas = []
    for item in parsed:
        idea = {
            "id": str(uuid.uuid4()),
            "user_id": user["user_id"],
            "client_id": None,
            "instagram_account_id": account["id"] if account else "",
            "format": item.get("format", "REELS"),
            "objective": body.objective,
            "niche": body.niche,
            "tone": body.tone,
            "theme": item.get("theme", ""),
            "title": item.get("title", ""),
            "hook": item.get("hook", ""),
            "caption": item.get("caption", ""),
            "script": item.get("script", ""),
            "cta": item.get("cta", ""),
            "hashtags": item.get("hashtags", []),
            "visual_suggestion": item.get("visual_suggestion", ""),
            "status": "draft",
            "planned_date": None,
            "created_at": iso(),
            "updated_at": iso(),
        }
        ideas.append(idea)
    if ideas:
        await db.content_ideas.insert_many([dict(i) for i in ideas])
    return ideas


class CaptionBody(BaseModel):
    theme: str
    tone: str = "Profissional"


@api.post("/ai/caption")
async def ai_caption(body: CaptionBody, user: dict = Depends(get_current_user)):
    system = "Você é um copywriter de Instagram. Responda em português brasileiro apenas com a legenda pronta."
    prompt = f'Escreva uma legenda premium de Instagram sobre "{body.theme}" no tom "{body.tone}". Inclua emojis, espaçamento limpo e 5 hashtags estratégicas.'
    try:
        text = await call_gemini(system, prompt, "caption")
        await log_ai_request(user["user_id"], None, "caption")
        return {"caption": text}
    except Exception as e:
        logger.error(f"Gemini caption error: {e}")
        raise HTTPException(status_code=502, detail="Erro ao gerar legenda com IA.")


@api.get("/ai/usage")
async def ai_usage(user: dict = Depends(get_current_user)):
    start_month = date.today().replace(day=1).isoformat()
    count = await db.ai_requests.count_documents({"user_id": user["user_id"], "created_at": {"$gte": start_month}})
    return {"monthly_requests": count, "limit": 100}


# ------------------- CONTENT -------------------

@api.get("/content/ideas")
async def list_ideas(user: dict = Depends(get_current_user)):
    return await db.content_ideas.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)


# ------------------- AUTOMATIONS (WHATSAPP SIMULATED) -------------------

class WhatsAppBody(BaseModel):
    phone: str
    message: str


@api.post("/automations/whatsapp/send")
async def send_whatsapp(body: WhatsAppBody, user: dict = Depends(get_current_user)):
    # SIMULATED: logs the message. Plug Evolution API here for real sending.
    logger.info(f"[WhatsApp Simulado] Para {body.phone}: {body.message}")
    await db.whatsapp_messages.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user["user_id"],
        "client_id": None,
        "instagram_account_id": None,
        "type": "manual_test",
        "phone": body.phone,
        "message": body.message,
        "status": "sent",
        "provider_message_id": f"sim_{uuid.uuid4().hex[:10]}",
        "sent_at": iso(),
        "created_at": iso(),
    })
    return {"ok": True, "simulated": True}


@api.get("/automations/messages")
async def list_messages(user: dict = Depends(get_current_user)):
    return await db.whatsapp_messages.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)


# ------------------- PLANS -------------------

PLANS = [
    {"id": "plan-iniciante", "slug": "iniciante", "name": "Iniciante", "description": "Ideal para criadores e marcas iniciando no Instagram.", "monthly_price_cents": 2900, "annual_price_cents": 29000, "trial_days": 7, "is_featured": False, "is_active": True, "sort_order": 1},
    {"id": "plan-pro", "slug": "pro", "name": "Pro", "description": "O plano completo para crescer com análise estratégica de IA e relatórios.", "monthly_price_cents": 7900, "annual_price_cents": 79000, "trial_days": 7, "is_featured": True, "is_active": True, "sort_order": 2},
    {"id": "plan-agencia", "slug": "agencia", "name": "Agência", "description": "Para agências e gestores que atendem múltiplos clientes.", "monthly_price_cents": 19900, "annual_price_cents": 199000, "trial_days": 7, "is_featured": False, "is_active": True, "sort_order": 3},
]


@api.get("/plans")
async def get_plans():
    return PLANS


@api.get("/billing/subscription")
async def get_subscription(user: dict = Depends(get_current_user)):
    plan = next((p for p in PLANS if p["slug"] == user.get("plan", "pro")), PLANS[1])
    return {
        "plan": plan,
        "status": "active",
        "current_period_start": iso(now_utc() - timedelta(days=12)),
        "current_period_end": iso(now_utc() + timedelta(days=18)),
        "payment_provider": "simulated",
    }


# ------------------- HEALTH -------------------

@api.get("/")
async def root():
    return {"status": "ok", "service": "UP Analytics API"}


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("user_id")
    await db.user_sessions.create_index("session_token")
    await db.login_attempts.create_index("identifier")
    # Seed admin + demo user
    admin_email = os.environ["ADMIN_EMAIL"]
    admin_password = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await create_user(admin_email, "Admin UP", password=admin_password, role="admin")
    elif not verify_password(admin_password, existing.get("password_hash", "")):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
    demo = await db.users.find_one({"email": "creator@upideias.com"})
    if not demo:
        await create_user("creator@upideias.com", "Creator de Sucesso", password="Creator@2026")
    logger.info("UP Analytics API iniciada")
