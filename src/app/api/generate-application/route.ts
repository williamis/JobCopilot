import { NextRequest, NextResponse } from "next/server";
import { groqClient } from "@/app/lib/groqClient";

type ModelResponse = {
  analysis: string;
  coverLetter: string;
  matchScore: number;
};

const SYSTEM_PROMPT = `
Olet huipputason HR-konsultti ja rekrytoinnin ammattilainen. Tehtäväsi on analysoida hakijan ja työpaikan yhteensopivuus kirurgisella tarkkuudella.

PALAUTA JSON:
{
  "analysis": "Anna 3-4 lausetta hienostunutta ammattilaisanalyysia. Keskity strategiseen yhteensopivuuteen hakijan uniikin osaamisen ja yrityksen liiketoimintatarpeiden välillä. Älä käytä ranskalaisia viivoja.",
  "coverLetter": "Kirjoita moderni, iskevä ja hienostunut hakemuskirje. Vältä kliseitä kuten 'olen ahkera oppimaan'. Keskity arvon tuottamiseen ja tuloksiin. Tyyli: Itsevarma, minimalistinen ja eliitti.",
  "matchScore": kokonaisluku 0-100
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
CV / profiilikuvaus:
---
${cvText}
---

Työpaikkailmoitus:
---
${jobAdText}
---

1) Arvioi sopivuus selkeästi ja suoraan.
2) Kerro, mitä kannattaa painottaa hakemuksessa.
3) Tee valmis hakemuskirje suomeksi.
    `.trim();

    const completion = await groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
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
      console.error("JSON parse error from Groq response:", content);
      return NextResponse.json(
        { error: "Failed to parse model response from Groq" },
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
    console.error("API error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}