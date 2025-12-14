from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import json
from unified_agent import UnifiedAgent 

app = FastAPI(title="Snap-and-Check API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

agent = UnifiedAgent()

# --- SMS SERVICE ---
def send_sms_alert(message: str, phone_number: str):
    print("\n" + "="*40)
    print(f"🚨 SENDING EMERGENCY SMS ALERT!")
    print(f"To: {phone_number}") # It is now guaranteed to have a number
    print(f"Message: {message}")
    print("="*40 + "\n")

@app.get("/")
def read_root():
    return {"status": "active"}

@app.post("/analyze")
async def analyze_image(
    file: UploadFile = File(...),
    current_meds: str = Form(""), 
    emergency_contact: str = Form(...) # Form(...) means REQUIRED
):
    try:
        image_bytes = await file.read()
        print(f"--- Analyzing Image. Contact: {emergency_contact} ---")
        
        result = agent.analyze_image(image_bytes, current_meds)
        
        # --- CAREGIVER ALERT LOGIC ---
        audit = result.get("safety_audit", {})
        alert_info = audit.get("caregiver_alert", {})
        
        # Only send if danger AND we have the contact (backend validation)
        if alert_info.get("required") and emergency_contact:
            send_sms_alert(
                alert_info.get("sms_message", "Critical Interaction Detected."),
                emergency_contact
            )
            
        return result

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat_endpoint(message: str = Form(...), context: str = Form(...)):
    try:
        context_data = json.loads(context)
        reply = agent.chat_about_medicine([], message, context_data)
        return {"reply": reply}
    except Exception as e:
        return {"reply": "Sorry, I couldn't process that question."}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)