"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const PAROLA_ADMIN = "admin1234";

type Farmacie = { id: number; nume: string; adresa: string; oras: string; telefon: string };
type Produs = { id: number; nume: string; categorie: string };
type Pret = { id: number; farmacie_id: number; produs_id: number; pret: number };
type Raportare = { id: number; farmacie_nume: string; produs_nume: string; pret_raportat: number; observatii: string; creat_la: string; verificat: boolean };

export default function Admin() {
  const [logat, setLogat] = useState(false);
  const [parola, setParola] = useState("");
  const [tab, setTab] = useState("raportari");
  const [farmacii, setFarmacii] = useState<Farmacie[]>([]);
  const [produse, setProduse] = useState<Produs[]>([]);
  const [preturi, setPreturi] = useState<Pret[]>([]);
  const [raportari, setRaportari] = useState<Raportare[]>([]);
  const [numeF, setNumeF] = useState(""); const [adresaF, setAdresaF] = useState(""); const [orasF, setOrasF] = useState(""); const [telefonF, setTelefonF] = useState("");
  const [numeP, setNumeP] = useState(""); const [categorieP, setCategorieP] = useState("");
  const [farmacieId, setFarmacieId] = useState(""); const [produsId, setProdusId] = useState(""); const [pretVal, setPretVal] = useState("");
  const [mesaj, setMesaj] = useState("");

  useEffect(() => { if (logat) { loadFarmacii(); loadProduse(); loadPreturi(); loadRaportari(); } }, [logat]);

  async function loadFarmacii() { const { data } = await supabase.from("farmacii").select("*").order("id"); if (data) setFarmacii(data); }
  async function loadProduse() { const { data } = await supabase.from("produse").select("*").order("id"); if (data) setProduse(data); }
  async function loadPreturi() { const { data } = await supabase.from("preturi").select("*").order("id"); if (data) setPreturi(data); }
  async function loadRaportari() { const { data } = await supabase.from("raportari").select("*").order("creat_la", { ascending: false }); if (data) setRaportari(data); }

  function arataMesaj(m: string) { setMesaj(m); setTimeout(() => setMesaj(""), 3000); }

  async function adaugaFarmacie() {
    if (!numeF || !adresaF || !orasF) return arataMesaj("Completează toate câmpurile!");
    await supabase.from("farmacii").insert({ nume: numeF, adresa: adresaF, oras: orasF, telefon: telefonF });
    setNumeF(""); setAdresaF(""); setOrasF(""); setTelefonF("");
    loadFarmacii(); arataMesaj("✅ Farmacie adăugată!");
  }
  async function stergeFarmacie(id: number) { await supabase.from("farmacii").delete().eq("id", id); loadFarmacii(); arataMesaj("🗑️ Farmacie ștearsă!"); }
  async function adaugaProdus() {
    if (!numeP) return arataMesaj("Completează numele produsului!");
    await supabase.from("produse").insert({ nume: numeP, categorie: categorieP });
    setNumeP(""); setCategorieP(""); loadProduse(); arataMesaj("✅ Produs adăugat!");
  }
  async function stergeProdus(id: number) { await supabase.from("produse").delete().eq("id", id); loadProduse(); arataMesaj("🗑️ Produs șters!"); }
  async function adaugaPret() {
    if (!farmacieId || !produsId || !pretVal) return arataMesaj("Completează toate câmpurile!");
    await supabase.from("preturi").insert({ farmacie_id: parseInt(farmacieId), produs_id: parseInt(produsId), pret: parseFloat(pretVal) });
    setFarmacieId(""); setProdusId(""); setPretVal(""); loadPreturi(); arataMesaj("✅ Preț adăugat!");
  }
  async function stergePret(id: number) { await supabase.from("preturi").delete().eq("id", id); loadPreturi(); arataMesaj("🗑️ Preț șters!"); }
  async function marcheazaVerificat(id: number) { await supabase.from("raportari").update({ verificat: true }).eq("id", id); loadRaportari(); arataMesaj("✅ Marcat ca verificat!"); }
  async function stergeRaportare(id: number) { await supabase.from("raportari").delete().eq("id", id); loadRaportari(); arataMesaj("🗑️ Raportare ștearsă!"); }

  if (!logat) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-blue-700 mb-6 text-center">🔐 Admin FarmaciePret</h1>
        <input type="password" placeholder="Parolă" value={parola} onChange={e => setParola(e.target.value)}
          className="w-full border rounded-xl px-4 py-3 mb-4 outline-none" />
        <button onClick={() => parola === PAROLA_ADMIN ? setLogat(true) : arataMesaj("Parolă greșită!")}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700">
          Intră în Admin
        </button>
        {mesaj && <p className="text-center mt-4 text-red-500">{mesaj}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-700">⚙️ Panou Administrare</h1>
          <button onClick={() => setLogat(false)} className="text-gray-400 hover:text-red-500 text-sm">Ieși</button>
        </div>

        {mesaj && <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl mb-6 text-center">{mesaj}</div>}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["raportari", "farmacii", "produse", "preturi"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-xl font-semibold transition ${tab === t ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
              {t === "raportari" ? `📬 Raportări ${raportari.filter(r => !r.verificat).length > 0 ? `(${raportari.filter(r => !r.verificat).length})` : ""}` : t === "farmacii" ? "🏥 Farmacii" : t === "produse" ? "💊 Produse" : "💰 Prețuri"}
            </button>
          ))}
        </div>

        {/* Raportari */}
        {tab === "raportari" && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-bold mb-4">Raportări de la utilizatori ({raportari.length})</h2>
            {raportari.length === 0 ? <p className="text-gray-400 text-center py-4">Nicio raportare încă.</p> : (
              <div className="space-y-3">
                {raportari.map(r => (
                  <div key={r.id} className={`p-4 rounded-xl border ${r.verificat ? "bg-gray-50 border-gray-100 opacity-60" : "bg-yellow-50 border-yellow-200"}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {!r.verificat && <span className="text-xs bg-yellow-400 text-white px-2 py-0.5 rounded-full font-bold">NOU</span>}
                          {r.verificat && <span className="text-xs bg-green-400 text-white px-2 py-0.5 rounded-full font-bold">✓ Verificat</span>}
                          <span className="font-semibold text-gray-800">{r.farmacie_nume}</span>
                        </div>
                        <p className="text-sm text-gray-600">💊 {r.produs_nume}</p>
                        <p className="text-lg font-bold text-blue-700 mt-1">{r.pret_raportat} RON</p>
                        {r.observatii && <p className="text-sm text-gray-400 mt-1">"{r.observatii}"</p>}
                        <p className="text-xs text-gray-300 mt-1">{new Date(r.creat_la).toLocaleDateString("ro-RO")}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {!r.verificat && (
                          <button onClick={() => marcheazaVerificat(r.id)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-semibold">
                            ✓ Verifică
                          </button>
                        )}
                        <button onClick={() => stergeRaportare(r.id)}
                          className="bg-red-100 hover:bg-red-200 text-red-500 px-3 py-1 rounded-lg text-xs font-semibold">
                          🗑️ Șterge
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Farmacii */}
        {tab === "farmacii" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-bold mb-4">Adaugă Farmacie Nouă</h2>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Nume farmacie *" value={numeF} onChange={e => setNumeF(e.target.value)} className="border rounded-xl px-4 py-2 outline-none" />
                <input placeholder="Oraș *" value={orasF} onChange={e => setOrasF(e.target.value)} className="border rounded-xl px-4 py-2 outline-none" />
                <input placeholder="Adresă *" value={adresaF} onChange={e => setAdresaF(e.target.value)} className="border rounded-xl px-4 py-2 outline-none col-span-2" />
                <input placeholder="Telefon" value={telefonF} onChange={e => setTelefonF(e.target.value)} className="border rounded-xl px-4 py-2 outline-none" />
                <button onClick={adaugaFarmacie} className="bg-blue-600 text-white rounded-xl py-2 font-semibold hover:bg-blue-700">Adaugă</button>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-bold mb-4">Farmacii existente ({farmacii.length})</h2>
              <div className="space-y-2">
                {farmacii.map(f => (
                  <div key={f.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <div><span className="font-semibold">{f.nume}</span><span className="text-gray-400 text-sm ml-2">{f.adresa}, {f.oras}</span></div>
                    <button onClick={() => stergeFarmacie(f.id)} className="text-red-400 hover:text-red-600 text-sm">🗑️</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Produse */}
        {tab === "produse" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-bold mb-4">Adaugă Produs Nou</h2>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Nume produs *" value={numeP} onChange={e => setNumeP(e.target.value)} className="border rounded-xl px-4 py-2 outline-none col-span-2" />
                <input placeholder="Categorie" value={categorieP} onChange={e => setCategorieP(e.target.value)} className="border rounded-xl px-4 py-2 outline-none" />
                <button onClick={adaugaProdus} className="bg-blue-600 text-white rounded-xl py-2 font-semibold hover:bg-blue-700">Adaugă</button>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-bold mb-4">Produse existente ({produse.length})</h2>
              <div className="space-y-2">
                {produse.map(p => (
                  <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <div><span className="font-semibold">{p.nume}</span><span className="text-gray-400 text-sm ml-2">{p.categorie}</span></div>
                    <button onClick={() => stergeProdus(p.id)} className="text-red-400 hover:text-red-600 text-sm">🗑️</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Preturi */}
        {tab === "preturi" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-bold mb-4">Adaugă Preț Nou</h2>
              <div className="grid grid-cols-2 gap-3">
                <select value={farmacieId} onChange={e => setFarmacieId(e.target.value)} className="border rounded-xl px-4 py-2 outline-none">
                  <option value="">Selectează farmacie *</option>
                  {farmacii.map(f => <option key={f.id} value={f.id}>{f.nume}</option>)}
                </select>
                <select value={produsId} onChange={e => setProdusId(e.target.value)} className="border rounded-xl px-4 py-2 outline-none">
                  <option value="">Selectează produs *</option>
                  {produse.map(p => <option key={p.id} value={p.id}>{p.nume}</option>)}
                </select>
                <input placeholder="Preț (ex: 18.50)" value={pretVal} onChange={e => setPretVal(e.target.value)} className="border rounded-xl px-4 py-2 outline-none" />
                <button onClick={adaugaPret} className="bg-blue-600 text-white rounded-xl py-2 font-semibold hover:bg-blue-700">Adaugă</button>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-bold mb-4">Prețuri existente ({preturi.length})</h2>
              <div className="space-y-2">
                {preturi.map(p => (
                  <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <div><span className="font-bold text-blue-700">{p.pret.toFixed(2)} RON</span><span className="text-gray-400 text-sm ml-2">Farmacie ID: {p.farmacie_id} • Produs ID: {p.produs_id}</span></div>
                    <button onClick={() => stergePret(p.id)} className="text-red-400 hover:text-red-600 text-sm">🗑️</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
