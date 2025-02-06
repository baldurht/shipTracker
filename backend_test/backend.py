import json
import os
import time
from asyncio import sleep

import httpx
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

app = FastAPI()

# Last inn miljøvariabler fra .env-filen
load_dotenv()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # Set to False for EventSource
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
    expose_headers=["content-type", "content-length"]
)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=10000)

# Hent klient-ID og klienthemmelighet fra .env
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")

# Sjekk om miljøvariabler er satt
if not CLIENT_ID or not CLIENT_SECRET:
    raise ValueError("CLIENT_ID or CLIENT_SECRET is missing in the .env file")

TOKEN_URL = "https://id.barentswatch.no/connect/token"
LIVE_API_URL = "https://live.ais.barentswatch.no/live/v1/sse/combined"
SCOPE = "ais"

# Token og cachevariabler
token = None
token_expiration = 0

HEADERS = {"Content-Type": "application/json", "accept": "text/event-stream"}


# Hent nytt token fra API-et
async def get_new_token():
    global token, token_expiration
    async with httpx.AsyncClient() as client:
        response = await client.post(
            TOKEN_URL,
            data={
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
                "grant_type": "client_credentials",
                "scope": SCOPE,
            },
        )
        response.raise_for_status()  # feil ved status som ikke er 200
        data = response.json()
        token = data["access_token"]
        token_expiration = time.time() + data["expires_in"]
        print("Token oppdatert.")


# Sjekker at tokenet er gyldig
async def ensure_token_valid():
    if not token or time.time() >= token_expiration:
        print("Ingen gyldig token tilgjengelig eller token er utløpt.")
        await get_new_token()
    return token is not None


# Hent live data fra API-et
# ... existing imports ...

# Add a timestamp variable to track last query time
current_polygon = None
last_query_time = None

@app.post("/update-polygon")
async def update_polygon(data: dict):
    global current_polygon, last_query_time
    current_polygon = data["polygon"]
    # Reset the query time to get fresh data for new location
    last_query_time = None
    return {"status": "success"}

async def fetch_latest_data():
    global last_query_time
    if not await ensure_token_valid():
        return

    # Use the current_polygon if available, otherwise use default
    polygon_coords = current_polygon if current_polygon else [
        [10.40949213375464, 59.616131700787946],
        [10.407879608203785, 59.61211673648614],
        [10.412981305421397, 59.61149089322336],
        [10.414774545043457, 59.615491869965865],
        [10.40949213375464, 59.616131700787946]
    ]

    while True:
        try:
            # Update the since parameter with the last query time or current time
            current_time = time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime())
            query_time = last_query_time if last_query_time else current_time
            
            payload = {
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [polygon_coords]
                },
                "since": query_time,
                "countryCodes": ["string"],
                "includePosition": True,
                "includeStatic": True,
                "includeAton": True,
                "includeSafetyRelated": True,
                "includeBinaryBroadcastMetHyd": True,
                "downsample": True,
                "filterInput": "",
            }
            
            # Update last query time for next iteration
            last_query_time = current_time

            async with httpx.AsyncClient() as client:
                async with client.stream(
                    "POST",
                    LIVE_API_URL,
                    headers={"Authorization": f"Bearer {token}", **HEADERS},
                    json=payload,
                    timeout=600.0,
                ) as response:
                    if response.status_code == 200:
                        async for chunk in response.aiter_text():
                            yield f"{chunk}\n\n"
                    else:
                        print(f"Kunne ikke hente data: {response.status_code}, {response.text}")
                        return

        except httpx.TimeoutException as exc:
            print(f"Tidsavbrudd: {exc}")
            return
        except httpx.RequestError as exc:
            print(f"En feil oppsto: {exc}")
            print(f"Forespørsel: {exc.request.url!r}")
            return

@app.get("/")
async def root():
    return {"message": "Keep alive"}


# API-endepunkt for å hente live data fra ekstern API

@app.get("/data")
async def get_latest_data():
    return StreamingResponse(fetch_latest_data(), media_type="text/event-stream")
