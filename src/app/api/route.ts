// src/app/api/generate-application/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { cvText, jobAdText } = await req.json();

    if (!cvText || !jobAdText) {
      return NextResponse.json(
        { error: "Missing cvText or jobAdText" },
        { status: 400 }
      );
    }

    // MOCK-LOGIIKKA: ei vielä tekoälyä
    const analysis = `
Tämä on mock-analyysi.

CV:n pituus: ${cvText.length} merkkiä.
Työpaikkailmoituksen pituus: ${jobAdText.length} merkkiä.

Seuraavassa vaiheessa tämä korvataan Groq-pohjaisella oikealla analyysillä.
    `.trim();

    const coverLetter = `
Hei,

kiitos mahdollisuudesta hakea tähän tehtävään. Tässä demossa hakemuskirje on
vielä mock-dataa, mutta myöhemmin se generoidaan Groq-LLM:n avulla CV:n ja
työpaikkailmoituksen perusteella.

Terveisin,
JobCopilot-demo
    `.trim();

    return NextResponse.json({ analysis, coverLetter });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}