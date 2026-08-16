import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';

import { FileText, Clock, Pill, CheckCircle, TrendingUp, ArrowRight, Bell } from 'lucide-react';

export default function PatientDashboard() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getPrescriptions(), api.getReminders()])
      .then(([rx, rem]) => { setPrescriptions(rx); setReminders(rem); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activeRx = prescriptions.filter(r => r.status === 'active');
  const dispensedRx = prescriptions.filter(r => r.status === 'dispensed');
  const activeReminders = reminders.filter(r => r.is_active);

  const adherenceScore = prescriptions.length > 0 ? Math.round((dispensedRx.length / Math.max(prescriptions.length, 1)) * 100) : 85;

  if (loading) return <div className="loading-page"><div className="spinner" /><p>Loading dashboard...</p></div>;

  return (
    <div className="slide-up">
      <h1 className="page-title">Patient Dashboard</h1>
      <p className="page-subtitle">Track your prescriptions and stay on top of your health.</p>

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon" style={{ background:'rgba(56,161,105,0.1)', color:'var(--success)' }}><FileText size={22}/></div>
          <div className="stat-value">{activeRx.length}</div>
          <div className="stat-label">Active Prescriptions</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background:'rgba(245,166,35,0.1)', color:'var(--accent)' }}><Clock size={22}/></div>
          <div className="stat-value">{activeReminders.length}</div>
          <div className="stat-label">Active Reminders</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background:'rgba(10,61,61,0.1)', color:'var(--primary)' }}><CheckCircle size={22}/></div>
          <div className="stat-value">{dispensedRx.length}</div>
          <div className="stat-label">Dispensed</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: adherenceScore >= 70 ? 'rgba(56,161,105,0.1)' : 'rgba(229,62,62,0.1)', color: adherenceScore >= 70 ? 'var(--success)' : 'var(--danger)' }}><TrendingUp size={22}/></div>
          <div className="stat-value">{adherenceScore}%</div>
          <div className="stat-label">Adherence Score</div>
        </div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <h4 className="card-title">Active Prescriptions</h4>
              <Link to="/patient/prescriptions" className="btn btn-ghost btn-sm">View All <ArrowRight size={14}/></Link>
            </div>
            {activeRx.length === 0 ? (
              <div className="empty-state"><FileText /><p>No active prescriptions</p></div>
            ) : activeRx.slice(0, 3).map(rx => (
              <Link to={`/patient/prescriptions`} key={rx.id} style={{ display:'block', padding:'14px 0', borderBottom:'1px solid var(--border-light)', textDecoration:'none', color:'inherit' }}>
                <div className="flex-between">
                  <div>
                    <div className="rx-code">Rx #{rx.prescription_code}</div>
                    <div style={{ fontWeight:600, marginTop:2 }}>{rx.items?.map((i:any)=>i.drug_name).join(', ') || 'Prescription'}</div>
                    <div className="rx-detail">Dr. {rx.doctor_name} · Expires {new Date(rx.expiry_date).toLocaleDateString()}</div>
                  </div>
                  <span className={`badge badge-${rx.status}`}>{rx.status}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom:16 }}>
            <h4 className="card-title" style={{ marginBottom:16 }}>Today's Reminders</h4>
            {activeReminders.length === 0 ? (
              <div className="empty-state" style={{padding:24}}><Bell /><p>No reminders set</p></div>
            ) : activeReminders.map(r => (
              <div key={r.id} style={{ padding:'10px 0', borderBottom:'1px solid var(--border-light)', display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:12, background:'rgba(245,166,35,0.1)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--accent)', flexShrink:0 }}>
                  <Pill size={18}/>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:'0.85rem' }}>{r.drug_name}</div>
                  <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{r.reminder_time} · {r.channel}</div>
                </div>
              </div>
            ))}
            <Link to="/patient/reminders" className="btn btn-ghost btn-sm" style={{ width:'100%', marginTop:12 }}>Manage Reminders</Link>
          </div>

          <div className="card">
            <h4 className="card-title" style={{ marginBottom:12 }}>Quick Actions</h4>
            <Link to="/patient/pharmacies" className="btn btn-outline btn-sm" style={{ width:'100%', marginBottom:8 }}>Find Nearby Pharmacy</Link>
            <Link to="/patient/interactions" className="btn btn-outline btn-sm" style={{ width:'100%' }}>Check Drug Interactions</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
