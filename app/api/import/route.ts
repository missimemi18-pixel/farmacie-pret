import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://tqegjocleztjbujdlpmy.supabase.co",
  "sb_publishable_kBe13_xfQbe8zsQ0EfVqKw_diJivwdh"
);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ eroare: "Niciun fișier" }, { status: 400 });

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

    let adaugate = 0;
    for (const row of rows) {
      const numeProdus = row["Nume Produs"] || row["nume"];
      const categorie = row["Categorie"] || row["categorie"] || "";
      const numeF = row["Farmacie"] || row["farmacie"];
      const pret = parseFloat(row["Pret"] || row["pret"] || 0);

      if (!numeProdus || !numeF || !pret) continue;

      let { data: produs } = await supabase.from("produse").select("id").eq("nume", numeProdus).single();
      if (!produs) {
        const { data: nouProdus } = await supabase.from("produse").insert({ nume: numeProdus, categorie }).select().single();
        produs = nouProdus;
      }

      let { data: farmacie } = await supabase.from("farmacii").select("id").eq("nume", numeF).single();
      if (!farmacie) continue;

      await supabase.from("preturi").upsert({ farmacie_id: farmacie.id, produs_id: produs?.id, pret });
      adaugate++;
    }

    return NextResponse.json({ succes: true, adaugate, total: rows.length });
  } catch (err: any) {
    return NextResponse.json({ eroare: err.message }, { status: 500 });
  }
}
