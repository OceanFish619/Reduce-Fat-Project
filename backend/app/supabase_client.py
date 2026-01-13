import os
from typing import Optional

from supabase import Client, create_client

_client: Optional[Client] = None


def get_supabase() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_ANON_KEY")
    if not url or not key:
        raise RuntimeError("SUPABASE_URL/SUPABASE_SERVICE_KEY not configured.")
    global _client
    if _client is None:
        _client = create_client(url, key)
    return _client
