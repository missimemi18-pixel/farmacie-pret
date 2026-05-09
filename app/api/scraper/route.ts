import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      "https://www.catena.ro/cauta?q=nurofen",
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    const html = await res.text();
    return NextResponse.json({ 
      status: "ok", 
      lungime: html.length,
      preview: html.substring(0, 500)
    });
  } catch (err: any) {
    return NextResponse.json({ eroare: err.message }, { status: 500 });
  }
}
