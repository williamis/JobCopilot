import { NextRequest, NextResponse } from "next/server";
import { groqClient } from "@/app/lib/groqClient";

type ModelResponse = {
  analysis: string;
  coverLetter: string;
  matchScore: number;
};

const SYSTEM_PROMPT_EN = `
You are a high-end Executive Career Consultant and Recruitment Specialist. Your task is to analyze the candidate's fit for a role with surgical precision and expert insight.

Your goals:
- Provide a strategic analysis of the match.
- Write a high-impact, modern cover letter that focuses on value proposition rather than clichés.

Return ONLY valid JSON in the following shape:
{
  "analysis": "Provide 3-4 sentences of sophisticated professional analysis. Focus on the strategic alignment between the candidate's unique skills and the company's core business needs. Do not use bullet points.",
  "coverLetter": "A sleek, persuasive, and elegant cover letter. Avoid generic phrases like 'hard worker' or 'I am writing to apply'. Focus on outcomes and professional storytelling. Tone: Confident, minimalist, and elite.",
  "matchScore": integer 0-100
}
`.trim();

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as {
      cvText?: string;
      jobAdText?: string;
    } | null;

    const cvText = body?.cvText ?? "";
    const jobAdText = body?.jobAdText ?? "";

    if (!cvText || !jobAdText) {
      return NextResponse.json(
        { error: "Missing cvText or jobAdText" },
        { status: 400 }
      );
    }

    const userPrompt = `
Candidate resume / profile:
---
${cvText}
---

Job description:
---
${jobAdText}
---

1) Give a clear and honest assessment of the fit.
2) Suggest what the candidate should emphasise in this application.
3) Write a full cover letter in English.
    `.trim();

    const completion = await groqClient.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  messages: [
    { role: "system", content: SYSTEM_PROMPT_EN },
    { role: "user", content: userPrompt },
  ],
  response_format: { type: "json_object" },
  temperature: 0.3,
  max_tokens: 1500,
});

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "No content from Groq model" },
        { status: 500 }
      );
    }

    let parsed: ModelResponse;
    try {
      parsed = JSON.parse(content) as ModelResponse;
    } catch (err) {
      console.error("JSON parse error from Groq EN response:", content);
      return NextResponse.json(
        { error: "Failed to parse model response from Groq (EN)" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        analysis: parsed.analysis,
        coverLetter: parsed.coverLetter,
        matchScore: parsed.matchScore ?? 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API error (EN):", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}