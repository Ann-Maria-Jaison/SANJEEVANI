import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

res = supabase.table("accident_logs").select("*").limit(1).execute()
if res.data:
    print("Columns in accident_logs:")
    for k in res.data[0].keys(): print(f"  - {k}")
else:
    print("Table accident_logs is empty.")

res = supabase.table("vehicles").select("*").limit(1).execute()
if res.data:
    print("Columns in vehicles:")
    for k in res.data[0].keys(): print(f"  - {k}")

res = supabase.table("cameras").select("*").limit(1).execute()
if res.data:
    print("Columns in cameras:")
    for k in res.data[0].keys(): print(f"  - {k}")
