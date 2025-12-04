from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rooms = {}

@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await websocket.accept()

    if room_id not in rooms:
        rooms[room_id] = []

    rooms[room_id].append(websocket)

    try:
        while True:
            data = await websocket.receive_text()
            # broadcast to everyone EXCEPT sender
            for connection in rooms[room_id]:
                if connection != websocket:
                    await connection.send_text(data)

    except WebSocketDisconnect:
        rooms[room_id].remove(websocket)
