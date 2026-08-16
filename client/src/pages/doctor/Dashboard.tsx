import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { FileText, Users, Clock, ArrowRight, Plus } from 'lucide-react';

export default function DoctorDashboard() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.getPrescriptions().then(setPrescriptions).catch(console.error).finally(() => setLoading(false)); }, []);

  const active = prescriptions.filter(r => r.status === 'active');
  const dispensed = prescriptions.filter(r => r.status === 'dispensed');
  const patients = [...new Set(prescriptions.map(r => r.patient_id))];

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="slide-up">
      <div className="flex-between" style={{ marginBottom: 24 }}>
        <div><h1 className="page-title">Doctor Dashboard</h1><p className="page-subtitle">Manage your patients and prescriptions</p></div>
        <Link to="/doctor/prescribe" className="btn btn-primary"><Plus size={18}/>New Prescription</Link>
      </div>

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon" style={{ background:'rgba(10,61,61,0.1)', color:'var(--primary)' }}><Users size={22}/></div>
          <div className="stat-value">{patients.length}</div>
          <div className="stat-label">Active Patients</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background:'rgba(56,161,105,0.1)', color:'var(--success)' }}><FileText size={22}/></div>
          <div className="stat-value">{prescriptions.length}</div>
          <div className="stat-label">Total Prescriptions</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background:'rgba(245,166,35,0.1)', color:'var(--accent)' }}><Clock size={22}/></div>
          <div className="stat-value">{active.length}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background:'rgba(66,153,225,0.1)', color:'#4299E1' }}><FileText size={22}/></div>
          <div className="stat-value">{dispensed.length}</div>
          <div className="stat-label">Dispensed</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h4 className="card-title">Recent Prescriptions</h4>
          <Link to="/doctor/prescriptions" className="btn btn-ghost btn-sm">View All <ArrowRight size={14}/></Link>
        </div>
        {prescriptions.length === 0 ? (
          <div className="empty-state"><FileText size={48}/><h4>No prescriptions yet</h4></div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Code</th><th>Patient</th><th>Drugs</th><th>Issued</th><th>Status</th></tr></thead>
              <tbody>
                {prescriptions.slice(0, 10).map(rx => (
                  <tr key={rx.id}>
                    <td><span className="rx-code">{rx.prescription_code}</span></td>
                    <td style={{fontWeight:500}}>{rx.patient_name}</td>
                    <td>{rx.items?.map((i:any)=>i.drug_name).join(', ')}</td>
                    <td style={{color:'var(--text-muted)', fontSize:'0.85rem'}}>{new Date(rx.issued_date).toLocaleDateString()}</td>
                    <td><span className={`badge badge-${rx.status}`}>{rx.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
