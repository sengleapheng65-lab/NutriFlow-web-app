import io
import os
import json
import base64
from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel, Field
from typing import List
from PIL import Image
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise RuntimeError("GROQ_API_KEY not found in environment or .env file")

app = FastAPI(title="Cloud-Hosted Open Source Food Vision API")

# Initialize the Groq client (reads the GROQ_API_KEY environment variable)
client = Groq(api_key=api_key)

class FoodItem(BaseModel):
    name: str = Field(description="Name of the food item detected")
    estimated_weight_g: float = Field(description="Estimated weight in grams")
    calories: int = Field(description="Estimated calories")
    protein_g: float = Field(description="Grams of protein")
    carbs_g: float = Field(description="Grams of carbohydrates")
    fat_g: float = Field(description="Grams of fat")

class NutritionResponse(BaseModel):
    items: List[FoodItem]
    total_calories: int
    confidence_explanation: str = Field(description="Brief reasoning for the visual estimation")

@app.post("/api/v1/nutrition", response_model=NutritionResponse)
async def analyze_food_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    try:
        # Read file bytes
        image_bytes = await file.read()

        # Verify image validity
        image = Image.open(io.BytesIO(image_bytes))
        image.verify()

        # Convert image to Base64 Data URL for cloud transmission
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        data_url = f"data:{file.content_type};base64,{base64_image}"

        # Query Groq's hosted Llama 3.2 Vision model
        chat_completion = client.chat.completions.create(
            # Enforce JSON mode output
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                "Analyze this food image. Identify all food items, estimate portions, "
                                "and calculate calories, protein, carbs, and fat. "
                                f"Output your final response strictly as a JSON object matching this schema: {json.dumps(NutritionResponse.model_json_schema())}"
                            )
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": data_url
                            }
                        }
                    ]
                }
            ],
            model="qwen/qwen3.8-27b",
            temperature=0.2,
        )

        # Parse and return the response
        result_data = json.loads(chat_completion.choices[0].message.content)
        return result_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"API Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
