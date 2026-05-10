import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const produs = searchParams.get("produs") || "nurofen";

  try {
    const res = await fetch(
      `https://www.farmaciabajan.ro/search?search=${encodeURIComponent(produs)}`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    const html = await res.text();

    return NextResponse.json({ 
      lungime: html.length,
      url_final: res.url,
      preview: html.substring(0, 2000)
    });
  } catch (err: any) {
    return NextResponse.json({ eroare: err.message }, { status: 500 });
  }
}
