import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const produs = searchParams.get("produs") || "nurofen";

  try {
    const res = await fetch(
      `https://www.farmaciabajan.ro/search?search=${encodeURIComponent(produs)}`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    const html = await res.text();
    const $ = cheerio.load(html);
    const produse: any[] = [];

    $(".product-name").each((i, el) => {
      const nume = $(el).text().trim();
      const container = $(el).closest(".product-item, .product, article, .item");
      const pret = container.find(".price").first().text().trim()
        .replace("Lei", "").replace("RON", "").trim();

      if (nume && pret) {
        produse.push({ 
          nume, 
          pret: parseFloat(pret.replace(",", ".")) || 0
        });
      }
    });

    return NextResponse.json({ 
      produse, 
      total: produse.length,
      sursa: "farmaciabajan.ro"
    });
  } catch (err: any) {
    return NextResponse.json({ eroare: err.message }, { status: 500 });
  }
}
