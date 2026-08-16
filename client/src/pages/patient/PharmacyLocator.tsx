import { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api';
import { MapPin, Clock, Phone } from 'lucide-react';

export default function PharmacyLocator() {
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    api.getNearbyPharmacies().then(setPharmacies).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && pharmacies.length > 0 && mapRef.current && !mapInstance.current) {
      import('leaflet').then(L => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        setTimeout(() => {
          const map = L.map(mapRef.current!).setView([-1.2921, 36.8219], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);

          pharmacies.forEach(p => {
            if (p.lat && p.lng) {
              const icon = L.divIcon({
                html: `<div style="width:32px;height:32px;background:${p.isOpen?'var(--success)':'var(--danger)'};border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:14px;">💊</div>`,
                className: '', iconSize: [32, 32], iconAnchor: [16, 16]
              });
              L.marker([p.lat, p.lng], { icon }).addTo(map).on('click', () => setSelected(p))
                .bindPopup(`<strong>${p.name}</strong><br/>${p.address||''}<br/><span style="color:${p.isOpen?'green':'red'}">${p.isOpen?'Open':'Closed'}</span>`);
            }
          });
          mapInstance.current = map;
        }, 200);
      });
    }
  }, [loading, pharmacies]);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="slide-up">
      <h1 className="page-title">Pharmacy Locator</h1>
      <p className="page-subtitle">Find nearby pharmacies in Nairobi</p>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, height:'calc(100vh - 200px)' }}>
        <div ref={mapRef} style={{ borderRadius:'var(--radius-lg)', overflow:'hidden', border:'1px solid var(--border-light)', minHeight:400 }} />
        <div style={{ overflowY:'auto', display:'flex', flexDirection:'column', gap:12 }}>
          {pharmacies.map(p => (
            <div key={p.id} className={`card ${selected?.id===p.id ? 'rx-card' : ''}`} style={{ padding:16, cursor:'pointer', borderColor: selected?.id===p.id ? 'var(--primary)' : undefined }} onClick={() => setSelected(p)}>
              <div className="flex-between" style={{marginBottom:8}}>
                <h4 style={{ fontSize:'0.95rem' }}>{p.name}</h4>
                <span className={`badge ${p.isOpen ? 'badge-active' : 'badge-expired'}`}>{p.isOpen ? 'Open' : 'Closed'}</span>
              </div>
              <div style={{ fontSize:'0.82rem', color:'var(--text-muted)', display:'flex', flexDirection:'column', gap:4 }}>
                <span style={{display:'flex', alignItems:'center', gap:6}}><MapPin size={14}/>{p.address || 'Nairobi'}</span>
                <span style={{display:'flex', alignItems:'center', gap:6}}><Clock size={14}/>{p.hours || 'N/A'}</span>
                {p.phone && <span style={{display:'flex', alignItems:'center', gap:6}}><Phone size={14}/>{p.phone}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
