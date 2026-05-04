"use client";

import { useState } from "react";
import Link from "next/link";

export default function Page() {
  const [cvText, setCvText] = useState("");
  const [jobAdText, setJobAdText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (result?.coverLetter) {
      navigator.clipboard.writeText(result.coverLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Huom: varmista että sinulla on api-reitti myös englanninkielisille pyynnöille 
      // tai käytä samaa reittiä ja lisää kieliparametri
      const res = await fetch("/api/generate-application-en", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText, jobAdText }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-brand-bg text-zinc-200 font-sans tracking-tight">
      {/* Navigation */}
      <nav className="border-b border-brand-border/50 bg-brand-bg/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
              <span className="text-black font-black text-xs italic">JC</span>
            </div>
            <span className="font-medium text-white tracking-widest uppercase text-sm">JobCopilot</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-[10px] font-bold tracking-[0.2em] uppercase">
              <Link href="/" className="text-zinc-500 hover:text-zinc-100 transition-colors">
                FI
              </Link>
              <span className="text-white border-b border-white pb-0.5 pointer-events-none">EN</span>
            </div>
            <div className="hidden sm:block text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase border border-zinc-800 px-3 py-1 rounded">
              Professional Suite
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16 space-y-24">
        
        {/* Hero Section */}
        <section className="max-w-2xl animate-premium-in">
          <h1 className="text-5xl font-light text-white mb-6 leading-[1.1]">
            Analyze your fit <br/>
            <span className="text-zinc-500 italic font-serif">in seconds.</span>
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed font-light">
            A tool that removes guesswork from job hunting. Enter your details and let the algorithm fine-tune your message.
          </p>
        </section>

        {/* Workspace */}
        <div className="grid lg:grid-cols-[1fr,350px] gap-16">
          <section>
            <form onSubmit={handleSubmit} className="space-y-12">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] block">Curriculum Vitae</label>
                  <textarea
                    className="w-full h-80 bg-brand-card/50 border border-brand-border p-6 text-sm focus:border-zinc-500 transition-colors outline-none resize-none font-light leading-relaxed"
                    placeholder="Paste your CV..."
                    value={cvText}
                    onChange={(e) => setCvText(e.target.value)}
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] block">Job Description</label>
                  <textarea
                    className="w-full h-80 bg-brand-card/50 border border-brand-border p-6 text-sm focus:border-zinc-500 transition-colors outline-none resize-none font-light leading-relaxed"
                    placeholder="Paste job ad..."
                    value={jobAdText}
                    onChange={(e) => setJobAdText(e.target.value)}
                  />
                </div>
              </div>
              <button
                disabled={loading}
                className="w-full py-4 bg-white text-black font-medium hover:bg-zinc-200 transition-all disabled:opacity-30 uppercase text-xs tracking-[0.2em]"
              >
                {loading ? "Processing..." : "Start Analysis"}
              </button>
            </form>
          </section>

          {/* Match Score Sidebar */}
          <aside className="border-l border-brand-border pl-16 hidden lg:block">
            <div className="sticky top-32 space-y-12">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Match Score</h3>
              {result ? (
                <div className="space-y-4 animate-premium-in">
                  <div className="text-7xl font-thin text-white tracking-tighter">
                    {result.matchScore}<span className="text-zinc-700 text-3xl">%</span>
                  </div>
                  <div className="h-[1px] w-full bg-zinc-800">
                    <div className="h-[1px] bg-white transition-all duration-1000" style={{ width: `${result.matchScore}%` }} />
                  </div>
                </div>
              ) : (
                <div className="text-zinc-600 italic text-sm">Awaiting data...</div>
              )}
            </div>
          </aside>
        </div>

        {/* Results */}
        {result && (
          <section className="animate-premium-in border-t border-brand-border pt-24">
            <div className="grid md:grid-cols-2 gap-16">
              <div className="space-y-6">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Strategic Insights</h3>
                <div className="text-zinc-300 font-light leading-relaxed text-base whitespace-pre-line">
                  {result.analysis}
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Cover Letter</h3>
                  <button 
                    onClick={handleCopy}
                    className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <div className="p-10 bg-brand-card border border-brand-border text-zinc-300 font-serif italic leading-loose text-lg shadow-2xl">
                  {result.coverLetter}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}