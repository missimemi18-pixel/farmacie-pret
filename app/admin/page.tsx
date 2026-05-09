"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const PAROLA_ADMIN = "admin1234";

type Farmacie = { id: number; nume: string; adresa: string; oras: string; telefon: string };
type Produs = { id: number; nume: string; categorie: string };
type Pret = { id: number; farmacie_id: number; produs_id: number; pret: number };

export default function Admin() {
  const [logat, setLogat] = useState(false);
  const [parola, setParola] = useState("");
  const [tab, setTab] = useState("farmacii");

  const [farmacii, setFarmacii] = useState<Farmacie[]>([]);
  const [produse, setProduse] = useState<Produs[]>([]);
  const [preturi, setPreturi] = useState<Pret[]>([]);

  const [numeF, setNumeF] = useState(""); const [adresaF, setAdresaF] = useState(""); const [orasF, setOrasF] = useState(""); const [telefonF, setTelefonF] = useState("");
  const [numeP, setNumeP] = useState(""); const [categorieP, setCategorieP] = useState("");
  const [farmacieId, setFarmacieId] = useState(""); const [produsId, setProdusId] = useState(""); const [pretVal, setPretVal] = useState("");

  const [mesaj, setMesaj] = useState("");

  useEffect(() => { if (logat) { loadFarmacii(); loadProduse(); loadPreturi(); } }, [logat]);

  async function loadFarmacii() {
    const { data } = await supabase.from("farmacii").select("*").order("id");
    if (data) setFarmacii(data);
  }
  async function loadProduse() {
    const { data } = await supabase.from("produse").select("*").order("id");
    if (data) setProduse(data);
  }
  async function loadPreturi() {
    const { data } = await supabase.from("preturi").select("*").order("id");
    if (data) setPreturi(data);
  }

  function arataMesaj(m: string) { setMesaj(m); setTimeout(() => setMesaj(""), 3000); }

  async function adaugaFarmacie() {
    if (!numeF || !adresaF || !orasF) return arataMesaj("Completează toate câmpurile!");
    await supabase.from("farmacii").insert({ nume: numeF, adresa: adresaF, oras: orasF, telefon: telefonF });
    setNumeF(""); setAdresaF(""); setOrasF(""); setTelefonF("");
    loadFarmacii(); arataMesaj("✅ Farmacie adăugată!");
  }
  async function stergeFarmacie(id: number) {
    await supabase.from("farmacii").delete().eq("id", id);
    loadFarmacii(); arataMesaj("🗑️ Farmacie ștearsă!");
  }
  async function adaugaProdus() {
    if (!numeP) return arataMesaj("Completează numele produsului!");
    await supabase.from("produse").insert({ nume: numeP, categorie: categorieP });
    setNumeP(""); setCategorieP("");
    loadProduse(); arataMesaj("✅ Produs adăugat!");
  }
  async function stergeProdus(id: number) {
    await supabase.from("produse").delete().eq("id", id);
    loadProduse(); arataMesaj("🗑️ Produs șters!");
  }
  async function adaugaPret() {
    if (!farmacieId || !produsId || !pretVal) return arataMesaj("Completează toate câmpurile!");
    await supabase.from("preturi").insert({ farmacie_id: parseInt(farmacieId), produs_id: parseInt(produsId), pret: parseFloat(pretVal) });
    setFarmacieId(""); setProdusId(""); setPretVal("");
    loadPreturi(); arataMesaj("✅ Preț adăugat!");
  }
  async function stergePret(id: number) {
    await supabase.from("preturi").delete().eq("id", id);
    loadPreturi(); arataMesaj("🗑️ Preț șters!");
  }

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
        <div className="flex gap-2 mb-6">
          {["farmacii", "produse", "preturi"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-6 py-2 rounded-xl font-semibold capitalize transition ${tab === t ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
              {t === "farmacii" ? "🏥 Farmacii" : t === "produse" ? "💊 Produse" : "💰 Prețuri"}
            </button>
          ))}
        </div>

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
                    <div>
                      <span className="font-semibold">{f.nume}</span>
                      <span className="text-gray-400 text-sm ml-2">{f.adresa}, {f.oras}</span>
                    </div>
                    <button onClick={() => stergeFarmacie(f.id)} className="text-red-400 hover:text-red-600 text-sm">🗑️ Șterge</button>
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
                <input placeholder="Categorie (ex: Analgezice)" value={categorieP} onChange={e => setCategorieP(e.target.value)} className="border rounded-xl px-4 py-2 outline-none" />
                <button onClick={adaugaProdus} className="bg-blue-600 text-white rounded-xl py-2 font-semibold hover:bg-blue-700">Adaugă</button>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-bold mb-4">Produse existente ({produse.length})</h2>
              <div className="space-y-2">
                {produse.map(p => (
                  <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <div>
                      <span className="font-semibold">{p.nume}</span>
                      <span className="text-gray-400 text-sm ml-2">{p.categorie}</span>
                    </div>
                    <button onClick={() => stergeProdus(p.id)} className="text-red-400 hover:text-red-600 text-sm">🗑️ Șterge</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Prețuri */}
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
                    <div>
                      <span className="font-semibold text-blue-700">{p.pret.toFixed(2)} RON</span>
                      <span className="text-gray-400 text-sm ml-2">Farmacie ID: {p.farmacie_id} • Produs ID: {p.produs_id}</span>
                    </div>
                    <button onClick={() => stergePret(p.id)} className="text-red-400 hover:text-red-600 text-sm">🗑️ Șterge</button>
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