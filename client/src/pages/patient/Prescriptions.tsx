import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import QRCode from 'react-qr-code';
import { FileText, X, Calendar, Pill } from 'lucide-react';

export default function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPrescriptions().then(setPrescriptions).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? prescriptions : prescriptions.filter(r => r.status === filter);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="slide-up">
      <h1 className="page-title">My Prescriptions</h1>
      <p className="page-subtitle">View and manage all your prescriptions</p>

      <div className="tabs">
        {['all','active','dispensed','expired'].map(f => (
          <button key={f} className={`tab ${filter===f?'active':''}`} onClick={() => setFilter(f)}>{f.charAt(0).toUpperCase()+f.slice(1)} {f!=='all' && `(${prescriptions.filter(r=>r.status===f).length})`}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card empty-state"><FileText size={48}/><h4>No prescriptions found</h4><p>Your prescriptions will appear here.</p></div>
      ) : (
        <div style={{ display:'grid', gap:16 }}>
          {filtered.map(rx => (
            <div key={rx.id} className="card rx-card" onClick={() => setSelected(rx)} style={{ cursor:'pointer' }}>
              <div className="flex-between" style={{ marginBottom:12 }}>
                <div>
                  <span className="rx-code" style={{ fontSize:'0.85rem' }}>Rx #{rx.prescription_code}</span>
                  <span className={`badge badge-${rx.status}`} style={{ marginLeft:12 }}>{rx.status}</span>
                </div>
                <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:4 }}><Calendar size={14}/>{new Date(rx.issued_date).toLocaleDateString()}</div>
              </div>
              {rx.diagnosis_text && <p style={{ fontSize:'0.85rem', color:'var(--text-secondary)', marginBottom:10 }}>{rx.diagnosis_text}</p>}
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:8 }}>
                {rx.items?.map((item:any,i:number) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', background:'var(--surface-alt)', borderRadius:20, fontSize:'0.82rem' }}>
                    <Pill size={14} color="var(--primary)"/> <span style={{fontWeight:600}}>{item.drug_name}</span> <span style={{color:'var(--text-muted)'}}>{item.dosage}{item.dosage_unit} · {item.frequency}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>Prescribed by {rx.doctor_name} · Expires {new Date(rx.expiry_date).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="flex-between" style={{marginBottom:20}}>
              <h3>Prescription Details</h3>
              <button className="btn-icon" onClick={() => setSelected(null)}><X size={20}/></button>
            </div>
            <div style={{ textAlign:'center', marginBottom:24, padding:20, background:'var(--surface-alt)', borderRadius:16 }}>
              <QRCode value={`DAWATRACK:${selected.prescription_code}`} size={160} />
              <p className="mono" style={{ marginTop:12, fontSize:'1rem', fontWeight:700, color:'var(--primary)' }}>{selected.prescription_code}</p>
              <p style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>Show this QR code at any partner pharmacy</p>
            </div>
            <div className="flex-between" style={{marginBottom:12}}>
              <span className={`badge badge-${selected.status}`}>{selected.status}</span>
              <span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>Issued: {new Date(selected.issued_date).toLocaleDateString()}</span>
            </div>
            {selected.diagnosis_text && <p style={{marginBottom:16, fontSize:'0.9rem'}}>Diagnosis: <strong>{selected.diagnosis_text}</strong> ({selected.diagnosis_code})</p>}
            <h4 style={{marginBottom:12}}>Medications</h4>
            {selected.items?.map((item:any, i:number) => (
              <div key={i} className="card" style={{ marginBottom:8, padding:16 }}>
                <div className="flex-between"><span style={{fontWeight:700}}>{item.drug_name}</span><span className="badge badge-primary">{item.route}</span></div>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginTop:8, fontSize:'0.82rem'}}>
                  <div><span style={{color:'var(--text-muted)'}}>Dosage:</span> <strong>{item.dosage}{item.dosage_unit}</strong></div>
                  <div><span style={{color:'var(--text-muted)'}}>Frequency:</span> <strong>{item.frequency}</strong></div>
                  <div><span style={{color:'var(--text-muted)'}}>Duration:</span> <strong>{item.duration_days} days</strong></div>
                </div>
                {item.instructions && <p style={{marginTop:8, fontSize:'0.82rem', color:'var(--text-secondary)', fontStyle:'italic'}}>💊 {item.instructions}</p>}
                <div className="progress" style={{marginTop:8}}><div className="progress-bar green" style={{width:`${Math.round((item.refills_used/Math.max(item.refills_allowed,1))*100)}%`}}/></div>
                <div style={{fontSize:'0.75rem', color:'var(--text-muted)', marginTop:4}}>Refills: {item.refills_used}/{item.refills_allowed}</div>
              </div>
            ))}
            {selected.notes && <p style={{marginTop:12, fontSize:'0.85rem', background:'var(--accent-soft)', padding:'10px 14px', borderRadius:10}}>📝 {selected.notes}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
