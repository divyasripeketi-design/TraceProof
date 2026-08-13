from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

app = FastAPI(title="TraceProof API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://trace-proof-xi.vercel.app",
    ],
    allow_origin_regex=r"^https://trace-proof(?:-[a-z0-9-]+)?\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RepoRequest(BaseModel):
    repo_url: str


def detect_skills(file_paths, primary_language):
    skills = []

    def add_skill(name, evidence, confidence):
        unique_evidence = list(dict.fromkeys(evidence))

        if unique_evidence:
            skills.append({
                "name": name,
                "confidence": confidence,
                "evidence_count": len(unique_evidence),
                "evidence": unique_evidence[:8],
            })

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

    add_skill("TypeScript", typescript_files, "Verified")
    add_skill("JavaScript", javascript_files, "Verified")
    add_skill("Python", python_files, "Verified")
    add_skill("CSS", css_files, "Verified")
    add_skill("HTML", html_files, "Verified")

    nextjs_evidence = [
        path for path in file_paths
        if (
            "next.config" in path
            or "/app/page.tsx" in path
            or path == "app/page.tsx"
        )
    ]

    add_skill("Next.js", nextjs_evidence, "Supported")

    react_evidence = [
        path for path in file_paths
        if path.endswith((".tsx", ".jsx"))
    ]

    add_skill("React", react_evidence, "Supported")

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

    add_skill("FastAPI", fastapi_evidence, "Inferred")

    git_evidence = [
        path for path in file_paths
        if path.endswith(".gitignore")
    ]

    add_skill("Git", git_evidence, "Supported")

    tailwind_evidence = [
        path for path in file_paths
        if (
            "tailwind" in path.lower()
            or "postcss.config" in path
        )
    ]

    add_skill("Tailwind CSS", tailwind_evidence, "Supported")

    if primary_language:
        existing_names = {
            skill["name"]
            for skill in skills
        }

        if primary_language not in existing_names:
            skills.insert(0, {
                "name": primary_language,
                "confidence": "Supported",
                "evidence_count": 1,
                "evidence": ["GitHub primary language"],
            })

    return skills


def classify_commit(message, files):
    message_lower = (message or "").lower()

    filenames = [
        (file.get("filename") or "").lower()
        for file in files
    ]

    fix_keywords = [
        "fix",
        "bug",
        "error",
        "issue",
        "crash",
        "repair",
        "resolve",
        "broken",
    ]

    refactor_keywords = [
        "refactor",
        "cleanup",
        "clean up",
        "restructure",
        "optimize",
        "simplify",
    ]

    test_keywords = [
        "test",
        "tests",
        "spec",
        "coverage",
    ]

    documentation_keywords = [
        "readme",
        "docs",
        "documentation",
        "document",
    ]

    setup_keywords = [
        "initial",
        "setup",
        "init",
        "scaffold",
        "bootstrap",
        "configure",
        "configuration",
    ]

    feature_keywords = [
        "add",
        "feature",
        "implement",
        "create",
        "build",
        "support",
        "introduce",
    ]

    if any(keyword in message_lower for keyword in fix_keywords):
        return {
            "stage": "Fix",
            "signal": "Explicit",
            "reason": (
                "Commit message contains an explicit "
                "bug-fix or issue-resolution signal."
            ),
        }

    if any(keyword in message_lower for keyword in refactor_keywords):
        return {
            "stage": "Refactor",
            "signal": "Explicit",
            "reason": (
                "Commit message indicates restructuring, "
                "cleanup or optimization."
            ),
        }

    if any(keyword in message_lower for keyword in test_keywords):
        return {
            "stage": "Testing",
            "signal": "Explicit",
            "reason": (
                "Commit message indicates testing "
                "or validation work."
            ),
        }

    if any(keyword in message_lower for keyword in documentation_keywords):
        return {
            "stage": "Documentation",
            "signal": "Explicit",
            "reason": "Commit message indicates documentation work.",
        }

    if (
        filenames
        and all(
            (
                filename.endswith(".md")
                or "readme" in filename
                or "docs/" in filename
            )
            for filename in filenames
        )
    ):
        return {
            "stage": "Documentation",
            "signal": "Supported",
            "reason": "Changed files are documentation-focused.",
        }

    if any(keyword in message_lower for keyword in setup_keywords):
        return {
            "stage": "Setup",
            "signal": "Explicit",
            "reason": (
                "Commit message indicates project "
                "initialization or configuration."
            ),
        }

    if any(keyword in message_lower for keyword in feature_keywords):
        return {
            "stage": "Feature",
            "signal": "Supported",
            "reason": (
                "Commit message suggests new "
                "functionality or implementation work."
            ),
        }

    return {
        "stage": "Development",
        "signal": "Inferred",
        "reason": "No stronger development-stage signal was found.",
    }


