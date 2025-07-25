# RAG Assistant
A full-stack web application that enables intelligent document analysis and conversational AI. Users can upload documents and engage in contextually-aware conversations with an AI assistant powered by Retrieval-Augmented Generation (RAG) technology.

## Features
- **Document Upload**: Support for PDF, TXT, and MD file formats with drag-and-drop interface
- **Vector Search**: Semantic similarity search using Pinecone vector database
- **AI Integration**: Google Gemini 1.5 Flash for intelligent responses
- **Real-time Chat**: Interactive conversation interface with formatted responses
- **Document Processing**: Automatic text extraction and chunking for optimal retrieval
- **Responsive Design**: Modern, mobile-friendly interface built with React and Tailwind CSS

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| FastAPI | REST API framework |
| Google Gemini API | AI conversation engine |
| Pinecone | Vector database for embeddings |
| PyPDF2 | PDF text extraction |
| Python-dotenv | Environment configuration |
| Uvicorn | ASGI server |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool and dev server |
| Tailwind CSS | Styling framework |
| Lucide React | Icon library |

## Project Structure
```
rag-assistant/
├── backend/                    # FastAPI backend
│   ├── main.py                # Entry point and API routes
│   ├── requirements.txt       # Python dependencies
│   └── __pycache__/          # Python cache
└── frontend/                  # React frontend
    ├── src/
    │   ├── App.tsx            # Main application component
    │   ├── main.tsx           # React entry point
    │   ├── index.css          # Global styles
    │   └── components/        # Reusable UI components
    │       ├── ChatInterface.tsx    # Chat functionality
    │       └── FileUpload.tsx       # File upload component
    ├── package.json           # Node.js dependencies
    ├── vite.config.ts         # Vite configuration
    ├── tailwind.config.js     # Tailwind CSS configuration
    └── index.html             # HTML entry point
```

##  Installation & Setup

### Prerequisites
- Python (v3.8 or higher)
- Node.js (v18 or higher)
- Google Cloud Console account (for Gemini API)
- Pinecone account (for vector database)

### Backend Setup
1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   # or
   source venv/bin/activate  # Linux/Mac
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   GOOGLE_API_KEY=your_google_generative_ai_api_key
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_INDEX=your_pinecone_index_name
   PINECONE_ENV=your_pinecone_environment_region
   ```

5. **Start the backend server**
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   The API will be available at `http://localhost:8000`

### Frontend Setup
1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

## Configuration

### Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_API_KEY` | Google Gemini API key | ✅ |
| `PINECONE_API_KEY` | Pinecone API key | ✅ |
| `PINECONE_INDEX` | Pinecone index name | ✅ |
| `PINECONE_ENV` | Pinecone environment region | ✅ |

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Upload and process documents |
| POST | `/ask` | Query the RAG system |

## Usage

### Document Upload Process
1. **Select Files**: Choose PDF, TXT, or MD files (max 2 files)
2. **Upload**: Drag and drop or click to browse files
3. **Processing**: Files are automatically processed into vector embeddings
4. **Ready**: Chat interface becomes ready for document-based queries

### Chatting with Documents
1. Upload your documents using the file upload interface
2. Wait for processing to complete
3. Ask questions about your documents in the chat interface
4. Receive contextually relevant responses based on document content
## Key Features Explained

### Document Processing Pipeline
- **Text Extraction**: Automatic extraction from PDF, TXT, and MD files
- **Intelligent Chunking**: Content split into 1000-character segments for optimal retrieval
- **Vector Embeddings**: Documents converted to 768-dimensional vectors using Google's text-embedding-004
- **Semantic Search**: Cosine similarity matching for contextually relevant results

### AI-Powered Conversations
- **Context-Aware Responses**: Answers based on uploaded document content
- **Response Formatting**: Structured output with headings and bullet points
- **Real-time Processing**: Instant query processing and response generation

## Deployment

### Backend Deployment
1. **Environment Setup**
   ```bash
   # Set production environment variables
   export GOOGLE_API_KEY=your_key
   export PINECONE_API_KEY=your_key
   export PINECONE_INDEX=your_index
   export PINECONE_ENV=your_region
   ```

2. **Production Server**
   ```bash
   pip install -r requirements.txt
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

### Frontend Deployment
1. **Build Production Bundle**
   ```bash
   npm run build
   ```

2. **Deploy Static Files**
   - Deploy `dist/` folder to your hosting service
   - Update API endpoints for production backend
   - Configure CORS origins in backend

## Technical Specifications

### Vector Database
- **Dimension**: 768 (Google text-embedding-004 compatible)
- **Metric**: Cosine similarity
- **Provider**: Pinecone Serverless (AWS)
- **Retrieval**: Top-5 similar chunks per query

### API Configuration
- **Backend**: FastAPI on port 8000
- **Frontend**: Vite dev server on port 5173
- **File Upload**: multipart/form-data
- **Query**: application/x-www-form-urlencoded
- **CORS**: Enabled for localhost:5173

---

*RAG Assistant - Intelligent Document Analysis & Conversational AI*
