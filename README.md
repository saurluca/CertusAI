# CertusAI 🏛️

> **Award-winning AI platform simplifying access to Swiss law**  
> 🏆 Winner of "Best Usage of Apertus" at Swiss AI Weeks Hackathon 2025 (CHF 10,000)

## What is CertusAI?

CertusAI is an intelligent legal assistant that makes Swiss bureaucracy and law accessible to everyone. Built during the Swiss AI Weeks Hackathon, it addresses the complexity of understanding Swiss legal documents, permits, and regulations.

**"Certus"** means "certainty" in Latin - because when it comes to law, certainty is paramount. Our platform provides answers directly sourced from official legal documents and court cases.

## 🏆 Hackathon Achievement

**Swiss AI Weeks 2025** - Zurich Hackathon  
**Challenge**: Swiss Government Digital Services  
**Award**: "Best Usage of Apertus" (CHF 10,000)

## Key Features

- **🤖 AI-Powered Legal Assistant**: Query Swiss legal documents using advanced AI
- **🌍 Multilingual Support**: Answers in all Swiss national languages (German, French, Italian) plus English
- **📄 Document Analysis**: Upload legal documents for comprehensive AI analysis
- **🔍 Smart Search**: Find relevant legal precedents and similar cases
- **📊 Trust Scoring**: Multi-factor trust assessment for legal documents
- **⚖️ Swiss Compliance**: Automated compliance checking for Swiss legal standards

## 🛠 Technology Stack

### Backend

- **Python** with **FastAPI** - High-performance API framework
- **DSPy** - AI framework for building reliable AI systems
- **Apertus** - Swiss LLM for legal document processing
- **RAG** - Semantic search across legal documents + BM25 Document retrival

### Frontend

- **React** + **TypeScript** - Modern web application
- **Tailwind CSS** - Swiss Government Design System styling
- **Zustand** - Lightweight state management
- **React Hook Form** + **Zod** - Form handling and validation

### Project Highlights

- Built AI agent using Apertus (Swiss LLM) to query database of legal documents
- Implemented multilingual interface providing sourced answers in all Swiss national languages
- Created comprehensive legal analysis platform with trust scoring and compliance checking

## Quick Start

### Backend Setup

Quick install using UV

```bash
cd backend
uv sync
uv run uvicorn main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

## 📁 Project Structure

```md
CertusAI/
├── backend/          # Python FastAPI + DSPy + Apertus
├── frontend/         # React + TypeScript + Swiss Design
└── README.md         # This file
```

## 🌐 Multilingual Support

CertusAI supports all Swiss national languages and english:

- **Swiss German** (Schweizerdeutsch) - Default
- **French** (Français)
- **Italian** (Italiano)
- **English**

## 🎨 Design Philosophy

Following Swiss Government Design System principles:

- Clean, accessible interface
- Swiss Federal colors and typography
- Mobile-first responsive design
- Emphasis on clarity and usability

## 🔒 Privacy & Compliance

- Swiss data residency compliance
- GDPR-compliant data handling
- Secure document processing
- Audit logging for all operations

---

**Built with ❤️ for Swiss AI Weeks 2025**  
*Making Swiss law accessible to everyone, one query at a time.*