def build_debug_replay(commits):
    events = []
    explicit_fix_detected = False

    chronological_commits = list(reversed(commits))

    for index, commit in enumerate(chronological_commits, start=1):
        evidence = commit.get("evidence", {})
        files = evidence.get("files", [])

        classification = classify_commit(
            commit.get("message"),
            files,
        )

        if (
            classification["stage"] == "Fix"
            and classification["signal"] == "Explicit"
        ):
            explicit_fix_detected = True

        events.append({
            "step": index,
            "sha": commit.get("sha"),
            "message": commit.get("message"),
            "date": commit.get("date"),
            "github_url": commit.get("github_url"),
            "stage": classification["stage"],
            "signal": classification["signal"],
            "reason": classification["reason"],
            "files_changed": evidence.get("files_changed", 0),
            "additions": evidence.get("additions", 0),
            "deletions": evidence.get("deletions", 0),
            "files": [
                file.get("filename")
                for file in files
                if file.get("filename")
            ][:8],
        })

    stage_names = []

    for event in events:
        stage = event["stage"]

        if stage not in stage_names:
            stage_names.append(stage)

    if explicit_fix_detected:
        summary = (
            "An explicit bug-fix signal was detected "
            "in the loaded repository history. "
            "The replay shows observable development "
            "stages backed by commit evidence."
        )
    else:
        summary = (
            "No explicit bug-fix commit was detected "
            "in the loaded history. The replay shows "
            "observable development stages without "
            "claiming debugging activity that the "
            "evidence does not support."
        )

    return {
        "event_count": len(events),
        "explicit_fix_detected": explicit_fix_detected,
        "stages_detected": stage_names,
        "summary": summary,
        "events": events,
    }


def calculate_proof_score(
    skills,
    commits,
    files_scanned,
    debug_replay,
):
    verified_count = len([
        skill
        for skill in skills
        if skill.get("confidence") == "Verified"
    ])

    supported_count = len([
        skill
        for skill in skills
        if skill.get("confidence") == "Supported"
    ])

    inferred_count = len([
        skill
        for skill in skills
        if skill.get("confidence") == "Inferred"
    ])

    verified_score = min(verified_count * 6, 30)
    supported_score = min(supported_count * 4, 20)
    commit_score = min(len(commits) * 4, 20)

    file_score = min(
        round((files_scanned / 50) * 10),
        10,
    )

    stage_count = len(
        debug_replay.get("stages_detected", [])
    )

    stage_score = min(stage_count * 2, 10)

    fix_score = (
        10
        if debug_replay.get("explicit_fix_detected")
        else 0
    )

    total_score = (
        verified_score
        + supported_score
        + commit_score
        + file_score
        + stage_score
        + fix_score
    )

    total_score = min(total_score, 100)

    if total_score >= 80:
        level = "Strong Evidence"
    elif total_score >= 60:
        level = "Good Evidence"
    elif total_score >= 40:
        level = "Developing Evidence"
    else:
        level = "Limited Evidence"

    return {
        "score": total_score,
        "max_score": 100,
        "level": level,
        "breakdown": {
            "verified_skills": {
                "score": verified_score,
                "max": 30,
                "count": verified_count,
            },
            "supported_skills": {
                "score": supported_score,
                "max": 20,
                "count": supported_count,
            },
            "commit_evidence": {
                "score": commit_score,
                "max": 20,
                "count": len(commits),
            },
            "repository_depth": {
                "score": file_score,
                "max": 10,
                "files_scanned": files_scanned,
            },
            "development_stages": {
                "score": stage_score,
                "max": 10,
                "count": stage_count,
            },
            "explicit_fix_evidence": {
                "score": fix_score,
                "max": 10,
                "detected": debug_replay.get(
                    "explicit_fix_detected"
                ),
            },
        },
        "evidence_summary": {
            "verified_skills": verified_count,
            "supported_skills": supported_count,
            "inferred_skills": inferred_count,
            "commits_analyzed": len(commits),
            "files_scanned": files_scanned,
            "stages_detected": stage_count,
        },
        "note": (
            "The Proof Score is calculated only from "
            "repository evidence loaded by TraceProof. "
            "It is not a measure of a developer's "
            "overall ability, seniority or employability."
        ),
    }


@app.get("/")
def home():
    return {
        "message": "TraceProof API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "project": "TraceProof",
    }


