from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

app = FastAPI(title="TraceProof API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RepoRequest(BaseModel):
    repo_url: str


@app.get("/")
def home():
    return {"message": "TraceProof API is running"}


@app.get("/health")
def health():
    return {
        "status": "ok",
        "project": "TraceProof"
    }


@app.post("/analyze")
async def analyze_repository(request: RepoRequest):
    repo_url = request.repo_url.strip().rstrip("/")

    if repo_url.endswith(".git"):
        repo_url = repo_url[:-4]

    parts = repo_url.split("/")

    if len(parts) < 5 or "github.com" not in repo_url:
        raise HTTPException(
            status_code=400,
            detail="Please enter a valid GitHub repository URL."
        )

    owner = parts[-2]
    repo = parts[-1]

    github_api_url = f"https://api.github.com/repos/{owner}/{repo}"

    async with httpx.AsyncClient() as client:
        response = await client.get(github_api_url)

    if response.status_code == 404:
        raise HTTPException(
            status_code=404,
            detail="Repository not found."
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=500,
            detail="Unable to analyze repository."
        )

    data = response.json()

    return {
        "name": data.get("name"),
        "owner": data.get("owner", {}).get("login"),
        "description": data.get("description"),
        "language": data.get("language"),
        "stars": data.get("stargazers_count"),
        "forks": data.get("forks_count"),
        "open_issues": data.get("open_issues_count"),
        "default_branch": data.get("default_branch"),
        "created_at": data.get("created_at"),
        "updated_at": data.get("updated_at"),
        "github_url": data.get("html_url")
    }