import { useState, useEffect } from 'react';
import { api } from '../../lib/api';


export default function PrescriptionHistory() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.getPrescriptions().then(setPrescriptions).catch(console.error).finally(() => setLoading(false)); }, []);
  const filtered = filter === 'all' ? prescriptions : prescriptions.filter(r => r.status === filter);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="slide-up">
      <h1 className="page-title">Prescription History</h1>
      <p className="page-subtitle">All prescriptions you've issued</p>
      <div className="tabs">
        {['all','active','dispensed','expired'].map(f => <button key={f} className={`tab ${filter===f?'active':''}`} onClick={() => setFilter(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>)}
      </div>
      <div className="card">
        <div className="table-container">
          <table>
            <thead><tr><th>Code</th><th>Patient</th><th>Diagnosis</th><th>Drugs</th><th>Issued</th><th>Expires</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map(rx => (
                <tr key={rx.id}>
                  <td><span className="rx-code">{rx.prescription_code}</span></td>
                  <td style={{fontWeight:500}}>{rx.patient_name}</td>
                  <td style={{fontSize:'0.85rem'}}>{rx.diagnosis_text || '—'}</td>
                  <td style={{fontSize:'0.85rem'}}>{rx.items?.map((i:any)=>i.drug_name).join(', ')}</td>
                  <td style={{fontSize:'0.85rem', color:'var(--text-muted)'}}>{new Date(rx.issued_date).toLocaleDateString()}</td>
                  <td style={{fontSize:'0.85rem', color:'var(--text-muted)'}}>{new Date(rx.expiry_date).toLocaleDateString()}</td>
                  <td><span className={`badge badge-${rx.status}`}>{rx.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
