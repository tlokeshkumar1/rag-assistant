import os
from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware 
from dotenv import load_dotenv
from PyPDF2 import PdfReader
import google.generativeai as genai
from pinecone import Pinecone, ServerlessSpec

load_dotenv()

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
embed_model = genai.embed_content

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index_name = os.getenv("PINECONE_INDEX")

if index_name not in pc.list_indexes().names():
    pc.create_index(
        name=index_name,
        dimension=768,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region=os.getenv("PINECONE_ENV"))
    )

index = pc.Index(index_name)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
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
            model="models/text-embedding-004",
            content=chunk,
            task_type="retrieval_document"
        )["embedding"]
        index.upsert([(f"{file.filename}-{i}", embedding, {"text": chunk})])

    return {"status": "uploaded", "chunks": len(chunks)}

@app.post("/ask")
async def ask_query(query: str = Form(...)):
    query_embedding = embed_model(
        model="models/text-embedding-004",
        content=query,
        task_type="retrieval_query"
    )["embedding"]

    results = index.query(vector=query_embedding, top_k=5, include_metadata=True)
    context = "\n".join([match["metadata"]["text"] for match in results["matches"]])

    prompt = f"""You are a helpful assistant. Use the following context to answer the user question.
    
    Context:
    {context}

    Question: {query}

    Instructions:
    - Provide a clear, structured response
    - Use bullet points (•) only for actual lists with multiple related items
    - For single pieces of information, use simple text without bullets
    - For section headings, prefix with "HEADING:" (e.g., "HEADING: Personal Information:")
    - Use only ONE blank line between sections
    - Be concise and well-organized
    - Do NOT use markdown formatting like ** or *
    
    Answer:"""

    model = genai.GenerativeModel("models/gemini-1.5-flash")
    response = model.generate_content(prompt)

    # Better formatting function
    formatted_response = format_response_better(response.text)

    return {"answer": formatted_response}

def format_response_better(text: str) -> str:
    """Format response for better frontend display"""
    # Remove markdown symbols
    text = text.replace("**", "")
    text = text.replace("*", "")
    
    # Split into lines
    lines = text.strip().split('\n')
    formatted_lines = []
    
    for line in lines:
        line = line.strip()
        
        if line:
            # Convert to bullet points
            if line.startswith("- "):
                line = "• " + line[2:]
            elif line.startswith("• "):
                pass  # Already formatted
            
            formatted_lines.append(line)
    
    # Add spacing before headings (except first one)
    final_lines = []
    for i, line in enumerate(formatted_lines):
        if line.startswith("HEADING:") and i > 0:
            # Add one empty line before headings (except first)
            final_lines.append("")
        final_lines.append(line)
    
    return '\n'.join(final_lines)