"use client";
import { useState } from "react";

const produse = [
  {
    nume: "Nurofen 400mg x 12 comprimate",
    farmacii: [
      { nume: "Catena", pret: 18.5, adresa: "Str. Mihai Viteazu 12", distanta: "0.3 km" },
      { nume: "Helpnet", pret: 21.0, adresa: "Bd. Tudor Vladimirescu 5", distanta: "0.8 km" },
      { nume: "Sensiblu", pret: 19.9, adresa: "Calea București 33", distanta: "1.2 km" },
    ],
  },
  {
    nume: "Paracetamol 500mg x 20 comprimate",
    farmacii: [
      { nume: "Sensiblu", pret: 7.5, adresa: "Calea București 33", distanta: "1.2 km" },
      { nume: "Catena", pret: 8.2, adresa: "Str. Mihai Viteazu 12", distanta: "0.3 km" },
      { nume: "Helpnet", pret: 9.0, adresa: "Bd. Tudor Vladimirescu 5", distanta: "0.8 km" },
    ],
  },
  {
    nume: "Vitamina C 1000mg x 30 comprimate",
    farmacii: [
      { nume: "Helpnet", pret: 32.0, adresa: "Bd. Tudor Vladimirescu 5", distanta: "0.8 km" },
      { nume: "Catena", pret: 35.5, adresa: "Str. Mihai Viteazu 12", distanta: "0.3 km" },
      { nume: "Sensiblu", pret: 33.9, adresa: "Calea București 33", distanta: "1.2 km" },
    ],
  },
];

export default function Home() {
  const [cautare, setCautare] = useState("");
  const [rezultate, setRezultate] = useState<typeof produse>([]);
  const [cautat, setCautat] = useState(false);

  function cauta() {
    if (!cautare.trim()) return;
    const filtrate = produse.filter((p) =>
      p.nume.toLowerCase().includes(cautare.toLowerCase())
    );
    setRezultate(filtrate);
    setCautat(true);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-16">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-700 mb-3">
            💊 FarmaciePret.ro
          </h1>
          <p className="text-gray-500 text-lg">
            Găsește cel mai mic preț din farmaciile de lângă tine
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2 shadow-lg rounded-xl overflow-hidden">
          <input
            type="text"
            value={cautare}
            onChange={(e) => setCautare(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && cauta()}
            placeholder="Caută un medicament... (ex: Nurofen, Paracetamol)"
            className="flex-1 px-6 py-4 text-lg outline-none border border-gray-200"
          />
          <button
            onClick={cauta}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold transition"
          >
            Caută
          </button>
        </div>

        <p className="text-center text-gray-400 mt-4 text-sm">
          Compară prețuri • Găsește cea mai apropiată farmacie • Economisești timp și bani
        </p>

        {/* Rezultate */}
        {cautat && (
          <div className="mt-10">
            {rezultate.length === 0 ? (
              <p className="text-center text-gray-400 mt-6">
                Niciun produs găsit. Încearcă alt termen.
              </p>
            ) : (
              rezultate.map((produs, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-md p-6 mb-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    {produs.nume}
                  </h2>
                  <div className="space-y-3">
                    {produs.farmacii
                      .sort((a, b) => a.pret - b.pret)
                      .map((f, j) => (
                        <div
                          key={j}
                          className={`flex items-center justify-between p-4 rounded-xl border ${
                            j === 0
                              ? "border-green-400 bg-green-50"
                              : "border-gray-100 bg-gray-50"
                          }`}
                        >
                          <div>
                            {j === 0 && (
                              <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full mr-2">
                                CEL MAI IEFTIN
                              </span>
                            )}
                            <span className="font-semibold text-gray-800">
                              {f.nume}
                            </span>
                            <p className="text-sm text-gray-400 mt-1">
                              📍 {f.adresa} • {f.distanta}
                            </p>
                          </div>
                          <span className="text-2xl font-bold text-blue-700">
                            {f.pret.toFixed(2)} RON
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </main>
  );
}
