"use client";

import { useState } from "react";

type ChangedFile = {
  filename: string | null;
  status: string | null;
  additions: number;
  deletions: number;
};

type CommitEvidence = {
  files_changed: number;
  additions: number;
  deletions: number;
  files: ChangedFile[];
};

type CommitData = {
  sha: string;
  message: string | null;
  author: string | null;
  date: string | null;
  github_url: string | null;
  evidence: CommitEvidence;
};
type SkillData = {
  name: string;
  evidence_count: number;
  evidence: string[];
};
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
  files_scanned: number;
skill_count: number;
skills: SkillData[];
  commit_count_loaded: number;
  commits: CommitData[];
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
              <h1 className="text-lg font-semibold">TraceProof</h1>
              <p className="text-xs text-zinc-500">Evidence over claims.</p>
            </div>
          </div>

          <div className="hidden gap-8 text-sm text-zinc-400 md:flex">
            <a href="#product">Product</a>
            <a href="#features">Features</a>
            <a href="#about">About</a>
          </div>
        </nav>

        <section
          id="product"
          className="mx-auto flex max-w-5xl flex-col items-center px-6 pb-20 pt-20 text-center"
        >
          <div className="mb-6 rounded-full border border-violet-400/20 bg-violet-400/5 px-4 py-2 text-xs text-violet-300">
            Developer Proof Engine • V1
          </div>

          <h2 className="max-w-4xl text-5xl font-semibold sm:text-6xl lg:text-7xl">
            Don&apos;t tell recruiters
            <span className="block bg-gradient-to-r from-violet-300 via-fuchsia-300 to-blue-300 bg-clip-text text-transparent">
              what you know.
            </span>
            Prove it.
          </h2>

          <p className="mt-7 max-w-2xl text-zinc-400 sm:text-lg">
            TraceProof transforms your GitHub history into verifiable evidence
            of how you build, debug, learn and solve engineering problems.
          </p>

          <div className="mt-12 w-full max-w-3xl rounded-2xl border border-white/10 bg-white/[0.035] p-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") analyzeRepository();
                }}
                placeholder="https://github.com/username/repository"
                className="h-14 flex-1 rounded-xl border border-white/10 bg-black/30 px-4 text-sm outline-none"
              />

              <button
                onClick={analyzeRepository}
                disabled={loading}
                className="h-14 rounded-xl bg-white px-7 text-sm font-semibold text-black disabled:opacity-60"
              >
                {loading ? "Analyzing..." : "Analyze Repository"}
              </button>
            </div>

            <p className="px-2 pt-3 text-left text-xs text-zinc-600">
              Public repositories only • No GitHub login required for V1
            </p>
          </div>

          {error && (
            <div className="mt-6 w-full max-w-3xl rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-left text-red-300">
              {error}
            </div>
          )}

          {repoData && (
            <div className="mt-10 w-full max-w-3xl space-y-6 text-left">
              <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-8">
                <p className="text-xs uppercase tracking-[0.18em] text-violet-300">
                  Repository Analysis
                </p>

                <div className="mt-3 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-3xl font-semibold">{repoData.name}</h3>

                    <p className="mt-2 text-sm text-zinc-500">
                      @{repoData.owner}
                    </p>
                  </div>

                  {repoData.github_url && (
                    <a
                      href={repoData.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300"
                    >
                      View Repository ↗
                    </a>
                  )}
                </div>

                <p className="mt-6 text-zinc-400">
                  {repoData.description || "No description provided."}
                </p>

                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Stat label="Language" value={repoData.language || "Unknown"} />
                  <Stat label="Stars" value={repoData.stars} />
                  <Stat label="Forks" value={repoData.forks} />
                  <Stat label="Open Issues" value={repoData.open_issues} />
                </div>
              </div>
{/* Skill Evidence */}
<div className="rounded-3xl border border-white/10 bg-white/[0.035] p-8">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-violet-300">
        Verified Technology Signals
      </p>

      <h3 className="mt-2 text-2xl font-semibold">
        Skill Evidence
      </h3>
    </div>

    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400">
      {repoData.skill_count} skills
    </span>
  </div>

  <p className="mt-3 text-sm text-zinc-500">
    {repoData.files_scanned} repository files scanned
  </p>

  <div className="mt-8 grid gap-4 sm:grid-cols-2">
    {repoData.skills.map((skill) => (
      <div
        key={skill.name}
        className="rounded-2xl border border-white/10 bg-black/20 p-5"
      >
        <div className="flex items-center justify-between gap-4">
          <h4 className="font-semibold text-zinc-100">
            {skill.name}
          </h4>

          <span className="rounded-full bg-violet-400/10 px-3 py-1 text-xs text-violet-300">
            {skill.evidence_count} proof
            {skill.evidence_count !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="mt-4 space-y-2">
          {skill.evidence.map((item) => (
            <div
              key={item}
              className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
            >
              <p className="break-all font-mono text-xs text-zinc-500">
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
</div>
              {/* Commit Timeline */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-violet-300">
                      Developer History
                    </p>

                    <h3 className="mt-2 text-2xl font-semibold">
                      Commit Timeline
                    </h3>
                  </div>

                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400">
                    {repoData.commit_count_loaded} loaded
                  </span>
                </div>

                <div className="mt-8 space-y-5">
                  {repoData.commits.length === 0 ? (
                    <p className="text-sm text-zinc-500">
                      No commits were found.
                    </p>
                  ) : (
                    repoData.commits.map((commit) => (
                      <div
                        key={commit.sha}
                        className="rounded-2xl border border-white/10 bg-black/20 p-5"
                      >
                        <div className="flex flex-col justify-between gap-4 sm:flex-row">
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="rounded-md bg-violet-400/10 px-2 py-1 font-mono text-xs text-violet-300">
                                {commit.sha}
                              </span>

                              <span className="text-xs text-zinc-600">
                                Commit
                              </span>
                            </div>

                            <h4 className="mt-4 font-medium text-zinc-100">
                              {commit.message}
                            </h4>

                            <p className="mt-2 text-sm text-zinc-500">
                              by {commit.author || "Unknown author"}
                            </p>

                            <p className="mt-1 text-xs text-zinc-600">
                              {commit.date
                                ? new Date(commit.date).toLocaleString()
                                : "Unknown date"}
                            </p>
                          </div>

                          {commit.github_url && (
                            <a
                              href={commit.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-violet-300 hover:text-violet-200"
                            >
                              View Commit ↗
                            </a>
                          )}
                        </div>

                        {/* Commit Evidence */}
                        <div className="mt-6 border-t border-white/10 pt-5">
                          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                            Commit Evidence
                          </p>

                          <div className="mt-4 grid grid-cols-3 gap-3">
                            <EvidenceStat
                              label="Files Changed"
                              value={commit.evidence.files_changed}
                            />

                            <EvidenceStat
                              label="Additions"
                              value={`+${commit.evidence.additions}`}
                            />

                            <EvidenceStat
                              label="Deletions"
                              value={`-${commit.evidence.deletions}`}
                            />
                          </div>

                          {commit.evidence.files.length > 0 && (
                            <div className="mt-5">
                              <p className="mb-3 text-xs text-zinc-600">
                                Changed Files
                              </p>

                              <div className="space-y-2">
                                {commit.evidence.files.map((file) => (
                                  <div
                                    key={file.filename}
                                    className="flex flex-col justify-between gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 sm:flex-row sm:items-center"
                                  >
                                    <div>
                                      <p className="font-mono text-xs text-zinc-300">
                                        {file.filename}
                                      </p>

                                      <p className="mt-1 text-xs capitalize text-zinc-600">
                                        {file.status}
                                      </p>
                                    </div>

                                    <div className="flex gap-3 text-xs">
                                      <span className="text-emerald-400">
                                        +{file.additions}
                                      </span>

                                      <span className="text-red-400">
                                        -{file.deletions}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-violet-400/10 bg-violet-400/[0.04] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-violet-300">
                  TraceProof Status
                </p>

                <p className="mt-2 text-sm text-zinc-400">
                  Repository, commit history and commit evidence detected
                  successfully.
                </p>
              </div>
            </div>
          )}
        </section>

        <section
          id="features"
          className="mx-auto max-w-7xl border-t border-white/5 px-6 py-24"
        >
          <h3 className="text-3xl font-semibold">Coming next</h3>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <Feature
              title="Debug Replay"
              text="Understand how code evolved from problems to solutions."
            />

            <Feature
              title="Skill Evidence Graph"
              text="Connect skills directly to real commits and code."
            />

            <Feature
              title="Recruiter Challenge"
              text="Generate interview questions from actual project history."
            />
          </div>
        </section>

        <footer
          id="about"
          className="border-t border-white/5 py-8 text-center text-sm text-zinc-600"
        >
          TraceProof • Build history. Prove growth.
        </footer>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs text-zinc-600">{label}</p>
      <p className="mt-2 font-semibold">{value}</p>
    </div>
  );
}

function EvidenceStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-3">
      <p className="text-xs text-zinc-600">{label}</p>
      <p className="mt-2 text-sm font-semibold text-zinc-200">{value}</p>
    </div>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-7">
      <h4 className="text-lg font-semibold">{title}</h4>
      <p className="mt-3 text-sm leading-6 text-zinc-500">{text}</p>
    </div>
  );
}