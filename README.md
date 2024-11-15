# Ship Tracker

This app tracks ships and calculates their exit time from a predefined polygon based on their position, speed, and heading. It consists of a **backend** built with FastAPI and a **frontend** built with React.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Access to the API](#Access-to-the-API)
- [Installation](#installation)
- [Running the App](#running-the-app)
- [Project Structure](#project-structure)
- [Things to Improve](#Things-to-Improve)

---

## Features

- Real-time ship tracking using **Server-Sent Events (SSE)**.
- Backend to fetch and process ship data from the BarentsWatch API.
- Frontend to visualize ships and calculate exit times dynamically.

---

## Requirements

- **Python 3.8+**
- **Node.js 16+**
- **npm** (comes with Node.js)
- **httpx**, **uvicorn**, **fastapi**, **python-dotenv** (Python dependencies)
- Access credentials for BarentsWatch API.

---

## Access to the API

## BarentsWatch

For å få tak i AIS data bruker vi [BarentsWatch sine API-er](https://developer.barentswatch.no/docs/tutorial). 

### Opprett bruker

For å få tilgang må man [opprette en bruker her](https://id.barentswatch.no/Account/Register). Åpne mailen du har fått og godkjenn brukeren. Når det er gjort kan du logge inn og legge til fullt navn og telefonnummer på [minside](https://www.barentswatch.no/minside). 
Deretter oppretter man en klient for hvert enkelt API man er interessert i å bruke. 

### Opprett klient

Til å begynne med lager du en klient for AIS. Husk å lagre passordet til klienten. Dette gjøres gjerne i en passord manager (KeePass, LastPass, Keeper f.eks) sammen med klientnavnet. Disse kan så deles med andre på en trygg måte og legges i environment variables for å gjøre kall fra serveren.

### Teste API-et

BarentsWatch bruker OpenAPI og kan i teorien testes fra en nettleser, [som beskrevet her](https://developer.barentswatch.no/docs/usingopenapi). OBS: Det er linket til feil AIS OpenAPI, og det står at alt er deprecated (ikke skal brukes) om du følger links i dokumentasjonen. [Dette er riktig link til AIS API](https://live.ais.barentswatch.no/index.html).
Dessverre er det gjort noe feil her og det er derfor ikke mulig å autoriseres. "Try it out" vil derfor alltid feile. Det er fremdeles en fin måte å se hvordan API-et brukes, med eksempeldata i både request og response.

---

## Installation

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/mijo321/shipTracker
   cd shipTracker/backend
2. Create a Python virtual enviroment:
   ```bash
   python3 -m venv venv
3. install dependencies:
   ```bash
   pip install -r requirements.txt
4. Create a .env file in the backend directory:
   ```bash
   touch .env
   echo -e "CLIENT_ID=\nCLIENT_SECRET=">.env

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
2. Install Node.js dependencies:
   ```bash
   npm install

---

## Running the app

### Start the Backend
1. Ensure you are in the Backend module.
   ```bash
   cd backend

2. Ensure the virtual enviroment is activated.
   ```bash
   source venv/bin/activate
3. Run the backend server:
   ```bash
   fastapi dev backend.py
  The backend will now be available at http://127.0.0.1:8000/data.

### Start the Frontend
1. Open a new terminal and navigate to the frontend directory.
2. Start the development server:
   ```bash
   npm start
  The frontend will be available at http://localhost:3000.

---

## Project Structure
  ```bash
  .
  ├── backend/
  │   ├── main.py          # FastAPI application
  │   ├── requirements.txt # Backend dependencies
  │   └── .env             # Environment variables
  ├── frontend/
  │   ├── src/
  │   │   ├── components/
  │   │   │   ├── Ship.js  # Ship component
  │   │   │   ├── utils.js # Utility functions (e.g., exit time calculations)
  │   │   └── App.js       # Main React component
  │   ├── public/          # Public assets
  │   └── package.json     # Frontend dependencies
  ```

---

## Notes

1. Ensure the CLIENT_ID and CLIENT_SECRET in .env are valid to fetch data from the BarentsWatch API.
2. The frontend listens on http://localhost:3000 and expects the backend to run at http://127.0.0.1:8000. Adjust the CORS settings in main.py if necessary.

---

## Things to Improve

1. Display the boats in a better way, use exit_time to generate a boat that moves across the screen in exit_time time.
2. Add ui to change the polygon and generate the polygon based upon where the user says they are standing and their field of view.


  

