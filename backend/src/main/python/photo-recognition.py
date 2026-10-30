import base64
import io
import json
import os
from pathlib import Path
from typing import List

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from PIL import Image
from pydantic import BaseModel, Field


load_dotenv(Path(__file__).with_name(".env"))

api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise RuntimeError("GROQ_API_KEY is not configured")

frontend_origins = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGINS", "").split(",")
    if origin.strip()
]


app = FastAPI(title="NutriFlow Food Vision API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", *frontend_origins],
    allow_origin_regex=r"https://[a-z0-9-]+\.vercel\.app|http://(10|192\.168|172\.(1[6-9]|2[0-9]|3[0-1]))\.\d+:5173",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
client = Groq(api_key=api_key)


class FoodItem(BaseModel):
    name: str = Field(description="Name of the food item detected")
    estimated_weight_g: float = Field(description="Estimated weight in grams")
    calories: int = Field(description="Estimated calories")
    protein_g: float = Field(description="Estimated grams of protein")
    carbs_g: float = Field(description="Estimated grams of carbohydrates")
    fat_g: float = Field(description="Estimated grams of fat")


class NutritionResponse(BaseModel):
    items: List[FoodItem]
    total_calories: int
    confidence_explanation: str


class LabelNutritionResponse(BaseModel):
    product_name: str = Field(description="Product name if visible, otherwise Unknown product")
    serving_size: str = Field(description="Serving size exactly as printed on the label")
    calories: int = Field(description="Calories for the requested nutrition basis")
    protein_g: float = Field(description="Protein grams for the requested nutrition basis")
    carbs_g: float = Field(description="Total carbohydrate grams for the requested nutrition basis")
    fat_g: float = Field(description="Total fat grams for the requested nutrition basis")
    nutrition_basis: str = Field(description="Usually per serving, exactly as printed")
    confidence_explanation: str = Field(description="Brief note about any unclear values")


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/v1/nutrition", response_model=NutritionResponse)
async def analyze_food_image(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes))
        image.verify()

        data_url = (
            f"data:{file.content_type};base64,"
            f"{base64.b64encode(image_bytes).decode('utf-8')}"
        )

        completion = client.chat.completions.create(
            model="qwen/qwen3.8-27b",
            temperature=0.2,
            max_tokens=700,
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                "Analyze this food image. Identify all visible food items, "
                                "estimate portions, and estimate calories, protein, carbs, "
                                "and fat. Keep the response concise and return only valid JSON "
                                "matching this schema: "
                                f"{json.dumps(NutritionResponse.model_json_schema())}"
                            ),
                        },
                        {"type": "image_url", "image_url": {"url": data_url}},
                    ],
                }
            ],
        )

        content = completion.choices[0].message.content
        if not content:
            raise ValueError("The vision model returned an empty response.")
        return json.loads(content)
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Photo analysis failed: {error}")


@app.post("/api/v1/nutrition-label", response_model=LabelNutritionResponse)
async def analyze_nutrition_label(file: UploadFile = File(...)):
    """Read a packaged-food Nutrition Facts panel and return values for review."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes))
        image.verify()

        data_url = (
            f"data:{file.content_type};base64,"
            f"{base64.b64encode(image_bytes).decode('utf-8')}"
        )
        schema = LabelNutritionResponse.model_json_schema()
        completion = client.chat.completions.create(
            model="qwen/qwen3.8-27b",
            temperature=0.1,
            max_tokens=500,
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                "Read the packaged food Nutrition Facts label in this image. "
                                "Return only values that are printed on the label; do not estimate "
                                "or infer missing values. Use the serving-size row as the nutrition "
                                "basis. If a required number is unreadable or absent, use 0 and "
                                "mention it in confidence_explanation. Return valid JSON matching "
                                f"this schema: {json.dumps(schema)}"
                            ),
                        },
                        {"type": "image_url", "image_url": {"url": data_url}},
                    ],
                }
            ],
        )

        content = completion.choices[0].message.content
        if not content:
            raise ValueError("The vision model returned an empty response.")
        return json.loads(content)
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Nutrition label reading failed: {error}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
