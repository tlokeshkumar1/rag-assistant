import os
from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware 
from dotenv import load_dotenv
from PyPDF2 import PdfReader
import google.generativeai as genai
from pinecone import Pinecone, ServerlessSpec

# Load .env
load_dotenv()

# Init Gemini
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
embed_model = genai.embed_content

# Init Pinecone
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index_name = os.getenv("PINECONE_INDEX")

# Create index if it doesn't exist
if index_name not in pc.list_indexes().names():
    pc.create_index(
        name=index_name,
        dimension=1024,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region=os.getenv("PINECONE_ENV"))
    )

# Get index object
index = pc.Index(index_name)

# Setup FastAPI
app = FastAPI()

# ✅ Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_text(file: UploadFile):
    if file.filename.endswith(".pdf"):
        reader = PdfReader(file.file)
        return "\n".join([page.extract_text() for page in reader.pages])
    elif file.filename.endswith(".txt"):
        return file.file.read().decode("utf-8")
    return ""

@app.post("/upload")
async def upload_file(file: UploadFile):
    text = extract_text(file)
    chunks = [text[i:i + 1000] for i in range(0, len(text), 1000)]

    for i, chunk in enumerate(chunks):
        embedding = embed_model(
            model="models/embedding-001",
            content=chunk,
            task_type="retrieval_document"
        )["embedding"]
        index.upsert([(f"{file.filename}-{i}", embedding, {"text": chunk})])

    return {"status": "uploaded", "chunks": len(chunks)}

@app.post("/ask")
async def ask_query(query: str = Form(...)):
    query_embedding = embed_model(
        model="models/embedding-001",
        content=query,
        task_type="retrieval_query"
    )["embedding"]

    results = index.query(vector=query_embedding, top_k=5, include_metadata=True)
    context = "\n".join([match["metadata"]["text"] for match in results["matches"]])

    prompt = f"""You are a helpful assistant. Use the following internal policy context to answer the user question.

Context:
{context}

Question:
{query}

Answer:"""

    # ✅ Create Gemini model and generate response
    model = genai.GenerativeModel("models/gemini-1.5-flash")
    response = model.generate_content(prompt)

    return {"answer": response.text}