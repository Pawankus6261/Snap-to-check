import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)

with open("models.txt", "w") as f:
    for m in genai.list_models():
        if "flash" in m.name.lower():
            f.write(f"{m.name}\n")
