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

    const produse: {nume: string, pret: number}[] = [];
    
    const regex = /class="product-name[^"]*"[^>]*>\s*<[^>]*>\s*([^<]+)/g;
    const pretRegex = /class="price[^"]*"[^>]*>([^<]+)/g;
    
    const nume: string[] = [];
    const preturi: string[] = [];
    
    let match;
    while ((match = regex.exec(html)) !== null) {
      nume.push(match[1].trim());
    }
    while ((match = pretRegex.exec(html)) !== null) {
      preturi.push(match[1].trim());
    }

    for (let i = 0; i < Math.min(nume.length, preturi.length); i++) {
      const pretCurat = preturi[i].replace(/[^\d.,]/g, "").replace(",", ".");
      produse.push({
        nume: nume[i],
        pret: parseFloat(pretCurat) || 0
      });
    }

    return NextResponse.json({ produse, total: produse.length, sursa: "farmaciabajan.ro" });
  } catch (err: any) {
    return NextResponse.json({ eroare: err.message }, { status: 500 });
  }
}
