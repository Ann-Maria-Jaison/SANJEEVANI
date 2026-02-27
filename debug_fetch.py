import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

try:
    res = supabase.table("accident_logs").select("*").order("accident_time", desc=True).execute()
    print(f"Data: {res.data}")
except Exception as e:
    print(f"Error: {e}")
