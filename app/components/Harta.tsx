"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

type Farmacie = {
  nume: string;
  adresa: string;
  pret: number;
  latitudine: number;
  longitudine: number;
};

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function Harta({ farmacii, locatie }: { farmacii: Farmacie[], locatie: {lat: number, lon: number} | null }) {
  const centru: [number, number] = locatie ? [locatie.lat, locatie.lon] : [45.1031, 24.3693];

  return (
    <MapContainer center={centru} zoom={14} style={{ height: "350px", width: "100%", borderRadius: "1rem" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {farmacii.map((f, i) => (
        <Marker key={i} position={[f.latitudine, f.longitudine]}>
          <Popup>
            <strong>{f.nume}</strong><br />
            {f.adresa}<br />
            <span style={{color: "#2563eb", fontWeight: "bold"}}>{f.pret.toFixed(2)} RON</span>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}