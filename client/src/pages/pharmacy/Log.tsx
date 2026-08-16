import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { ClipboardList } from 'lucide-react';

export default function DispensingLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.getDispensingLog().then(setLogs).catch(console.error).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="slide-up">
      <h1 className="page-title">Dispensing Log</h1>
      <p className="page-subtitle">Record of all dispensed prescriptions</p>
      <div className="card">
        {logs.length === 0 ? <div className="empty-state"><ClipboardList size={48}/><h4>No dispensing records yet</h4></div> : (
          <div className="table-container">
            <table>
              <thead><tr><th>Rx Code</th><th>Patient</th><th>Items</th><th>Dispensed At</th><th>Notes</th></tr></thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td><span className="rx-code">{log.prescription_code}</span></td>
                    <td style={{fontWeight:500}}>{log.patient_name}</td>
                    <td style={{fontSize:'0.85rem'}}>{JSON.parse(log.items_dispensed || '[]').join(', ')}</td>
                    <td style={{fontSize:'0.85rem', color:'var(--text-muted)'}}>{new Date(log.dispensed_at).toLocaleString()}</td>
                    <td style={{fontSize:'0.85rem'}}>{log.notes || '—'}</td>
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
