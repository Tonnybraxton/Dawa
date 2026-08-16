import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { Search, Plus, X, AlertTriangle, Send, Pill } from 'lucide-react';

export default function Prescribe() {
  const navigate = useNavigate();
  const [patientSearch, setPatientSearch] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [drugSearch, setDrugSearch] = useState('');
  const [drugResults, setDrugResults] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [form, setForm] = useState({ diagnosis_text: '', diagnosis_code: '', notes: '', expiry_date: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const searchPatients = async (q: string) => {
    setPatientSearch(q);
    if (q.length < 2) { setPatients([]); return; }
    const data = await api.searchPatients(q);
    setPatients(data);
  };

  const searchDrugs = async (q: string) => {
    setDrugSearch(q);
    if (q.length < 2) { setDrugResults([]); return; }
    const data = await api.searchDrugs(q);
    setDrugResults(data.filter((d: any) => !items.find(i => i.drug_code === d.code)));
  };

  const addDrug = async (drug: any) => {
    const newItem = { drug_name: drug.name, drug_code: drug.code, dosage: drug.default_dosage || '', dosage_unit: drug.default_unit || 'mg', frequency: 'Once daily', duration_days: 30, refills_allowed: 0, instructions: '', route: 'oral' };
    const newItems = [...items, newItem];
    setItems(newItems);
    setDrugSearch(''); setDrugResults([]);

    if (newItems.length >= 2) {
      const codes = newItems.map(i => i.drug_code).filter(Boolean);
      const inter = await api.checkInteractions(codes);
      setInteractions(inter);
    }
  };

  const removeItem = (idx: number) => { setItems(items.filter((_, i) => i !== idx)); };
  const updateItem = (idx: number, field: string, value: any) => { setItems(items.map((item, i) => i === idx ? { ...item, [field]: value } : item)); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || items.length === 0) { setError('Select a patient and add at least one drug'); return; }
    setLoading(true); setError('');
    try {
      const rx = await api.createPrescription({ patient_id: selectedPatient.id, items, ...form });
      setSuccess(`Prescription created! Code: ${rx.prescription_code}`);
      setTimeout(() => navigate('/doctor'), 2000);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="slide-up">
      <h1 className="page-title">Issue Prescription</h1>
      <p className="page-subtitle">Create a new digital prescription for your patient</p>

      {success && <div style={{ background:'var(--success-soft)', color:'#276749', padding:'14px 20px', borderRadius:12, marginBottom:20, fontWeight:500 }}>✅ {success}</div>}
      {error && <div style={{ background:'var(--danger-soft)', color:'var(--danger)', padding:'14px 20px', borderRadius:12, marginBottom:20 }}>{error}</div>}

      {interactions.length > 0 && (
        <div style={{ background:'var(--danger-soft)', border:'1px solid var(--danger)', borderRadius:12, padding:16, marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}><AlertTriangle color="var(--danger)"/><strong>Drug Interaction Warning!</strong></div>
          {interactions.map((inter, i) => (
            <div key={i} style={{ fontSize:'0.85rem', marginBottom:4 }}>
              <span className={`badge badge-${inter.severity}`} style={{marginRight:8}}>{inter.severity}</span>
              <strong>{inter.drug_a_name} + {inter.drug_b_name}</strong>: {inter.description}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid-2" style={{ marginBottom: 20 }}>
          <div className="card">
            <h4 style={{ marginBottom:16 }}>Patient</h4>
            {selectedPatient ? (
              <div className="flex-between" style={{ padding:12, background:'var(--success-soft)', borderRadius:12 }}>
                <div><div style={{fontWeight:600}}>{selectedPatient.full_name}</div><div style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>{selectedPatient.email} · {selectedPatient.phone}</div></div>
                <button type="button" className="btn-icon" onClick={() => setSelectedPatient(null)}><X size={16}/></button>
              </div>
            ) : (
              <div style={{ position:'relative' }}>
                <div className="search-box"><Search size={18}/><input className="input" placeholder="Search patient by name, ID, email..." value={patientSearch} onChange={e => searchPatients(e.target.value)}/></div>
                {patients.length > 0 && (
                  <div style={{ position:'absolute', top:'100%', left:0, right:0, background:'var(--surface-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', zIndex:10, boxShadow:'var(--shadow-lg)' }}>
                    {patients.map(p => (
                      <div key={p.id} onClick={() => { setSelectedPatient(p); setPatients([]); setPatientSearch(''); }} style={{ padding:'10px 14px', cursor:'pointer', borderBottom:'1px solid var(--border-light)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-alt)')} onMouseLeave={e => (e.currentTarget.style.background = '')}>
                        <div style={{fontWeight:500}}>{p.full_name}</div>
                        <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>{p.email} · ID: {p.national_id}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="card">
            <h4 style={{ marginBottom:16 }}>Diagnosis</h4>
            <div className="input-group"><label>Diagnosis</label><input className="input" placeholder="e.g. Type 2 Diabetes" value={form.diagnosis_text} onChange={e => setForm({...form, diagnosis_text: e.target.value})}/></div>
            <div className="grid-2">
              <div className="input-group"><label>ICD-10 Code</label><input className="input" placeholder="E11.9" value={form.diagnosis_code} onChange={e => setForm({...form, diagnosis_code: e.target.value})}/></div>
              <div className="input-group"><label>Expiry Date</label><input className="input" type="date" value={form.expiry_date} onChange={e => setForm({...form, expiry_date: e.target.value})}/></div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom:20 }}>
          <div className="flex-between" style={{ marginBottom:16 }}><h4>Medications</h4></div>
          <div style={{ position:'relative', marginBottom:16 }}>
            <div className="search-box"><Search size={18}/><input className="input" placeholder="Search drug to add..." value={drugSearch} onChange={e => searchDrugs(e.target.value)}/></div>
            {drugResults.length > 0 && (
              <div style={{ position:'absolute', top:'100%', left:0, right:0, background:'var(--surface-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', zIndex:10, boxShadow:'var(--shadow-lg)', maxHeight:200, overflowY:'auto' }}>
                {drugResults.map(d => (
                  <div key={d.code} onClick={() => addDrug(d)} style={{ padding:'10px 14px', cursor:'pointer', borderBottom:'1px solid var(--border-light)', display:'flex', justifyContent:'space-between' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-alt)')} onMouseLeave={e => (e.currentTarget.style.background = '')}>
                    <div><span style={{fontWeight:600}}>{d.name}</span> <span style={{color:'var(--text-muted)', fontSize:'0.8rem'}}>{d.default_dosage}{d.default_unit} · {d.form}</span></div>
                    <Plus size={16} color="var(--primary)"/>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length === 0 ? <p style={{ color:'var(--text-muted)', textAlign:'center', padding:20 }}>No drugs added yet. Search above to add.</p> : items.map((item, idx) => (
            <div key={idx} style={{ padding:16, background:'var(--surface-alt)', borderRadius:12, marginBottom:8, position:'relative' }}>
              <button type="button" onClick={() => removeItem(idx)} style={{ position:'absolute', top:8, right:8, background:'none', border:'none', cursor:'pointer' }}><X size={16} color="var(--danger)"/></button>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}><Pill size={18} color="var(--primary)"/><strong>{item.drug_name}</strong></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:8 }}>
                <div className="input-group" style={{margin:0}}><label>Dosage</label><input className="input" value={item.dosage} onChange={e => updateItem(idx, 'dosage', e.target.value)}/></div>
                <div className="input-group" style={{margin:0}}><label>Frequency</label>
                  <select value={item.frequency} onChange={e => updateItem(idx, 'frequency', e.target.value)}>
                    <option>Once daily</option><option>Twice daily</option><option>Three times daily</option><option>Four times daily</option><option>As needed</option><option>Every 8 hours</option>
                  </select>
                </div>
                <div className="input-group" style={{margin:0}}><label>Duration (days)</label><input className="input" type="number" value={item.duration_days} onChange={e => updateItem(idx, 'duration_days', parseInt(e.target.value))}/></div>
                <div className="input-group" style={{margin:0}}><label>Route</label>
                  <select value={item.route} onChange={e => updateItem(idx, 'route', e.target.value)}>
                    <option value="oral">Oral</option><option value="topical">Topical</option><option value="injection">Injection</option><option value="inhaled">Inhaled</option>
                  </select>
                </div>
              </div>
              <div className="input-group" style={{marginTop:8, marginBottom:0}}><label>Instructions</label><input className="input" placeholder="e.g. Take with meals" value={item.instructions} onChange={e => updateItem(idx, 'instructions', e.target.value)}/></div>
            </div>
          ))}
        </div>

        <div className="input-group"><label>Additional Notes</label><textarea placeholder="Notes for the patient..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}/></div>

        <button className="btn btn-primary btn-lg" type="submit" disabled={loading || !selectedPatient || items.length === 0} style={{ width:'100%' }}>
          <Send size={18}/>{loading ? 'Creating...' : 'Issue Prescription'}
        </button>
      </form>
    </div>
  );
}
