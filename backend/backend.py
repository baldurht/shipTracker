import httpx
import time
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import json, uvicorn
from asyncio import sleep
from dotenv import load_dotenv
import os

app = FastAPI()

# Last inn miljøvariabler fra .env-filen
load_dotenv()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)

# Hent klient-ID og klienthemmelighet fra .env
CLIENT_ID = os.getenv('CLIENT_ID')
CLIENT_SECRET = os.getenv('CLIENT_SECRET')

# Sjekk om miljøvariabler er satt
if not CLIENT_ID or not CLIENT_SECRET:
    raise ValueError("CLIENT_ID or CLIENT_SECRET is missing in the .env file")

TOKEN_URL = "https://id.barentswatch.no/connect/token"
LIVE_API_URL = "https://live.ais.barentswatch.no/live/v1/sse/combined"
SCOPE = "ais"

# Token og cachevariabler
token = None
token_expiration = 0

HEADERS = {
    "Content-Type": "application/json",
    "accept": "text/event-stream"
}

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
async def fetch_latest_data():
    if not await ensure_token_valid():
        return

    payload = {
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                    [10.659531163693629, 59.89610516809168],
                    [10.673500812335789, 59.87885330460057],
                    [10.750226283167166, 59.89761428576347],
                    [10.730451399765485, 59.908283179956356],
                    [10.72658325851188, 59.90914516724291],
                    [10.699076055987064, 59.91054589181482],
                    [10.659531163693629, 59.89610516809168]
                ]
            ]
        },
        "since": "2024-11-11T15:14:46.298Z",
        "countryCodes": ["string"],
        "includePosition": True,
        "includeStatic": True,
        "includeAton": True,
        "includeSafetyRelated": True,
        "includeBinaryBroadcastMetHyd": True,
        "downsample": True,
        "filterInput": ""
    }

    try:
        async with httpx.AsyncClient() as client:
            async with client.stream(
                "POST",
                LIVE_API_URL,
                headers={"Authorization": f"Bearer {token}", **HEADERS},
                json=payload,
                timeout=600.0
            ) as response:

                if response.status_code == 200:
                    # Strømmer data fra API
                    async for chunk in response.aiter_text():
                        yield f"{chunk}\n\n"
                else:
                    print(f"Kunne ikke hente data: {response.status_code}, {response.text}") function == 
                    return

    except httpx.TimeoutException as exc:
        print(f"Tidsavbrudd: {exc}")
        return 
    except httpx.RequestError as exc:
        print(f"En feil oppsto: {exc}")
        print(f"Forespørsel: {exc.request.url!r}")
        return

# API-endepunkt for å hente live data fra ekstern API
@app.get("/data")
async def get_latest_data():
    return StreamingResponse(fetch_latest_data(), media_type="text/event-stream")
