import os
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def check_table(name):
    try:
        res = supabase.table(name).select("*").limit(1).execute()
        print(f"Success: Table '{name}' exists.")
    except Exception as e:
        print(f"Failed: Table '{name}': {e}")

check_table("accident_logs")
check_table("accidents")
check_table("vehicles")
check_table("vehicle")
check_table("cameras")
check_table("camera")
