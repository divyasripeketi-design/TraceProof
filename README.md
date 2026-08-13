# TraceProof

> **Evidence over claims.**

TraceProof is an evidence-backed developer skill verification platform that transforms real GitHub repository history into verifiable proof of how a developer builds, learns, debugs, and solves engineering problems.

Instead of relying only on self-reported skills, TraceProof analyzes source files, commits, repository structure, and development history to generate transparent engineering evidence.

## 🚀 Live Demo

**Frontend:**  
https://trace-proof-xi.vercel.app

**Backend API:**  
https://traceproof-backend.onrender.com

**API Health Check:**  
https://traceproof-backend.onrender.com/health

---

## ✨ What TraceProof Does

Paste a public GitHub repository URL and TraceProof analyzes the project to produce:

- Repository metadata
- Developer Proof Score
- Skill Evidence
- Skill Confidence Signals
- Developer Proof Summary
- Debug Replay
- Commit Timeline
- Commit Evidence
- Changed-file evidence
- Development-stage detection

TraceProof focuses on **observable repository evidence instead of unsupported claims**.

---

## 📊 TraceProof Score

TraceProof generates a transparent repository evidence score out of 100.

The score is based on:

- Verified skills
- Supported technology signals
- Commit evidence
- Repository depth
- Development stages
- Explicit bug-fix evidence

Each category has its own score breakdown so users can understand exactly why a repository received its score.

> The TraceProof Score measures evidence found in the analyzed repository. It is not a measure of a developer's overall ability, seniority, or employability.

---

## 🔎 Skill Evidence

TraceProof scans repository files and detects technologies with three evidence confidence levels.

### Verified

Direct source-file evidence exists.

Examples:

- TypeScript
- JavaScript
- Python
- CSS

### Supported

Strong framework or tooling signals exist.

Examples:

- Next.js
- React
- Git
- Tailwind CSS

### Inferred

The repository structure strongly suggests the technology, but direct evidence is more limited.

Example:

- FastAPI

Each detected skill includes the source files that support the result.

---

## 🧠 Developer Proof Summary

TraceProof creates a recruiter-friendly snapshot containing:

- Number of verified skills
- Number of supported skills
- Commits analyzed
- Repository files scanned
- Development stages detected
- Strongest technology evidence
- Development path

This gives recruiters and reviewers a quick evidence-backed summary before exploring the deeper repository history.

---

## 🐛 Debug Replay

Debug Replay reconstructs observable development stages from commit history.

Possible stages include:

- Setup
- Feature
- Documentation
- Testing
- Fix
- Refactor
- Development

TraceProof intentionally avoids claiming that debugging happened unless the commit evidence supports that conclusion.

For example, if no explicit bug-fix commit exists, TraceProof reports that no explicit fix evidence was detected instead of inventing debugging activity.

---

## 🧾 Commit Evidence

For each analyzed commit, TraceProof can display:

- Commit SHA
- Commit message
- Author
- Date
- Files changed
- Additions
- Deletions
- Changed filenames
- Direct GitHub commit link

This provides traceable evidence behind the developer activity shown by the platform.

---

## 🛠 Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Vercel

### Backend

- Python
- FastAPI
- Pydantic
- HTTPX
- Uvicorn
- Render

### Data Source

- GitHub REST API

---

## 🏗 Architecture

```text
User
  ↓
Next.js Frontend
  ↓
FastAPI Backend
  ↓
GitHub REST API
  ↓
Repository Evidence
  ↓
TraceProof Analysis
  ├── Repository Analysis
  ├── Proof Score
  ├── Developer Proof Summary
  ├── Skill Evidence
  ├── Confidence Signals
  ├── Debug Replay
  └── Commit Evidence