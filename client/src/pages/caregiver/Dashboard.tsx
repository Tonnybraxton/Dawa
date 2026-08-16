import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

import { Eye, FileText, Pill, Users } from 'lucide-react';

export default function CaregiverDashboard() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.getPrescriptions().then(setPrescriptions).catch(console.error).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="slide-up">
      <h1 className="page-title">Caregiver Dashboard</h1>
      <p className="page-subtitle">Monitor your dependents' prescriptions (read-only)</p>

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon" style={{background:'rgba(10,61,61,0.1)', color:'var(--primary)'}}><Users size={22}/></div>
          <div className="stat-value">{[...new Set(prescriptions.map(r=>r.patient_id))].length}</div>
          <div className="stat-label">Dependents</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{background:'rgba(56,161,105,0.1)', color:'var(--success)'}}><FileText size={22}/></div>
          <div className="stat-value">{prescriptions.filter(r=>r.status==='active').length}</div>
          <div className="stat-label">Active Prescriptions</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{background:'rgba(245,166,35,0.1)', color:'var(--accent)'}}><Eye size={22}/></div>
          <div className="stat-value">{prescriptions.length}</div>
          <div className="stat-label">Total Visible</div>
        </div>
      </div>

      <div className="card">
        <h4 className="card-title" style={{marginBottom:16}}>Dependent Prescriptions</h4>
        {prescriptions.length === 0 ? <div className="empty-state"><FileText size={48}/><h4>No prescriptions linked</h4><p>You'll see prescriptions when a patient links you as caregiver.</p></div> : (
          <div style={{display:'grid', gap:12}}>
            {prescriptions.map(rx => (
              <div key={rx.id} style={{padding:14, borderBottom:'1px solid var(--border-light)'}}>
                <div className="flex-between">
                  <div>
                    <span style={{fontWeight:600}}>{rx.patient_name}</span>
                    <span className="rx-code" style={{marginLeft:8}}>Rx #{rx.prescription_code}</span>
                  </div>
                  <span className={`badge badge-${rx.status}`}>{rx.status}</span>
                </div>
                <div style={{display:'flex', gap:8, marginTop:8, flexWrap:'wrap'}}>
                  {rx.items?.map((item:any, i:number) => (
                    <span key={i} style={{display:'flex', alignItems:'center', gap:4, padding:'4px 10px', background:'var(--surface-alt)', borderRadius:16, fontSize:'0.8rem'}}>
                      <Pill size={12}/>{item.drug_name} {item.dosage}{item.dosage_unit}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
