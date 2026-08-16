import { useState } from 'react';
import { api } from '../../lib/api';
import { AlertTriangle, Plus, X, Search, Shield } from 'lucide-react';

export default function InteractionChecker() {
  const [drugs, setDrugs] = useState<any[]>([]);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [checked, setChecked] = useState(false);

  const searchDrugs = async (q: string) => {
    setSearch(q);
    if (q.length < 2) { setResults([]); return; }
    const data = await api.searchDrugs(q);
    setResults(data.filter((d: any) => !drugs.find(s => s.code === d.code)));
  };

  const addDrug = (drug: any) => { setDrugs([...drugs, drug]); setSearch(''); setResults([]); setChecked(false); };
  const removeDrug = (code: string) => { setDrugs(drugs.filter(d => d.code !== code)); setChecked(false); setInteractions([]); };

  const checkInteractions = async () => {
    if (drugs.length < 2) return;
    const data = await api.checkInteractions(drugs.map(d => d.code));
    setInteractions(data);
    setChecked(true);
  };

  return (
    <div className="slide-up">
      <h1 className="page-title">Drug Interaction Checker</h1>
      <p className="page-subtitle">Check for dangerous drug combinations</p>

      <div className="card" style={{ marginBottom: 24 }}>
        <h4 style={{ marginBottom: 16 }}>Add Drugs to Check</h4>
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <div className="search-box">
            <Search size={18} />
            <input className="input" placeholder="Search for a drug..." value={search} onChange={e => searchDrugs(e.target.value)} />
          </div>
          {results.length > 0 && (
            <div style={{ position:'absolute', top:'100%', left:0, right:0, background:'var(--surface-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', zIndex:10, boxShadow:'var(--shadow-lg)', maxHeight:200, overflowY:'auto' }}>
              {results.map(d => (
                <div key={d.code} onClick={() => addDrug(d)} style={{ padding:'10px 14px', cursor:'pointer', borderBottom:'1px solid var(--border-light)', display:'flex', justifyContent:'space-between', alignItems:'center' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-alt)')} onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  <div><div style={{fontWeight:600, fontSize:'0.9rem'}}>{d.name}</div><div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>{d.code} · {d.category} · {d.form}</div></div>
                  <Plus size={16} color="var(--primary)"/>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
          {drugs.map(d => (
            <div key={d.code} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', background:'var(--surface-alt)', borderRadius:20, fontSize:'0.85rem', fontWeight:500 }}>
              {d.name} <button onClick={() => removeDrug(d.code)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex' }}><X size={14} color="var(--text-muted)"/></button>
            </div>
          ))}
        </div>

        <button className="btn btn-primary" onClick={checkInteractions} disabled={drugs.length < 2}>
          <Shield size={18}/> Check Interactions ({drugs.length} drugs)
        </button>
      </div>

      {checked && (
        <div className="card slide-up">
          <h4 style={{ marginBottom: 16 }}>Results</h4>
          {interactions.length === 0 ? (
            <div style={{ textAlign:'center', padding:32, color:'var(--success)' }}>
              <Shield size={48} style={{ marginBottom:12 }}/>
              <h4>No Interactions Found</h4>
              <p style={{ color:'var(--text-muted)', fontSize:'0.9rem' }}>These drugs appear safe to take together.</p>
            </div>
          ) : (
            <div style={{ display:'grid', gap:12 }}>
              {interactions.map((inter, i) => (
                <div key={i} style={{ padding:16, borderRadius:'var(--radius-md)', background: inter.severity === 'severe' ? 'var(--danger-soft)' : inter.severity === 'moderate' ? 'var(--warning-soft)' : 'var(--accent-soft)', border: `1px solid ${inter.severity === 'severe' ? 'var(--danger)' : inter.severity === 'moderate' ? 'var(--warning)' : 'var(--accent)'}33` }}>
                  <div className="flex-between" style={{ marginBottom:8 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <AlertTriangle size={18} color={inter.severity === 'severe' ? 'var(--danger)' : 'var(--warning)'}/>
                      <strong>{inter.drug_a_name} + {inter.drug_b_name}</strong>
                    </div>
                    <span className={`badge badge-${inter.severity}`}>{inter.severity}</span>
                  </div>
                  <p style={{ fontSize:'0.85rem', color:'var(--text-secondary)' }}>{inter.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
