import { NextRequest, NextResponse } from "next/server";
import { groqClient } from "@/app/lib/groqClient";

type ModelResponse = {
  analysis: string;
  coverLetter: string;
  matchScore: number;
};

const SYSTEM_PROMPT_EN = `
You are a career coach and job application expert specialising in junior software engineers.

Your tasks:
- Analyse how well the candidate's resume/profile matches the job description.
- Highlight strengths and gaps in a constructive and practical way.
- Write a clear, professional cover letter the candidate can use as a starting point.

Return ONLY valid JSON in the following shape:

{
  "analysis": "short paragraph(s) analysing the fit and giving advice",
  "coverLetter": "full cover letter in English with line breaks",
  "matchScore": integer between 0 and 100 where 0 = very weak match and 100 = excellent match
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
      temperature: 0.4,
      max_tokens: 1024,
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