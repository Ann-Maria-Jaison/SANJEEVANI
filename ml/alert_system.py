from supabase_client import supabase


def search_vehicle(plate_number):
    response = supabase.table("vehicles") \
        .select("*") \
        .eq("plate", plate_number) \
        .execute()

    data = response.data

    if data:
        return data[0]
    return None


def get_camera(camera_id):
    response = supabase.table("cameras") \
        .select("*") \
        .eq("camera_id", camera_id) \
        .execute()

    data = response.data

    if data:
        return data[0]
    return None


def log_accident(plate, camera_id):
    supabase.table("accident_logs").insert({
        "plate": plate,
        "camera_id": camera_id,
        "status": "ALERT_SENT"
    }).execute()

    print("✅ Accident logged in database")


def send_alert(vehicle):
    print("\n🚨 ALERT SENT!")
    print("Owner:", vehicle["owner_name"])
    print("Owner Phone:", vehicle["owner_phone"])
    print("Emergency Contact:", vehicle["emergency_contact"])



def simulate_accident(plate_number, camera_id):
    print("\n🚗 Accident Detected!\n")

    vehicle = search_vehicle(plate_number)
    camera = get_camera(camera_id)

    if not vehicle:
        print("❌ Vehicle not found")
        return

    if not camera:
        print("❌ Camera not found")
        return

    print("📍 Location:", camera["area_name"])
    print("Latitude:", camera["latitude"])
    print("Longitude:", camera["longitude"])

    send_alert(vehicle)
    log_accident(plate_number, camera_id)