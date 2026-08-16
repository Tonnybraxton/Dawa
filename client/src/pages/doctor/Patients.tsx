import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Users } from 'lucide-react';

export default function DoctorPatients() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.getPrescriptions().then(setPrescriptions).catch(console.error).finally(() => setLoading(false)); }, []);

  const patientMap = new Map<number, any>();
  prescriptions.forEach(rx => {
    if (!patientMap.has(rx.patient_id)) patientMap.set(rx.patient_id, { id: rx.patient_id, name: rx.patient_name, prescriptions: [] });
    patientMap.get(rx.patient_id).prescriptions.push(rx);
  });
  const patients = Array.from(patientMap.values());

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="slide-up">
      <h1 className="page-title">My Patients</h1>
      <p className="page-subtitle">Patients you've prescribed to</p>
      {patients.length === 0 ? <div className="card empty-state"><Users size={48}/><h4>No patients yet</h4></div> : (
        <div style={{ display:'grid', gap:12 }}>
          {patients.map(p => (
            <div key={p.id} className="card" style={{ display:'flex', alignItems:'center', gap:16, padding:16 }}>
              <div className="avatar avatar-lg" style={{ background:'var(--gradient-primary)' }}>{p.name?.split(' ').map((n:string)=>n[0]).join('')}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600 }}>{p.name}</div>
                <div style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>{p.prescriptions.length} prescription(s) · {p.prescriptions.filter((r:any)=>r.status==='active').length} active</div>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                {p.prescriptions.slice(0,3).map((rx:any) => <span key={rx.id} className={`badge badge-${rx.status}`} style={{fontSize:'0.7rem'}}>{rx.prescription_code}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
