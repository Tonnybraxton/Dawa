import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { ScrollText } from 'lucide-react';

export default function AuditLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.getAuditLogs().then(setLogs).catch(console.error).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="slide-up">
      <h1 className="page-title">Audit Logs</h1>
      <p className="page-subtitle">System activity trail for compliance</p>
      <div className="card">
        {logs.length === 0 ? <div className="empty-state"><ScrollText size={48}/><h4>No audit logs yet</h4><p>Activity will be recorded as users interact with the system.</p></div> : (
          <div className="table-container">
            <table>
              <thead><tr><th>User</th><th>Role</th><th>Action</th><th>Resource</th><th>IP</th><th>Timestamp</th></tr></thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id}>
                    <td style={{fontWeight:500}}>{l.full_name || 'System'}</td>
                    <td><span className="badge badge-primary">{l.role || '—'}</span></td>
                    <td><span className="mono" style={{fontSize:'0.8rem'}}>{l.action}</span></td>
                    <td style={{fontSize:'0.85rem'}}>{l.resource}</td>
                    <td style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>{l.ip_address || '—'}</td>
                    <td style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>{l.timestamp ? new Date(l.timestamp).toLocaleString() : '—'}</td>
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
