# Lean Flow Backend (FastAPI + Supabase)

## 1) Supabase 初始化
1. 创建 Supabase 项目。
2. 在 SQL Editor 中执行 `supabase_schema.sql`。
3. 在 `backend/` 目录下新建 `.env` 并写入：

```
SUPABASE_URL=你的项目 URL
SUPABASE_SERVICE_KEY=你的 service role key
```

## 2) 本地运行
```
cd /Users/ocean/Desktop/Projects/减脂App/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## 3) 基础接口
- GET `/health`
- GET/POST/DELETE `/recipes`
- GET/POST/DELETE `/meal-logs`
- GET/POST/DELETE `/body-entries`
- GET `/profiles/me`
- POST `/profiles`

所有接口需要 `Authorization: Bearer <access_token>`，由前端 Supabase 登录后传入。
