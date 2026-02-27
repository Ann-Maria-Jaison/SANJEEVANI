import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

tables = ["accident_logs", "accidents", "vehicles", "vehicle", "cameras", "camera"]
for t in tables:
    try:
        supabase.table(t).select("*").limit(1).execute()
        print(f"EXISTS: {t}")
    except:
        print(f"MISSING: {t}")
