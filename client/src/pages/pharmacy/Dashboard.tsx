import { useState } from 'react';
import { api } from '../../lib/api';
import { QrCode, Search, CheckCircle, AlertTriangle, Pill, X } from 'lucide-react';

export default function PharmacyDashboard() {
  const [code, setCode] = useState('');
  const [prescription, setPrescription] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const lookupPrescription = async () => {
    if (!code.trim()) return;
    setError(''); setPrescription(null);
    try {
      const rx = await api.getPrescriptionByCode(code.trim().toUpperCase());
      setPrescription(rx);
    } catch (err: any) { setError(err.message); }
  };

  const dispense = async () => {
    if (!prescription) return;
    setLoading(true);
    try {
      await api.dispense(prescription.prescription_code);
      setSuccess('Prescription dispensed successfully!');
      setPrescription(null); setCode('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="slide-up">
      <h1 className="page-title">Dispensing Station</h1>
      <p className="page-subtitle">Scan or enter a prescription code to dispense</p>

      {success && <div style={{ background:'var(--success-soft)', color:'#276749', padding:'14px 20px', borderRadius:12, marginBottom:20, fontWeight:500, display:'flex', alignItems:'center', gap:8 }}><CheckCircle size={20}/>{success}</div>}

      <div className="card" style={{ textAlign:'center', padding:40, marginBottom:24 }}>
        <div style={{ width:80, height:80, borderRadius:24, background:'rgba(10,61,61,0.08)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', color:'var(--primary)' }}>
          <QrCode size={40}/>
        </div>
        <h3 style={{ marginBottom:20 }}>Enter Prescription Code</h3>
        <div style={{ display:'flex', gap:12, maxWidth:500, margin:'0 auto' }}>
          <input className="input mono" placeholder="e.g. A1B2C3D4" value={code} onChange={e => setCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && lookupPrescription()} style={{ fontSize:'1.2rem', textAlign:'center', letterSpacing:2, fontWeight:700 }}/>
          <button className="btn btn-primary" onClick={lookupPrescription}><Search size={18}/>Lookup</button>
        </div>
        {error && <p style={{ color:'var(--danger)', marginTop:12, fontSize:'0.9rem' }}>{error}</p>}
      </div>

      {prescription && (
        <div className="card slide-up" style={{ maxWidth:600, margin:'0 auto' }}>
          <div className="flex-between" style={{ marginBottom:16 }}>
            <h3>Prescription Found</h3>
            <button className="btn-icon" onClick={() => setPrescription(null)}><X size={20}/></button>
          </div>
          <div style={{ padding:16, background:'var(--surface-alt)', borderRadius:12, marginBottom:16 }}>
            <div className="flex-between" style={{ marginBottom:8 }}>
              <span className="rx-code" style={{ fontSize:'1rem' }}>Rx #{prescription.prescription_code}</span>
              <span className={`badge badge-${prescription.status}`}>{prescription.status}</span>
            </div>
            <div style={{ fontSize:'0.9rem' }}><strong>Patient:</strong> {prescription.patient_name}</div>
            <div style={{ fontSize:'0.9rem' }}><strong>Doctor:</strong> {prescription.doctor_name}</div>
            <div style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>Issued: {new Date(prescription.issued_date).toLocaleDateString()} · Expires: {new Date(prescription.expiry_date).toLocaleDateString()}</div>
          </div>

          <h4 style={{ marginBottom:12 }}>Medications to Dispense</h4>
          {prescription.items?.map((item: any, i: number) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:12, background:'var(--surface-alt)', borderRadius:10, marginBottom:8 }}>
              <Pill size={18} color="var(--primary)"/>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600 }}>{item.drug_name} {item.dosage}{item.dosage_unit}</div>
                <div style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{item.frequency} · {item.duration_days} days · {item.route}</div>
              </div>
            </div>
          ))}

          {prescription.notes && <p style={{ marginTop:12, fontSize:'0.85rem', background:'var(--accent-soft)', padding:'10px 14px', borderRadius:10 }}>📝 {prescription.notes}</p>}

          {prescription.status === 'active' ? (
            <button className="btn btn-success btn-lg" onClick={dispense} disabled={loading} style={{ width:'100%', marginTop:20 }}>
              <CheckCircle size={18}/>{loading ? 'Dispensing...' : 'Mark as Dispensed'}
            </button>
          ) : (
            <div style={{ textAlign:'center', padding:16, color:'var(--text-muted)', marginTop:12 }}>
              <AlertTriangle size={20} style={{ marginBottom:4 }}/><p>This prescription is <strong>{prescription.status}</strong> and cannot be dispensed.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
