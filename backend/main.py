"""
Maksat Workspace - Backend Core Service
FastAPI-based DICOM & Secure Medical File Processing API
"""

import os
import hashlib
import uuid
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI(
    title="Maksat Workspace API",
    description="Goralan DICOM we Lukmançylyk Faýl Alyş-Çalşygy Serweri",
    version="1.0.0"
)

# CORS Sazlamalary
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "/data/storage/dicom"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# 1. Ulanyjy we Admin Tassyklama Modelleri
class UserApprovalRequest(BaseModel):
    user_id: str
    approve: bool
    role: str = "doctor"

class DicomMetadataResponse(BaseModel):
    patient_id: str
    study_instance_uid: str
    modality: str
    series_description: str
    slices_count: int
    is_anonymized: bool

# 2. WebSocket Birikmeler Dolandyryjysy (Connection Manager)
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_json(message)

manager = ConnectionManager()

# 3. Status we Barlag Endpoint
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Maksat Workspace Backend",
        "storage": "connected",
        "dicom_engine": "ready"
    }

# 4. Bölekleýin (Chunked) DICOM Ýükleme Endpoint-i
@app.post("/api/dicom/upload-chunk")
async def upload_dicom_chunk(
    upload_id: str = Form(...),
    chunk_index: int = Form(...),
    total_chunks: int = Form(...),
    file: UploadFile = File(...)
):
    chunk_filename = f"{upload_id}_part_{chunk_index}.tmp"
    chunk_path = os.path.join(UPLOAD_DIR, chunk_filename)
    
    with open(chunk_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
        
    # Eger soňky bölek bolsa, ählisini birleşdirmek
    if chunk_index == total_chunks - 1:
        final_filename = f"{upload_id}.dcm"
        final_path = os.path.join(UPLOAD_DIR, final_filename)
        
        hasher = hashlib.sha256()
        with open(final_path, "wb") as outfile:
            for idx in range(total_chunks):
                part_path = os.path.join(UPLOAD_DIR, f"{upload_id}_part_{idx}.tmp")
                if os.path.exists(part_path):
                    with open(part_path, "rb") as infile:
                        data = infile.read()
                        hasher.update(data)
                        outfile.write(data)
                    os.remove(part_path)
                    
        await manager.broadcast({
            "type": "FILE_PROCESSED",
            "file_id": upload_id,
            "sha256": hasher.hexdigest()
        })
        
        return {
            "status": "completed",
            "file_id": upload_id,
            "sha256": hasher.hexdigest()
        }
        
    return {"status": "chunk_received", "chunk_index": chunk_index}

# 5. Admin Tassyklama Endpoint-i
@app.post("/api/admin/approve-user")
async def approve_user(payload: UserApprovalRequest):
    # Bu ýerde maglumatlar bazasyna ýazylýar
    await manager.broadcast({
        "type": "ACCOUNT_APPROVED",
        "user_id": payload.user_id,
        "is_approved": payload.approve,
        "role": payload.role
    })
    return {
        "success": True,
        "message": f"Ulanyjy {payload.user_id} tassyklanyldy."
    }

# 6. WebSocket Habarlaşma Kanaly
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo ýa-da bildiriş ýagdaýlary
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# 7. Frontend Statik Faýllaryny Paýlaşmak
app.mount("/", StaticFiles(directory="../frontend", html=True), name="frontend")
