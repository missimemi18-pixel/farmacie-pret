"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";

const Harta = dynamic(() => import("./components/Harta"), { ssr: false });

type Farmacie = { nume: string; adresa: string; pret: number; distanta?: string; };
type Produs = { nume: string; farmacii: Farmacie[]; };
type FarmacieHarta = { nume: string; adresa: string; pret: number; latitudine: number; longitudine: number; };
type SugestieAdresa = { display: string; lat: string; lon: string; };

function calculeazaDistanta(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export default function Home() {
  const [cautare, setCautare] = useState("");
  const [rezultate, setRezultate] = useState<Produs[]>([]);
  const [cautat, setCautat] = useState(false);
  const [incarcare, setIncarcare] = useState(false);
  const [locatie, setLocatie] = useState<{lat: number, lon: number} | null>(null);
  const [orasManual, setOrasManual] = useState("");
  const [locatieText, setLocatieText] = useState("");
  const [incarcareLocatie, setIncarcareLocatie] = useState(false);
  const [sugestii, setSugestii] = useState<string[]>([]);
  const [sugestiiAdresa, setSugestiiAdresa] = useState<SugestieAdresa[]>([]);
  const [farmaciiHarta, setFarmaciiHarta] = useState<FarmacieHarta[]>([]);
  const [modalRaportare, setModalRaportare] = useState<{farmacie: string, produs: string} | null>(null);
  const [pretRaportat, setPretRaportat] = useState("");
  const [observatii, setObservatii] = useState("");
  const [trimitereOk, setTrimitereOk] = useState(false);

  async function detecteazaLocatie() {
    if (!navigator.geolocation) return alert("Browserul nu suportă localizare.");
    setIncarcareLocatie(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLocatie({ lat: pos.coords.latitude, lon: pos.coords.longitude }); setLocatieText("Locație detectată automat"); setIncarcareLocatie(false); },
      () => { alert("Nu s-a putut detecta locația."); setIncarcareLocatie(false); }
    );
  }

  async function cautaSugestiiAdresa(text: string) {
    setOrasManual(text);
    if (text.length < 2) { setSugestiiAdresa([]); return; }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&limit=5&countrycodes=ro&accept-language=ro`);
      const data = await res.json();
      setSugestiiAdresa(data.map((d: any) => ({ display: d.display_name, lat: d.lat, lon: d.lon })));
    } catch {}
  }

  function selecteazaAdresa(adresa: SugestieAdresa) {
    setLocatie({ lat: parseFloat(adresa.lat), lon: parseFloat(adresa.lon) });
    setLocatieText(adresa.display.split(",")[0]);
    setOrasManual(adresa.display.split(",")[0]);
    setSugestiiAdresa([]);
  }

  async function cautaSugestii(text: string) {
    setCautare(text);
    if (text.length < 1) { setSugestii([]); return; }
    const { data } = await supabase.from("produse").select("nume").ilike("nume", `%${text}%`).limit(5);
    if (data) setSugestii(data.map((p: any) => p.nume));
  }

  async function cauta(numeProdus?: string) {
    const termen = numeProdus || cautare;
    if (!termen.trim()) return;
    if (numeProdus) setCautare(numeProdus);
    setSugestii([]);
    setIncarcare(true);
    setCautat(false);

    const { data: produseGasite } = await supabase.from("produse").select("id, nume").ilike("nume", `%${termen}%`);
    if (!produseGasite || produseGasite.length === 0) { setRezultate([]); setCautat(true); setIncarcare(false); return; }
    const ids = produseGasite.map((p: any) => p.id);

    const { data, error } = await supabase.from("preturi")
      .select(`pret, produse (nume), farmacii (nume, adresa, latitudine, longitudine)`)
      .in("produs_id", ids);

    if (error) { setIncarcare(false); return; }

    const grupate: { [key: string]: Produs } = {};
    data?.forEach((row: any) => {
      if (!row.produse || !row.farmacii) return;
      const numeProd = row.produse.nume;
      if (!grupate[numeProd]) grupate[numeProd] = { nume: numeProd, farmacii: [] };
      let distanta: string | undefined;
      if (locatie && row.farmacii.latitudine && row.farmacii.longitudine) {
        const km = calculeazaDistanta(locatie.lat, locatie.lon, row.farmacii.latitudine, row.farmacii.longitudine);
        distanta = km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
      }
      grupate[numeProd].farmacii.push({ nume: row.farmacii.nume, adresa: row.farmacii.adresa, pret: row.pret, distanta });
    });

    setRezultate(Object.values(grupate));

    const pentruHarta = data?.filter((r: any) => r.farmacii?.latitudine).map((r: any) => ({
      nume: r.farmacii.nume, adresa: r.farmacii.adresa, pret: r.pret,
      latitudine: r.farmacii.latitudine, longitudine: r.farmacii.longitudine,
    })) || [];
    setFarmaciiHarta(pentruHarta);
    setCautat(true);
    setIncarcare(false);
  }

  async function trimiteRaportare() {
    if (!pretRaportat || !modalRaportare) return;
    await supabase.from("raportari").insert({
      farmacie_nume: modalRaportare.farmacie,
      produs_nume: modalRaportare.produs,
      pret_raportat: parseFloat(pretRaportat),
      observatii,
    });
    setTrimitereOk(true);
    setTimeout(() => { setModalRaportare(null); setPretRaportat(""); setObservatii(""); setTrimitereOk(false); }, 2000);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-16">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-blue-700 mb-3">💊 FarmaciePret.ro</h1>
          <p className="text-gray-500 text-lg">Găsește cel mai mic preț din farmaciile de lângă tine</p>
        </div>

        {/* Locatie */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-5">
          <p className="text-xs text-gray-400 mb-3">Setează locația pentru a vedea distanța până la fiecare farmacie</p>
          <button onClick={detecteazaLocatie} disabled={incarcareLocatie}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl text-sm font-semibold transition mb-3">
            {incarcareLocatie ? "Se detectează..." : "📍 Localizează-mă automat"}
          </button>
          <div className="relative">
            <div className="flex gap-2">
              <input type="text" placeholder="Sau scrie orașul / strada (ex: Str. Unirii, București)"
                value={orasManual} onChange={e => cautaSugestiiAdresa(e.target.value)}
                className="flex-1 border rounded-xl px-4 py-2 text-sm outline-none" />
              <button onClick={() => sugestiiAdresa.length > 0 && selecteazaAdresa(sugestiiAdresa[0])}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm font-semibold">
                Setează
              </button>
            </div>
            {sugestiiAdresa.length > 0 && (
              <div className="absolute w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 z-20">
                {sugestiiAdresa.map((s, i) => (
                  <div key={i} onClick={() => selecteazaAdresa(s)}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 border-b last:border-0">
                    📍 {s.display.split(",").slice(0, 3).join(",")}
                  </div>
                ))}
              </div>
            )}
          </div>
          {locatieText && <p className="text-green-600 text-sm mt-2 font-semibold">✅ {locatieText}</p>}
        </div>

        {/* Cautare produs */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-8">
          <p className="text-xs text-gray-400 mb-3">Scrie numele medicamentului sau produsului</p>
          <div className="relative">
            <div className="flex gap-2 rounded-xl overflow-hidden border border-gray-200">
              <input type="text" value={cautare}
                onChange={(e) => cautaSugestii(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") cauta(); }}
                placeholder="ex: Nurofen, Paracetamol, Vitamina C..."
                className="flex-1 px-5 py-3 text-base outline-none" />
              <button onClick={() => cauta()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-base font-semibold transition">
                {incarcare ? "Se caută..." : "Caută"}
              </button>
            </div>
            {sugestii.length > 0 && (
              <div className="absolute w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 z-10">
                {sugestii.map((s, i) => (
                  <div key={i} onClick={() => cauta(s)}
                    className="px-5 py-3 hover:bg-blue-50 cursor-pointer text-gray-700 border-b last:border-0">
                    💊 {s}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Rezultate */}
        {cautat && (
          <div>
            {rezultate.length === 0 ? (
              <p className="text-center text-gray-400">Niciun produs găsit. Încearcă alt termen.</p>
            ) : (
              rezultate.map((produs, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-md p-6 mb-4">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">{produs.nume}</h2>
                  <div className="space-y-3">
                    {produs.farmacii.sort((a, b) => a.pret - b.pret).map((f, j) => (
                      <div key={j} className={`p-4 rounded-xl border ${j === 0 ? "border-green-400 bg-green-50" : "border-gray-100 bg-gray-50"}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            {j === 0 && <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full mr-2">CEL MAI IEFTIN</span>}
                            <span className="font-semibold text-gray-800">{f.nume}</span>
                            <p className="text-sm text-gray-400 mt-1">📍 {f.adresa} {f.distanta ? `• ${f.distanta} distanță` : ""}</p>
                          </div>
                          <span className="text-2xl font-bold text-blue-700">{f.pret.toFixed(2)} RON</span>
                        </div>
                        <button
                          onClick={() => { setModalRaportare({ farmacie: f.nume, produs: produs.nume }); setPretRaportat(""); setObservatii(""); }}
                          className="mt-2 text-xs text-gray-400 hover:text-blue-500 transition">
                          ✏️ Raportează un preț diferit
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}

            {farmaciiHarta.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-6 mt-4">
                <p className="text-sm font-bold text-blue-600 mb-3">🗺️ Farmacii pe hartă</p>
                <Harta farmacii={farmaciiHarta} locatie={locatie} />
              </div>
            )}
          </div>
        )}

        {/* Modal Raportare */}
        {modalRaportare && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
              {trimitereOk ? (
                <div className="text-center py-4">
                  <p className="text-4xl mb-3">✅</p>
                  <p className="text-green-600 font-bold text-lg">Mulțumim pentru raportare!</p>
                  <p className="text-gray-400 text-sm mt-1">Vom verifica și actualiza prețul în curând.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">✏️ Raportează preț</h3>
                  <p className="text-sm text-gray-400 mb-4">Ajută comunitatea cu un preț actualizat!</p>
                  <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm">
                    <p><span className="text-gray-400">Farmacie:</span> <span className="font-semibold">{modalRaportare.farmacie}</span></p>
                    <p><span className="text-gray-400">Produs:</span> <span className="font-semibold">{modalRaportare.produs}</span></p>
                  </div>
                  <input type="number" placeholder="Prețul pe care l-ai văzut (RON)"
                    value={pretRaportat} onChange={e => setPretRaportat(e.target.value)}
                    className="w-full border rounded-xl px-4 py-3 mb-3 outline-none text-sm" />
                  <input type="text" placeholder="Observații (opțional)"
                    value={observatii} onChange={e => setObservatii(e.target.value)}
                    className="w-full border rounded-xl px-4 py-3 mb-4 outline-none text-sm" />
                  <div className="flex gap-2">
                    <button onClick={() => setModalRaportare(null)}
                      className="flex-1 border border-gray-200 text-gray-500 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50">
                      Anulează
                    </button>
                    <button onClick={trimiteRaportare}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-sm font-semibold">
                      Trimite raportarea
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}