@app.post("/analyze")
async def analyze_repository(request: RepoRequest):
    repo_url = request.repo_url.strip().rstrip("/")

    if repo_url.endswith(".git"):
        repo_url = repo_url[:-4]

    parts = repo_url.split("/")

    if (
        len(parts) < 5
        or "github.com" not in repo_url
    ):
        raise HTTPException(
            status_code=400,
            detail="Please enter a valid GitHub repository URL.",
        )

    owner = parts[-2]
    repo = parts[-1]

    repo_api_url = (
        f"https://api.github.com/repos/"
        f"{owner}/{repo}"
    )

    commits_api_url = (
        f"https://api.github.com/repos/"
        f"{owner}/{repo}/commits"
    )

    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "TraceProof",
    }

    async with httpx.AsyncClient(timeout=20.0) as client:
        try:
            repo_response = await client.get(
                repo_api_url,
                headers=headers,
            )
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=502,
                detail=(
                    "Could not connect to GitHub API: "
                    f"{str(exc)}"
                ),
            ) from exc

        if repo_response.status_code == 404:
            raise HTTPException(
                status_code=404,
                detail="Repository not found.",
            )

        if repo_response.status_code != 200:
            try:
                github_error = repo_response.json().get(
                    "message",
                    "Unknown GitHub API error",
                )
            except Exception:
                github_error = repo_response.text

            rate_remaining = repo_response.headers.get(
                "x-ratelimit-remaining",
                "unknown",
            )

            raise HTTPException(
                status_code=502,
                detail=(
                    f"GitHub API returned "
                    f"{repo_response.status_code}: "
                    f"{github_error}. "
                    f"Rate limit remaining: "
                    f"{rate_remaining}"
                ),
            )

        repo_data = repo_response.json()

        default_branch = repo_data.get(
            "default_branch",
            "main",
        )

        tree_api_url = (
            f"https://api.github.com/repos/"
            f"{owner}/{repo}/git/trees/"
            f"{default_branch}"
        )

        try:
            tree_response = await client.get(
                tree_api_url,
                headers=headers,
                params={"recursive": "1"},
            )
        except httpx.RequestError:
            tree_response = None

        file_paths = []

        if (
            tree_response is not None
            and tree_response.status_code == 200
        ):
            tree_data = tree_response.json()

            file_paths = [
                item.get("path")
                for item in tree_data.get("tree", [])
                if (
                    item.get("type") == "blob"
                    and item.get("path")
                )
            ]

        try:
            commits_response = await client.get(
                commits_api_url,
                headers=headers,
                params={"per_page": 5},
            )
        except httpx.RequestError:
            commits_response = None

        commits = []

        if (
            commits_response is not None
            and commits_response.status_code == 200
        ):
            commit_list = commits_response.json()

            for item in commit_list:
                sha = item.get("sha")

                detail_url = (
                    f"https://api.github.com/repos/"
                    f"{owner}/{repo}/commits/{sha}"
                )

                try:
                    detail_response = await client.get(
                        detail_url,
                        headers=headers,
                    )
                except httpx.RequestError:
                    detail_response = None

                commit = item.get("commit", {})
                author = commit.get("author") or {}

                evidence = {
                    "files_changed": 0,
                    "additions": 0,
                    "deletions": 0,
                    "files": [],
                }

                if (
                    detail_response is not None
                    and detail_response.status_code == 200
                ):
                    detail = detail_response.json()
                    stats = detail.get("stats") or {}
                    files = detail.get("files") or []

                    evidence["files_changed"] = len(files)

                    evidence["additions"] = stats.get(
                        "additions",
                        0,
                    )

                    evidence["deletions"] = stats.get(
                        "deletions",
                        0,
                    )

                    evidence["files"] = [
                        {
                            "filename": file.get("filename"),
                            "status": file.get("status"),
                            "additions": file.get(
                                "additions",
                                0,
                            ),
                            "deletions": file.get(
                                "deletions",
                                0,
                            ),
                        }
                        for file in files
                    ]

                commits.append({
                    "sha": sha[:7] if sha else "",
                    "message": commit.get("message"),
                    "author": author.get("name"),
                    "date": author.get("date"),
                    "github_url": item.get("html_url"),
                    "evidence": evidence,
                })

    skills = detect_skills(
        file_paths,
        repo_data.get("language"),
    )

    debug_replay = build_debug_replay(commits)

    proof_score = calculate_proof_score(
        skills=skills,
        commits=commits,
        files_scanned=len(file_paths),
        debug_replay=debug_replay,
    )

    return {
        "name": repo_data.get("name"),

        "owner": repo_data.get(
            "owner",
            {},
        ).get("login"),

        "description": repo_data.get("description"),

        "language": repo_data.get("language"),

        "stars": repo_data.get("stargazers_count"),

        "forks": repo_data.get("forks_count"),

        "open_issues": repo_data.get(
            "open_issues_count"
        ),

        "default_branch": repo_data.get(
            "default_branch"
        ),

        "created_at": repo_data.get("created_at"),

        "updated_at": repo_data.get("updated_at"),

        "github_url": repo_data.get("html_url"),

        "files_scanned": len(file_paths),

        "skill_count": len(skills),

        "skills": skills,

        "commit_count_loaded": len(commits),

        "commits": commits,

        "debug_replay": debug_replay,

        "proof_score": proof_score,
    }