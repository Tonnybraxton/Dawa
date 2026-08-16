import { useState, useEffect } from 'react';
import { api } from '../../lib/api';


export default function AdminDrugs() {
  const [drugs, setDrugs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.getAllDrugs().then(setDrugs).catch(console.error).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="slide-up">
      <h1 className="page-title">Drug Database</h1>
      <p className="page-subtitle">Master catalog of drugs in the system</p>
      <div className="card">
        <div className="table-container">
          <table>
            <thead><tr><th>Name</th><th>Code</th><th>Category</th><th>Form</th><th>Default Dosage</th><th>Description</th></tr></thead>
            <tbody>
              {drugs.map(d => (
                <tr key={d.id}>
                  <td style={{fontWeight:600}}>{d.name}</td>
                  <td><span className="mono" style={{fontSize:'0.8rem',background:'var(--surface-alt)',padding:'2px 8px',borderRadius:6}}>{d.code}</span></td>
                  <td><span className="badge badge-primary">{d.category}</span></td>
                  <td>{d.form}</td>
                  <td>{d.default_dosage}{d.default_unit}</td>
                  <td style={{fontSize:'0.85rem',color:'var(--text-muted)',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis'}}>{d.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
