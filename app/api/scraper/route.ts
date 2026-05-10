import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      `https://www.farmaciabajan.ro/medicamente-fara-reteta-otc/analgezice-antipiretice-si-antiinflamatoare`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    const html = await res.text();
    const start = html.indexOf("product-name");
    return NextResponse.json({ 
      lungime: html.length,
      fragment: html.substring(start - 200, start + 500)
    });
  } catch (err: any) {
    return NextResponse.json({ eroare: err.message }, { status: 500 });
  }
}
