"use client";

import { useState } from "react";

type ApiResponse = {
  analysis: string;
  coverLetter: string;
  matchScore: number;
};

export default function EnPage() {
  const [cvText, setCvText] = useState("");
  const [jobAdText, setJobAdText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/generate-application-en", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText, jobAdText }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // no JSON body
      }

      if (!res.ok) {
        console.error("API error status:", res.status, data);
        setError(
          data?.error ||
            `Server returned an error (status ${res.status}).`
        );
        return;
      }

      setResult(data as ApiResponse);
    } catch (err) {
      console.error(err);
      setError("Network error or unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-slate-900 rounded-2xl shadow-lg border border-slate-800 p-6 md:p-10 space-y-8">
        <header className="flex items-baseline justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              JobCopilot <span className="text-sky-400 text-lg">EN</span>
            </h1>
            <p className="text-slate-400">
              Paste your resume/profile and a job description. The app uses a
              Groq LLM to analyse the match and generate a tailored cover letter.
            </p>
          </div>
          <div className="text-xs text-slate-500 text-right">
            <div className="font-semibold text-slate-300">Language</div>
            <div>Current: EN</div>
            <div>
              Finnish version:{" "}
              <a
                href="/"
                className="text-sky-400 hover:underline"
              >
                / (FI)
              </a>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
          <div className="flex flex-col space-y-2">
            <label className="font-semibold">Resume / profile summary</label>
            <textarea
              className="min-h-[220px] rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Paste your resume or a short description of your experience..."
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="font-semibold">Job description</label>
            <textarea
              className="min-h-[220px] rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Paste the job description text here..."
              value={jobAdText}
              onChange={(e) => setJobAdText(e.target.value)}
              required
            />
          </div>

          <div className="md:col-span-2 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              JobCopilot uses a Groq-hosted LLM to analyse the fit and draft a
              cover letter. Review and edit the result before sending.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-semibold shadow-sm"
            >
              {loading ? "Analysing..." : "Generate application"}
            </button>
          </div>
        </form>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Result</h2>

          {error && (
            <div className="text-sm text-red-400 bg-red-950/40 border border-red-700 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          {!error && !result && !loading && (
            <p className="text-sm text-slate-500">
              Fill in the fields and click &quot;Generate application&quot; to
              see the analysis and a draft cover letter.
            </p>
          )}

          {result && (
            <div className="space-y-2 mb-2">
              <p className="text-sm text-slate-300">
                Match score:{" "}
                <span className="font-semibold">
                  {result.matchScore} / 100
                </span>
              </p>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-sky-500"
                  style={{
                    width: `${Math.max(0, Math.min(100, result.matchScore))}%`,
                  }}
                />
              </div>
            </div>
          )}

          {result && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <h3 className="font-semibold mb-2 text-sky-400">Analysis</h3>
                <p className="text-sm whitespace-pre-line">
                  {result.analysis}
                </p>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <h3 className="font-semibold mb-2 text-sky-400">
                  Cover letter (draft)
                </h3>
                <p className="text-sm whitespace-pre-line">
                  {result.coverLetter}
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}