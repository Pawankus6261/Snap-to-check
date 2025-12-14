import json
import os
import google.generativeai as genai
from dotenv import load_dotenv
from PIL import Image
import io
from difflib import SequenceMatcher

load_dotenv()

class UnifiedAgent:
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY is missing.")
        
        genai.configure(api_key=self.api_key)
        # Using Gemini 1.5 Flash for speed & multimodal accuracy
        self.model = genai.GenerativeModel('gemini-2.5-flash', generation_config={"response_mime_type": "application/json"})
        self.chat_model = genai.GenerativeModel('gemini-2.5-flash')

    def analyze_image(self, image_bytes: bytes, user_meds: str) -> dict:
        try:
            image = Image.open(io.BytesIO(image_bytes))
            
            # Logic to handle empty user profile
            profile_context = f"The patient is currently taking: **{user_meds}**" if user_meds else "The patient has NO other known current medications."

            prompt = f"""
            ### ROLE
            You are an expert Clinical Pharmacist and OCR Specialist.
            
            ### TASK
            Analyze this prescription/bottle image.
            
            ### CONTEXT
            {profile_context}
            
            ### STEPS
            1. **TRANSCRIPTION (OCR)**: Read ALL visible text on the image exactly as it appears. Ignore background noise. Output this to 'raw_text'.
            2. **IDENTIFY**: Extract ALL medications. Map Brand Names to Generic Ingredients (e.g. 'Meftal' -> 'Mefenamic Acid').
            3. **SCHEDULE**: Create a dosage schedule (Morning/Noon/Eve/Night) based on instructions.
            4. **SAFETY CHECK**: 
               - **INTERNAL**: Check if drugs *in the image* interact with *each other*.
               - **EXTERNAL**: Check if they interact with the **Current Medications** ({user_meds}).
               - **REPORT**: Flag interactions as DANGER/CAUTION and explain the mechanism.

            ### OUTPUT SCHEMA (Strict JSON)
            {{
              "raw_text": "String (The complete, exact OCR transcription of the label)",
              "medications": [
                {{
                  "drug_name": "String (Brand)",
                  "generic_name": "String (Active Ingredient)",
                  "strength": "String | null",
                  "form": "String",
                  "dosage_schedule": {{
                    "morning": "Boolean",
                    "afternoon": "Boolean",
                    "evening": "Boolean",
                    "night": "Boolean",
                    "note": "String"
                  }}
                }}
              ],
              "safety_audit": {{
                "ui_status": "String (SAFE | CAUTION | DANGER)",
                "alert_title": "String",
                "alert_body": "String",
                "color_hex": "String (#2E7D32 | #F9A825 | #C62828)"
              }}
            }}
            """
            
            response = self.model.generate_content([prompt, image])
            result = json.loads(response.text)
            return result

        except Exception as e:
            print(f"Unified Agent Error: {e}")
            return {
                "raw_text": "Error processing image.",
                "medications": [],
                "safety_audit": {
                    "ui_status": "CAUTION",
                    "alert_title": "Analysis Failed",
                    "alert_body": "Could not process image. Please try again.",
                    "color_hex": "#F9A825"
                }
            }

    def chat_about_medicine(self, history, user_message, context_data):
        system_prompt = f"""
        You are a friendly AI Pharmacist.
        Context - The user's scanned medications:
        {json.dumps(context_data)}
        
        Answer the user's question based on this list.
        """
        try:
            full_prompt = f"{system_prompt}\n\nUser: {user_message}\nPharmacist:"
            response = self.chat_model.generate_content(full_prompt)
            return response.text
        except Exception as e:
            return "I'm having trouble checking the database."