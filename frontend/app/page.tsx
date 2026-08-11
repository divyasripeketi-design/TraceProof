"use client";

import { useState } from "react";

type RepoData = {
  name: string | null;
  owner: string | null;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  open_issues: number;
  default_branch: string | null;
  created_at: string | null;
  updated_at: string | null;
  github_url: string | null;
};

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyzeRepository() {
    if (!repoUrl.trim()) {
      setError("Please enter a GitHub repository URL.");
      return;
    }

    setLoading(true);
    setError("");
    setRepoData(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repo_url: repoUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to analyze repository.");
      }

      setRepoData(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#08090d] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_35%)]" />

      <div className="relative z-10">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/10 text-lg font-bold text-violet-300">
              T
            </div>

            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                TraceProof
              </h1>
              <p className="text-xs text-zinc-500">
                Evidence over claims.
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
            <a className="transition hover:text-white" href="#product">
              Product
            </a>
            <a className="transition hover:text-white" href="#features">
              Features
            </a>
            <a className="transition hover:text-white" href="#about">
              About
            </a>
          </div>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium transition hover:bg-white/10"
          >
            GitHub
          </a>
        </nav>

        <section
          id="product"
          className="mx-auto flex max-w-5xl flex-col items-center px-6 pb-20 pt-20 text-center"
        >
          <div className="mb-6 rounded-full border border-violet-400/20 bg-violet-400/5 px-4 py-2 text-xs font-medium text-violet-300">
            Developer Proof Engine • V1
          </div>

          <h2 className="max-w-4xl text-5xl font-semibold tracking-[-0.04em] sm:text-6xl lg:text-7xl">
            Don&apos;t tell recruiters
            <span className="block bg-gradient-to-r from-violet-300 via-fuchsia-300 to-blue-300 bg-clip-text text-transparent">
              what you know.
            </span>
            Prove it.
          </h2>

          <p className="mt-7 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
            TraceProof transforms your GitHub history into verifiable evidence
            of how you build, debug, learn and solve real engineering problems.
          </p>

          <div className="mt-12 w-full max-w-3xl rounded-2xl border border-white/10 bg-white/[0.035] p-3 shadow-2xl shadow-violet-950/20 backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex flex-1 items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4">
                <span className="text-zinc-500">↗</span>

                <input
                  type="text"
                  value={repoUrl}
                  onChange={(event) => setRepoUrl(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      analyzeRepository();
                    }
                  }}
                  placeholder="https://github.com/username/repository"
                  className="h-14 w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
                />
              </div>

              <button
                onClick={analyzeRepository}
                disabled={loading}
                className="h-14 rounded-xl bg-white px-7 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Analyzing..." : "Analyze Repository"}
              </button>
            </div>

            <p className="px-2 pt-3 text-left text-xs text-zinc-600">
              Public repositories only • No GitHub login required for V1
            </p>
          </div>

          {error && (
            <div className="mt-6 w-full max-w-3xl rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-left text-sm text-red-300">
              {error}
            </div>
          )}

          {repoData && (
            <div className="mt-10 w-full max-w-3xl rounded-3xl border border-white/10 bg-white/[0.035] p-6 text-left backdrop-blur sm:p-8">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-violet-300">
                    Repository Analysis
                  </p>

                  <h3 className="mt-3 text-3xl font-semibold">
                    {repoData.name}
                  </h3>

                  <p className="mt-2 text-sm text-zinc-500">
                    @{repoData.owner}
                  </p>
                </div>

                {repoData.github_url && (
                  <a
                    href={repoData.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
                  >
                    View Repository ↗
                  </a>
                )}
              </div>

              <p className="mt-6 leading-7 text-zinc-400">
                {repoData.description || "No repository description provided."}
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs text-zinc-600">Language</p>
                  <p className="mt-2 font-semibold">
                    {repoData.language || "Unknown"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs text-zinc-600">Stars</p>
                  <p className="mt-2 font-semibold">
                    {repoData.stars}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs text-zinc-600">Forks</p>
                  <p className="mt-2 font-semibold">
                    {repoData.forks}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs text-zinc-600">Open Issues</p>
                  <p className="mt-2 font-semibold">
                    {repoData.open_issues}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs text-zinc-600">Default Branch</p>
                  <p className="mt-2 text-sm font-medium">
                    {repoData.default_branch || "Unknown"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs text-zinc-600">Last Updated</p>
                  <p className="mt-2 text-sm font-medium">
                    {repoData.updated_at
                      ? new Date(repoData.updated_at).toLocaleDateString()
                      : "Unknown"}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-violet-400/10 bg-violet-400/[0.04] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-violet-300">
                  TraceProof Status
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Repository detected successfully. Deeper commit analysis,
                  skill evidence and debugging history will be added in the
                  next TraceProof engine versions.
                </p>
              </div>
            </div>
          )}
        </section>

        <section
          id="features"
          className="mx-auto max-w-7xl border-t border-white/5 px-6 py-24 lg:px-10"
        >
          <div className="mb-12 max-w-2xl">
            <p className="text-sm font-medium text-violet-300">
              Beyond a portfolio
            </p>

            <h3 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Your development history becomes evidence.
            </h3>

            <p className="mt-4 leading-7 text-zinc-500">
              TraceProof focuses on the journey behind the code instead of
              simply counting repositories.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-7">
              <div className="mb-8 text-2xl">⌁</div>
              <h4 className="text-lg font-semibold">Debug Replay</h4>
              <p className="mt-3 text-sm leading-6 text-zinc-500">
                Reconstruct code evolution from failed attempts to the final
                solution.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-7">
              <div className="mb-8 text-2xl">◇</div>
              <h4 className="text-lg font-semibold">
                Skill Evidence Graph
              </h4>
              <p className="mt-3 text-sm leading-6 text-zinc-500">
                Connect technologies and skills directly to commits, projects
                and real code.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-7">
              <div className="mb-8 text-2xl">◉</div>
              <h4 className="text-lg font-semibold">
                Recruiter Challenge
              </h4>
              <p className="mt-3 text-sm leading-6 text-zinc-500">
                Generate interview questions from the developer&apos;s own
                repository history.
              </p>
            </div>
          </div>
        </section>

        <footer
          id="about"
          className="border-t border-white/5 px-6 py-8 text-center text-sm text-zinc-600"
        >
          TraceProof • Build history. Prove growth.
        </footer>
      </div>
    </main>
  );
}