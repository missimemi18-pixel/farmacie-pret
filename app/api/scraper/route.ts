import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categorie = searchParams.get("categorie") || "analgezice-antipiretice-si-antiinflamatoare";

  try {
    const res = await fetch(
      `https://www.farmaciabajan.ro/medicamente-fara-reteta-otc/${categorie}`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    const html = await res.text();

    const produse: {nume: string, pret: number, url: string}[] = [];

    const linkRegex = /<a href="([^"]+\.html)"[^>]*title="([^"]+)"/g;
    const pretRegex = /<div class="price[^"]*">([^<]+)<\/div>/g;

    const linkuri: {url: string, nume: string}[] = [];
    const preturi: number[] = [];

    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      if (match[1].includes("/medicamente-fara-reteta-otc/")) {
        linkuri.push({ url: match[1], nume: match[2].trim() });
      }
    }

    while ((match = pretRegex.exec(html)) !== null) {
      const pretCurat = match[1].replace(/[^\d.,]/g, "").replace(",", ".");
      const pret = parseFloat(pretCurat);
      if (pret > 0) preturi.push(pret);
    }

    for (let i = 0; i < Math.min(linkuri.length, preturi.length); i++) {
      produse.push({
        nume: linkuri[i].nume,
        pret: preturi[i],
        url: linkuri[i].url
      });
    }

    return NextResponse.json({ 
      produse, 
      total: produse.length,
      sursa: "farmaciabajan.ro"
    });
  } catch (err: any) {
    return NextResponse.json({ eroare: err.message }, { status: 500 });
  }
}
