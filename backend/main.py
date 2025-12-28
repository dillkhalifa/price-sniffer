# backend/main.py
import os
import json
import re
import asyncio
import hashlib
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from dotenv import load_dotenv
import redis  # <--- NEW LIBRARY

# 1. LOAD SECRETS
load_dotenv()

app = FastAPI(title="PriceSniffer API")

# 2. CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Configuration ---
USE_MOCK_DATA = False
SERPER_API_KEY = os.getenv("SERPER_KEY")
REDIS_URL = os.getenv("REDIS_URL") # <--- NEW CONFIG

# --- Setup Redis (The Memory) ---
redis_client = None
if REDIS_URL:
    try:
        # We use from_url to parse the long rediss:// string automatically
        redis_client = redis.from_url(REDIS_URL, decode_responses=True)
        print("DEBUG: Connected to Redis Cache successfully.")
    except Exception as e:
        print("DEBUG: Warning - Redis connection failed:", e)

# --- Models ---
class ProductItem(BaseModel):
    title: str
    price: float
    formatted_price: str
    merchant: str
    link: str
    image_url: str

class PriceStats(BaseModel):
    min_price: float
    max_price: float
    avg_price: float
    currency: str

class SearchResponse(BaseModel):
    query: str
    stats: PriceStats
    items: List[ProductItem]
    source: str # To tell us if it came from 'Cache' or 'Google'

# --- Helpers ---
def clean_price(price_raw: str) -> float:
    try:
        clean = re.sub(r'[^\d.]', '', price_raw)
        return float(clean)
    except (ValueError, TypeError):
        return 0.0

def calculate_stats(items: List[ProductItem]) -> PriceStats:
    if not items:
        return PriceStats(min_price=0, max_price=0, avg_price=0, currency="USD")
    prices = [item.price for item in items if item.price > 0]
    if not prices:
        return PriceStats(min_price=0, max_price=0, avg_price=0, currency="USD")
    return PriceStats(
        min_price=min(prices),
        max_price=max(prices),
        avg_price=round(sum(prices) / len(prices), 2),
        currency="USD"
    )

def generate_cache_key(query: str) -> str:
    """Creates a unique ID for the search term (e.g., 'iphone 15' -> 'search:iphone 15')"""
    return f"search:{query.lower().strip()}"

# --- Core Logic ---
@app.post("/api/search", response_model=SearchResponse)
async def search_products(
    query: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    final_query = query
    if file:
        final_query = "iPhone 15" # Still mocking image for now
        await asyncio.sleep(1)
            
    if not final_query and not file:
        raise HTTPException(status_code=400, detail="Please provide query.")

    print(f"DEBUG: Searching for '{final_query}'...")

    # --- STEP 1: CHECK CACHE (The Memory) ---
    if redis_client:
        cache_key = generate_cache_key(final_query)
        cached_data = redis_client.get(cache_key)
        if cached_data:
            print("DEBUG: ⚡ CACHE HIT! Loading from memory...")
            data = json.loads(cached_data)
            # Reconstruct objects from JSON
            items = [ProductItem(**item) for item in data['items']]
            stats = PriceStats(**data['stats'])
            return SearchResponse(query=final_query, stats=stats, items=items, source="Cache")

    # --- STEP 2: SEARCH GOOGLE (The Expensive Part) ---
    print("DEBUG: 🐢 CACHE MISS. Calling Google API...")
    raw_items = []
    
    if USE_MOCK_DATA:
        raw_items = [] # Mock logic removed for brevity
    else:
        async with httpx.AsyncClient() as client:
            payload = json.dumps({"q": final_query})
            headers = {'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json'}
            try:
                response = await client.post("https://google.serper.dev/shopping", headers=headers, data=payload)
                data = response.json()
                raw_items = data.get("shopping", [])
            except Exception as e:
                print("DEBUG: CRITICAL ERROR:", e)
                raise HTTPException(status_code=500, detail=str(e))

    # --- STEP 3: CLEAN DATA ---
    processed_items = []
    for item in raw_items:
        p_str = item.get("price", "0")
        p_val = clean_price(p_str)
        if p_val > 0:
            processed_items.append(ProductItem(
                title=item.get("title", "Unknown"),
                price=p_val,
                formatted_price=p_str,
                merchant=item.get("source", "Unknown"),
                link=item.get("link", "#"),
                image_url=item.get("imageUrl", item.get("thumbnail", ""))
            ))

    processed_items.sort(key=lambda x: x.price)
    stats = calculate_stats(processed_items)

    # --- STEP 4: SAVE TO CACHE ---
    if redis_client and processed_items:
        cache_data = {
            "items": [item.dict() for item in processed_items],
            "stats": stats.dict()
        }
        # Save to Redis for 1 hour (3600 seconds)
        redis_client.setex(generate_cache_key(final_query), 3600, json.dumps(cache_data))
        print("DEBUG: Saved results to Cache for next time.")

    return SearchResponse(
        query=final_query or "Unknown",
        stats=stats,
        items=processed_items,
        source="Google API"
    )