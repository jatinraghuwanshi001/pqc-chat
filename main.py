from fastapi import FastAPI , Request
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# ✅ Allow Firebase frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://cryptoria-23fa5.web.app",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
print("✅ FastAPI APP LOADED SUCCESSFULLY")

# ---------------------
# TEMP MEMORY DATABASE (for now)
# ---------------------
USERS = []
MESSAGES = []


# ✅ Health check
@app.get("/")
def root():
    return {"status": "✅ FastAPI backend alive"}


# ---------------------
# ✅ GET USERS
# ---------------------
@app.get("/api/users")
def get_users():
    return USERS


# ---------------------
# ✅ SEND MESSAGE
# ---------------------
@app.post("/api/send")
async def send_message(req: Request):
    data = await req.json()

    message = {
        "id": len(MESSAGES) + 1,
        "chatId": data.get("chatId"),
        "sender": data.get("sender"),
        "iv": data.get("iv"),
        "ciphertext": data.get("ciphertext"),
    }

    MESSAGES.append(message)
    return {"success": True}


# ---------------------
# ✅ FETCH MESSAGES BY CHAT
# ---------------------
@app.get("/api/messages/{chat_id}")
def get_messages(chat_id: str):
    chat_msgs = [
        m for m in MESSAGES if m["chatId"] == chat_id
    ]
    return chat_msgs
