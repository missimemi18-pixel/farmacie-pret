import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://tqegjocleztjbujdlpmy.supabase.co",
  "sb_publishable_kBe13_xfQbe8zsQ0EfVqKw_diJivwdh"
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const produs = searchParams.get("produs") || "nurofen";

  try {
    const res = await fetch(
      `https://www.catena.ro/cauta?q=${encodeURIComponent(produs)}`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    const html = await res.text();
    const $ = cheerio.load(html);
    const produse: any[] = [];

    $(".product-item").each((i, el) => {
      const nume = $(el).find(".product-name").text().trim();
      const pret = $(el).find(".price").text().trim().replace("Lei", "").trim();
      if (nume && pret) {
        produse.push({ nume, pret: parseFloat(pret.replace(",", ".")) });
      }
    });

    return NextResponse.json({ produse, total: produse.length });
  } catch (err) {
    return NextResponse.json({ eroare: "Nu s-a putut accesa catena.ro" }, { status: 500 });
  }
}
