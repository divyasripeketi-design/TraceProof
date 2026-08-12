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


def detect_skills(file_paths, primary_language):
    skills = []

    def add_skill(name, evidence):
        unique_evidence = list(dict.fromkeys(evidence))

        if unique_evidence:
            skills.append({
                "name": name,
                "evidence_count": len(unique_evidence),
                "evidence": unique_evidence[:8]
            })

    # Language evidence
    typescript_files = [
        path for path in file_paths
        if path.endswith((".ts", ".tsx"))
    ]

    javascript_files = [
        path for path in file_paths
        if path.endswith((".js", ".jsx", ".mjs"))
    ]

    python_files = [
        path for path in file_paths
        if path.endswith(".py")
    ]

    css_files = [
        path for path in file_paths
        if path.endswith(".css")
    ]

    html_files = [
        path for path in file_paths
        if path.endswith(".html")
    ]

    add_skill("TypeScript", typescript_files)
    add_skill("JavaScript", javascript_files)
    add_skill("Python", python_files)
    add_skill("CSS", css_files)
    add_skill("HTML", html_files)

    # Framework / tooling evidence
    nextjs_evidence = [
        path for path in file_paths
        if (
            "next.config" in path
            or "/app/page.tsx" in path
            or path == "app/page.tsx"
        )
    ]

    add_skill("Next.js", nextjs_evidence)

    react_evidence = [
        path for path in file_paths
        if path.endswith((".tsx", ".jsx"))
    ]

    add_skill("React", react_evidence)

    fastapi_evidence = [
        path for path in file_paths
        if (
            path.endswith("main.py")
            and (
                "backend/" in path
                or path == "main.py"
            )
        )
    ]

    add_skill("FastAPI", fastapi_evidence)

    git_evidence = [
        path for path in file_paths
        if path.endswith(".gitignore")
    ]

    add_skill("Git", git_evidence)

    tailwind_evidence = [
        path for path in file_paths
        if (
            "tailwind" in path.lower()
            or "postcss.config" in path
        )
    ]

    add_skill("Tailwind CSS", tailwind_evidence)

    # If GitHub reports a primary language but we have not detected it yet
    if primary_language:
        existing_names = {skill["name"] for skill in skills}

        if primary_language not in existing_names:
            skills.insert(0, {
                "name": primary_language,
                "evidence_count": 1,
                "evidence": ["GitHub primary language"]
            })

    return skills


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

    repo_api_url = f"https://api.github.com/repos/{owner}/{repo}"
    commits_api_url = f"https://api.github.com/repos/{owner}/{repo}/commits"

    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "TraceProof"
    }

    async with httpx.AsyncClient() as client:
        repo_response = await client.get(
            repo_api_url,
            headers=headers
        )

        if repo_response.status_code == 404:
            raise HTTPException(
                status_code=404,
                detail="Repository not found."
            )

        if repo_response.status_code != 200:
            raise HTTPException(
                status_code=500,
                detail="Unable to analyze repository."
            )

        repo_data = repo_response.json()

        default_branch = repo_data.get("default_branch", "main")

        # Fetch repository file tree
        tree_api_url = (
            f"https://api.github.com/repos/"
            f"{owner}/{repo}/git/trees/{default_branch}"
        )

        tree_response = await client.get(
            tree_api_url,
            headers=headers,
            params={"recursive": "1"}
        )

        file_paths = []

        if tree_response.status_code == 200:
            tree_data = tree_response.json()

            file_paths = [
                item.get("path")
                for item in tree_data.get("tree", [])
                if item.get("type") == "blob"
            ]

        # Fetch commits
        commits_response = await client.get(
            commits_api_url,
            headers=headers,
            params={"per_page": 5}
        )

        commits = []

        if commits_response.status_code == 200:
            commit_list = commits_response.json()

            for item in commit_list:
                sha = item.get("sha")

                detail_url = (
                    f"https://api.github.com/repos/"
                    f"{owner}/{repo}/commits/{sha}"
                )

                detail_response = await client.get(
                    detail_url,
                    headers=headers
                )

                commit = item.get("commit", {})
                author = commit.get("author", {})

                evidence = {
                    "files_changed": 0,
                    "additions": 0,
                    "deletions": 0,
                    "files": []
                }

                if detail_response.status_code == 200:
                    detail = detail_response.json()

                    stats = detail.get("stats", {})
                    files = detail.get("files", [])

                    evidence["files_changed"] = len(files)
                    evidence["additions"] = stats.get("additions", 0)
                    evidence["deletions"] = stats.get("deletions", 0)

                    evidence["files"] = [
                        {
                            "filename": file.get("filename"),
                            "status": file.get("status"),
                            "additions": file.get("additions", 0),
                            "deletions": file.get("deletions", 0)
                        }
                        for file in files
                    ]

                commits.append({
                    "sha": sha[:7] if sha else "",
                    "message": commit.get("message"),
                    "author": author.get("name"),
                    "date": author.get("date"),
                    "github_url": item.get("html_url"),
                    "evidence": evidence
                })

    skills = detect_skills(
        file_paths,
        repo_data.get("language")
    )

    return {
        "name": repo_data.get("name"),
        "owner": repo_data.get("owner", {}).get("login"),
        "description": repo_data.get("description"),
        "language": repo_data.get("language"),
        "stars": repo_data.get("stargazers_count"),
        "forks": repo_data.get("forks_count"),
        "open_issues": repo_data.get("open_issues_count"),
        "default_branch": repo_data.get("default_branch"),
        "created_at": repo_data.get("created_at"),
        "updated_at": repo_data.get("updated_at"),
        "github_url": repo_data.get("html_url"),

        "files_scanned": len(file_paths),

        "skill_count": len(skills),
        "skills": skills,

        "commit_count_loaded": len(commits),
        "commits": commits
    }