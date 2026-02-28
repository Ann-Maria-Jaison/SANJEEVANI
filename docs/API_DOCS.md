# API Documentation

The Sanjeevani backend is built using FastAPI.

## Endpoints

### Accidents
- `GET /accidents`: Retrieve all recorded accidents.
- `POST /accidents`: Report a new detected accident.
- `GET /accidents/{id}`: Get details of a specific accident.

### Vehicles
- `GET /vehicles/{plate_number}`: Retrieve owner and emergency contact details for a specific vehicle.

### Monitoring
- `GET /cctv/locations`: Get all CCTV camera locations and status.

## Technologies Used
- **Framework**: FastAPI
- **Server**: Uvicorn
- **Database**: Supabase (PostgreSQL)
