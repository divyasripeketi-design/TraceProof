"use client";

import { useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
  confidence: "Verified" | "Supported" | "Inferred";
  evidence_count: number;
  evidence: string[];
};

type DebugReplayEvent = {
  step: number;
  sha: string | null;
  message: string | null;
  date: string | null;
  github_url: string | null;
  stage: string;
  signal: string;
  reason: string;
  files_changed: number;
  additions: number;
  deletions: number;
  files: string[];
};

type DebugReplay = {
  event_count: number;
  explicit_fix_detected: boolean;
  stages_detected: string[];
  summary: string;
  events: DebugReplayEvent[];
};

type ProofBreakdownItem = {
  score: number;
  max: number;
  count?: number;
  files_scanned?: number;
  detected?: boolean;
};

type ProofScore = {
  score: number;
  max_score: number;
  level: string;

  breakdown: {
    verified_skills: ProofBreakdownItem;
    supported_skills: ProofBreakdownItem;
    commit_evidence: ProofBreakdownItem;
    repository_depth: ProofBreakdownItem;
    development_stages: ProofBreakdownItem;
    explicit_fix_evidence: ProofBreakdownItem;
  };

  evidence_summary: {
    verified_skills: number;
    supported_skills: number;
    inferred_skills: number;
    commits_analyzed: number;
    files_scanned: number;
    stages_detected: number;
  };

  note: string;
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

  debug_replay: DebugReplay;
  proof_score: ProofScore;
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
      const response = await fetch(`${API_URL}/analyze`, {
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
        throw new Error(
          data.detail || "Unable to analyze repository."
        );
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
        {/* Navbar */}
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/10 text-lg font-bold text-violet-300">
              T
            </div>

            <div>
              <h1 className="text-lg font-semibold">
                TraceProof
              </h1>

              <p className="text-xs text-zinc-500">
                Evidence over claims.
              </p>
            </div>
          </div>

          <div className="hidden gap-8 text-sm text-zinc-400 md:flex">
            <a href="#product" className="hover:text-white">
              Product
            </a>

            <a href="#features" className="hover:text-white">
              Features
            </a>

            <a href="#about" className="hover:text-white">
              About
            </a>
          </div>
        </nav>

        {/* Hero */}
        <section
          id="product"
          className="mx-auto flex max-w-5xl flex-col items-center px-6 pb-20 pt-20 text-center"
        >
          <div className="mb-6 rounded-full border border-violet-400/20 bg-violet-400/5 px-4 py-2 text-xs text-violet-300">
            Developer Proof Engine • V1
          </div>

          <h2 className="max-w-4xl text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            Don&apos;t tell recruiters

            <span className="block bg-gradient-to-r from-violet-300 via-fuchsia-300 to-blue-300 bg-clip-text text-transparent">
              what you know.
            </span>

            Prove it.
          </h2>

          <p className="mt-7 max-w-2xl text-zinc-400 sm:text-lg">
            TraceProof transforms GitHub history into verifiable
            evidence of how developers build, learn and solve
            engineering problems.
          </p>

          {/* Analyzer */}
          <div className="mt-12 w-full max-w-3xl rounded-2xl border border-white/10 bg-white/[0.035] p-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={repoUrl}
                onChange={(event) =>
                  setRepoUrl(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    analyzeRepository();
                  }
                }}
                placeholder="https://github.com/username/repository"
                className="h-14 flex-1 rounded-xl border border-white/10 bg-black/30 px-4 text-sm outline-none placeholder:text-zinc-600"
              />

              <button
                onClick={analyzeRepository}
                disabled={loading}
                className="h-14 rounded-xl bg-white px-7 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-60"
              >
                {loading
                  ? "Analyzing..."
                  : "Analyze Repository"}
              </button>
            </div>

            <p className="px-2 pt-3 text-left text-xs text-zinc-600">
              Public repositories only • No GitHub login required
              for V1
            </p>
          </div>

          {error && (
            <div className="mt-6 w-full max-w-3xl rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-left text-sm text-red-300">
              {error}
            </div>
          )}

          {repoData && (
            <div className="mt-10 w-full max-w-3xl space-y-6 text-left">
              {/* Repository Analysis */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-8">
                <p className="text-xs uppercase tracking-[0.18em] text-violet-300">
                  Repository Analysis
                </p>

                <div className="mt-3 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-3xl font-semibold">
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
                      className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300"
                    >
                      View Repository ↗
                    </a>
                  )}
                </div>

                <p className="mt-6 leading-7 text-zinc-400">
                  {repoData.description ||
                    "No description provided."}
                </p>

                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Stat
                    label="Language"
                    value={repoData.language || "Unknown"}
                  />

                  <Stat label="Stars" value={repoData.stars} />

                  <Stat label="Forks" value={repoData.forks} />

                  <Stat
                    label="Open Issues"
                    value={repoData.open_issues}
                  />
                </div>
              </div>

              {/* Proof Score */}
              <div className="rounded-3xl border border-violet-400/20 bg-gradient-to-b from-violet-400/[0.07] to-white/[0.025] p-8">
                <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-violet-300">
                      Evidence Strength
                    </p>

                    <h3 className="mt-2 text-2xl font-semibold">
                      TraceProof Score
                    </h3>

                    <p className="mt-3 text-sm text-zinc-500">
                      Transparent repository evidence score
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="flex items-end gap-1 sm:justify-end">
                      <span className="text-6xl font-semibold tracking-tight">
                        {repoData.proof_score.score}
                      </span>

                      <span className="mb-2 text-lg text-zinc-600">
                        /{repoData.proof_score.max_score}
                      </span>
                    </div>

                    <span className="mt-2 inline-block rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs text-violet-300">
                      {repoData.proof_score.level}
                    </span>
                  </div>
                </div>

                <div className="mt-7 h-3 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-blue-400"
                    style={{
                      width: `${repoData.proof_score.score}%`,
                    }}
                  />
                </div>

                <div className="mt-8 space-y-4">
                  <ScoreRow
                    label="Verified Skills"
                    score={
                      repoData.proof_score.breakdown
                        .verified_skills.score
                    }
                    max={
                      repoData.proof_score.breakdown
                        .verified_skills.max
                    }
                    detail={`${repoData.proof_score.breakdown.verified_skills.count ?? 0} verified`}
                  />

                  <ScoreRow
                    label="Supported Skills"
                    score={
                      repoData.proof_score.breakdown
                        .supported_skills.score
                    }
                    max={
                      repoData.proof_score.breakdown
                        .supported_skills.max
                    }
                    detail={`${repoData.proof_score.breakdown.supported_skills.count ?? 0} supported`}
                  />

                  <ScoreRow
                    label="Commit Evidence"
                    score={
                      repoData.proof_score.breakdown
                        .commit_evidence.score
                    }
                    max={
                      repoData.proof_score.breakdown
                        .commit_evidence.max
                    }
                    detail={`${repoData.proof_score.breakdown.commit_evidence.count ?? 0} commits`}
                  />

                  <ScoreRow
                    label="Repository Depth"
                    score={
                      repoData.proof_score.breakdown
                        .repository_depth.score
                    }
                    max={
                      repoData.proof_score.breakdown
                        .repository_depth.max
                    }
                    detail={`${repoData.proof_score.breakdown.repository_depth.files_scanned ?? 0} files`}
                  />

                  <ScoreRow
                    label="Development Stages"
                    score={
                      repoData.proof_score.breakdown
                        .development_stages.score
                    }
                    max={
                      repoData.proof_score.breakdown
                        .development_stages.max
                    }
                    detail={`${repoData.proof_score.breakdown.development_stages.count ?? 0} stages`}
                  />

                  <ScoreRow
                    label="Explicit Fix Evidence"
                    score={
                      repoData.proof_score.breakdown
                        .explicit_fix_evidence.score
                    }
                    max={
                      repoData.proof_score.breakdown
                        .explicit_fix_evidence.max
                    }
                    detail={
                      repoData.proof_score.breakdown
                        .explicit_fix_evidence.detected
                        ? "Detected"
                        : "Not detected"
                    }
                  />
                </div>

                <div className="mt-7 rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">
                    How to read this score
                  </p>

                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    {repoData.proof_score.note}
                  </p>
                </div>
              </div>

              {/* Developer Proof Summary */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-8">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-violet-300">
                      Recruiter Snapshot
                    </p>

                    <h3 className="mt-2 text-2xl font-semibold">
                      Developer Proof Summary
                    </h3>
                  </div>

                  <span className="w-fit rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1 text-xs text-emerald-300">
                    Evidence-backed
                  </span>
                </div>

                <p className="mt-5 text-sm leading-7 text-zinc-400">
                  This repository provides evidence across{" "}
                  <span className="text-zinc-200">
                    {repoData.skill_count} detected skills
                  </span>
                  ,{" "}
                  <span className="text-zinc-200">
                    {repoData.commit_count_loaded} analyzed commits
                  </span>{" "}
                  and{" "}
                  <span className="text-zinc-200">
                    {repoData.files_scanned} repository files
                  </span>
                  .
                </p>

                <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <SummaryStat
                    label="Verified Skills"
                    value={
                      repoData.proof_score.evidence_summary
                        .verified_skills
                    }
                  />

                  <SummaryStat
                    label="Supported Skills"
                    value={
                      repoData.proof_score.evidence_summary
                        .supported_skills
                    }
                  />

                  <SummaryStat
                    label="Commits"
                    value={
                      repoData.proof_score.evidence_summary
                        .commits_analyzed
                    }
                  />

                  <SummaryStat
                    label="Replay Stages"
                    value={
                      repoData.proof_score.evidence_summary
                        .stages_detected
                    }
                  />
                </div>

                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                    <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">
                      Strongest Evidence
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {repoData.skills
                        .filter(
                          (skill) =>
                            skill.confidence === "Verified"
                        )
                        .map((skill) => (
                          <span
                            key={skill.name}
                            className="rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1 text-xs text-emerald-300"
                          >
                            ✓ {skill.name}
                          </span>
                        ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                    <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">
                      Development Path
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {repoData.debug_replay.stages_detected.map(
                        (stage, index) => (
                          <div
                            key={`${stage}-${index}`}
                            className="flex items-center gap-2"
                          >
                            <span className="rounded-full bg-violet-400/10 px-3 py-1 text-xs text-violet-300">
                              {stage}
                            </span>

                            {index <
                              repoData.debug_replay.stages_detected.length -
                                1 && (
                              <span className="text-zinc-700">
                                →
                              </span>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Skill Evidence */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-8">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
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
                      <div className="flex flex-col justify-between gap-4 sm:flex-row">
                        <div>
                          <h4 className="font-semibold">
                            {skill.name}
                          </h4>

                          <p className="mt-1 text-xs text-zinc-500">
                            {skill.confidence} evidence
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <ConfidenceBadge
                            confidence={skill.confidence}
                          />

                          <span className="rounded-full bg-violet-400/10 px-3 py-1 text-xs text-violet-300">
                            {skill.evidence_count} proof
                            {skill.evidence_count !== 1 ? "s" : ""}
                          </span>
                        </div>
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

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <InfoCard
                    title="Verified"
                    text="Direct source-file evidence."
                  />

                  <InfoCard
                    title="Supported"
                    text="Strong framework or tooling signals."
                  />

                  <InfoCard
                    title="Inferred"
                    text="Likely skill based on repository structure."
                  />
                </div>
              </div>

              {/* Debug Replay */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-8">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-violet-300">
                      Development Evolution
                    </p>

                    <h3 className="mt-2 text-2xl font-semibold">
                      Debug Replay
                    </h3>
                  </div>

                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400">
                    {repoData.debug_replay.event_count} stages
                  </span>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="flex flex-wrap gap-2">
                    {repoData.debug_replay.stages_detected.map(
                      (stage) => (
                        <span
                          key={stage}
                          className="rounded-full bg-violet-400/10 px-3 py-1 text-xs text-violet-300"
                        >
                          {stage}
                        </span>
                      )
                    )}
                  </div>

                  <p className="mt-4 text-sm leading-6 text-zinc-400">
                    {repoData.debug_replay.summary}
                  </p>

                  <div className="mt-4">
                    {repoData.debug_replay.explicit_fix_detected ? (
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1 text-xs text-emerald-300">
                        ✓ Explicit bug-fix evidence detected
                      </span>
                    ) : (
                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-500">
                        No explicit bug-fix commit detected
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  {repoData.debug_replay.events.map((event) => (
                    <div
                      key={`${event.step}-${event.sha}`}
                      className="rounded-2xl border border-white/10 bg-black/20 p-5"
                    >
                      <div className="flex flex-col justify-between gap-4 sm:flex-row">
                        <div className="flex gap-4">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-violet-400/20 bg-violet-400/10 text-sm text-violet-300">
                            {event.step}
                          </div>

                          <div>
                            <div className="flex flex-wrap gap-2">
                              <span className="rounded-full bg-violet-400/10 px-3 py-1 text-xs text-violet-300">
                                {event.stage}
                              </span>

                              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-500">
                                {event.signal}
                              </span>

                              <span className="font-mono text-xs text-zinc-600">
                                {event.sha}
                              </span>
                            </div>

                            <h4 className="mt-4 whitespace-pre-line font-medium">
                              {event.message}
                            </h4>

                            <p className="mt-3 text-sm leading-6 text-zinc-500">
                              {event.reason}
                            </p>
                          </div>
                        </div>

                        {event.github_url && (
                          <a
                            href={event.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-violet-300"
                          >
                            View Commit ↗
                          </a>
                        )}
                      </div>

                      <div className="mt-5 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-3">
                        <EvidenceStat
                          label="Files Changed"
                          value={event.files_changed}
                        />

                        <EvidenceStat
                          label="Additions"
                          value={`+${event.additions}`}
                        />

                        <EvidenceStat
                          label="Deletions"
                          value={`-${event.deletions}`}
                        />
                      </div>

                      {event.files.length > 0 && (
                        <div className="mt-5 flex flex-wrap gap-2">
                          {event.files.map((file) => (
                            <span
                              key={file}
                              className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 font-mono text-xs text-zinc-500"
                            >
                              {file}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Commit Timeline */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-8">
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-violet-300">
                      Developer History
                    </p>

                    <h3 className="mt-2 text-2xl font-semibold">
                      Commit Timeline
                    </h3>
                  </div>

                  <span className="h-fit rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400">
                    {repoData.commit_count_loaded} loaded
                  </span>
                </div>

                <div className="mt-8 space-y-5">
                  {repoData.commits.map((commit) => (
                    <div
                      key={commit.sha}
                      className="rounded-2xl border border-white/10 bg-black/20 p-5"
                    >
                      <div className="flex flex-col justify-between gap-4 sm:flex-row">
                        <div>
                          <span className="rounded-md bg-violet-400/10 px-2 py-1 font-mono text-xs text-violet-300">
                            {commit.sha}
                          </span>

                          <h4 className="mt-4 whitespace-pre-line font-medium">
                            {commit.message}
                          </h4>

                          <p className="mt-2 text-sm text-zinc-500">
                            by {commit.author || "Unknown author"}
                          </p>

                          <p className="mt-1 text-xs text-zinc-600">
                            {commit.date
                              ? new Date(
                                  commit.date
                                ).toLocaleString()
                              : "Unknown date"}
                          </p>
                        </div>

                        {commit.github_url && (
                          <a
                            href={commit.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-violet-300"
                          >
                            View Commit ↗
                          </a>
                        )}
                      </div>

                      <div className="mt-6 border-t border-white/10 pt-5">
                        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                          Commit Evidence
                        </p>

                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <EvidenceStat
                            label="Files Changed"
                            value={
                              commit.evidence.files_changed
                            }
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

                        <div className="mt-5 space-y-2">
                          {commit.evidence.files.map(
                            (file, index) => (
                              <div
                                key={`${file.filename}-${index}`}
                                className="flex flex-col justify-between gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 sm:flex-row"
                              >
                                <div>
                                  <p className="break-all font-mono text-xs text-zinc-300">
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
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="rounded-2xl border border-violet-400/10 bg-violet-400/[0.04] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-violet-300">
                  TraceProof Status
                </p>

                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Proof Score, repository analysis, developer proof
                  summary, skill evidence, confidence signals,
                  development replay, commit history and commit
                  evidence detected successfully.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Roadmap */}
        <section
          id="features"
          className="mx-auto max-w-7xl border-t border-white/5 px-6 py-24"
        >
          <p className="text-sm text-violet-300">
            TraceProof roadmap
          </p>

          <h3 className="mt-3 text-3xl font-semibold">
            Coming next
          </h3>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <InfoCard
              title="Skill Evidence Graph"
              text="Visualize connections between skills, commits and source files."
            />

            <InfoCard
              title="Recruiter Challenge"
              text="Generate interview questions from actual developer history."
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
      <p className="text-xs text-zinc-600">
        {label}
      </p>

      <p className="mt-2 font-semibold">
        {value}
      </p>
    </div>
  );
}

function SummaryStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs text-zinc-600">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold">
        {value}
      </p>
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
      <p className="text-xs text-zinc-600">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold">
        {value}
      </p>
    </div>
  );
}

function ScoreRow({
  label,
  score,
  max,
  detail,
}: {
  label: string;
  score: number;
  max: number;
  detail: string;
}) {
  const percentage =
    max > 0 ? Math.min((score / max) * 100, 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-300">
            {label}
          </p>

          <p className="text-xs text-zinc-600">
            {detail}
          </p>
        </div>

        <p className="text-sm font-semibold">
          {score}
          <span className="text-zinc-600">
            /{max}
          </span>
        </p>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-violet-400"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

function ConfidenceBadge({
  confidence,
}: {
  confidence: "Verified" | "Supported" | "Inferred";
}) {
  return (
    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300">
      {confidence === "Verified" && "✓ "}
      {confidence}
    </span>
  );
}

function InfoCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-5">
      <p className="font-medium text-zinc-300">
        {title}
      </p>

      <p className="mt-2 text-sm leading-6 text-zinc-500">
        {text}
      </p>
    </div>
  );
}