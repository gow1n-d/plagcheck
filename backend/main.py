import os
import json
import uuid
import subprocess
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI

# Initialize FastAPI App
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Nvidia OpenAI Client
client = OpenAI(
  base_url="https://integrate.api.nvidia.com/v1",
  api_key="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"
)

# Data model
class AnalyzeRequest(BaseModel):
    text: str

def extract_keyword(text: str) -> str:
    prompt = f"Extract a 1-to-3 word search query representing the main, core topic of the following text:\n\n{text}\n\nJust output the words, nothing else."
    completion = client.chat.completions.create(
        model="meta/llama-3.1-70b-instruct",
        messages=[{"role":"user","content":prompt}],
        temperature=0.0,
        max_tokens=20
    )
    return completion.choices[0].message.content.strip()

def run_scrapy(query: str) -> dict:
    # Use a unique file for concurrent protections
    output_filename = f"result_{uuid.uuid4().hex}.json"
    try:
        # Run Scrapy spider via subprocess
        process = subprocess.run([
            "scrapy", "runspider", "spider.py",
            "-a", f"query={query}",
            "-o", output_filename,
            "-s", "LOG_LEVEL=ERROR"
        ], capture_output=True, text=True)
        
        if os.path.exists(output_filename):
            with open(output_filename, "r", encoding="utf-8") as f:
                data = json.load(f)
            return data[0] if len(data) > 0 else {"url": "", "content": ""}
        return {"url": "", "content": ""}
    finally:
        if os.path.exists(output_filename):
            os.remove(output_filename)

def calculate_metrics(user_text: str, web_text: str) -> dict:
    prompt = f"""
You are a plagiarism detection engine. Analyze the similarity between the "User Text" and the "Web Text".
Calculate three metrics:
1. Overall Similarity Percentage (0-100) (How much does User Text borrow concepts or phrases from Web Text)
2. AI Perplexity Score (0-100) (Predictability)
3. AI Burstiness Score (0-1) (Variance in sentence lengths)
4. isAiGenerated (true/false)

User Text:
{user_text}

Web Text:
{web_text}

Output ONLY a raw JSON object string with keys: "similarityScore" (integer), "aiPerplexity" (integer), "aiBurstiness" (float), "isAiGenerated" (boolean). Note: Make NO conversational responses.
"""
    completion = client.chat.completions.create(
        model="meta/llama-3.1-70b-instruct",
        messages=[{"role":"user","content":prompt}],
        temperature=0.1,
        max_tokens=612
    )
    
    content = completion.choices[0].message.content.strip()
    # Safely clean content if it wraps in markdown blocks
    if content.startswith("```json"):
        content = content[7:]
    if content.startswith("```"):
        content = content[3:]
    if content.endswith("```"):
        content = content[:-3]
    content = content.strip()
    
    try:
        data = json.loads(content)
        return data
    except Exception as e:
        print("Failed to decode JSON:", e, content)
        return {
            "similarityScore": 0,
            "aiPerplexity": 0,
            "aiBurstiness": 0.0,
            "isAiGenerated": False
        }

@app.post("/api/analyze")
async def analyze_text(request: AnalyzeRequest):
    text = request.text
    
    # 1. Ask Nvidia AI for best keyword
    keyword = extract_keyword(text[:1500])
    
    # 2. Scrape Web based on keyword using Scrapy
    scraped_data = run_scrapy(keyword)
    web_content = scraped_data.get("content", "")
    source_url = scraped_data.get("url", "No external matches found.")
    
    # 3. Analyze Similarity & AI metrics
    metrics = calculate_metrics(text, web_content)
    
    # Build returning object simulating our exact current structure requirements
    response_data = {
        "status": "success",
        "keywordSearched": keyword,
        "sourceUrl": source_url,
        "metrics": metrics
    }
    
    return response_data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
