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
- Access credentials for BarentsWatch AIS API.

---

## Access to the API

## BarentsWatch

To access AIS data, we use the [BarentsWatch AIS APIs](https://developer.barentswatch.no/docs/tutorial).

### Create a User

To gain access, you must [create a user account here](https://id.barentswatch.no/Account/Register). Open the email you receive and approve your account. Once this is done, you can log in and add your full name and phone number on [My Page](https://www.barentswatch.no/minside).  
After this, you need to create a client for each API you want to use.

### Create a Client

Start by creating a client for AIS. Be sure to save the client's password, preferably in a password manager (such as KeePass, LastPass, or Keeper) along with the client name. These credentials can then be securely shared with others and stored as environment variables to make API calls from your server.

### Test the API

BarentsWatch uses OpenAPI and, in theory, can be tested directly from a browser, [as described here](https://developer.barentswatch.no/docs/usingopenapi). **Note**: The wrong AIS OpenAPI is linked, and it states that everything is deprecated (no longer in use) if you follow links in the documentation. [This is the correct link to the AIS API](https://live.ais.barentswatch.no/index.html).  
Unfortunately, there is an issue here, and it is not possible to authorize. "Try it out" will therefore always fail. However, it is still a good way to see how the API works, with example data for both requests and responses.
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


  

