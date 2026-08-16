import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { CheckCircle, XCircle } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => api.getUsers(roleFilter || undefined).then(setUsers).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, [roleFilter]);

  const verify = async (id: number) => { await api.verifyUser(id); load(); };
  const suspend = async (id: number) => { await api.suspendUser(id); load(); };

  const filtered = filter === 'all' ? users : filter === 'pending' ? users.filter(u => !u.is_verified) : users.filter(u => u.is_verified);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="slide-up">
      <h1 className="page-title">User Management</h1>
      <p className="page-subtitle">Verify and manage platform users</p>

      <div style={{ display:'flex', gap:12, marginBottom:20 }}>
        <div className="tabs">
          {['all','pending','verified'].map(f => <button key={f} className={`tab ${filter===f?'active':''}`} onClick={() => setFilter(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>)}
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ padding:'6px 12px', borderRadius:'var(--radius-md)', border:'2px solid var(--border)', fontSize:'0.85rem' }}>
          <option value="">All Roles</option><option value="patient">Patient</option><option value="doctor">Doctor</option><option value="pharmacist">Pharmacist</option><option value="caregiver">Caregiver</option><option value="admin">Admin</option>
        </select>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Phone</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td style={{fontWeight:500}}>{u.full_name}</td>
                  <td style={{fontSize:'0.85rem'}}>{u.email}</td>
                  <td><span className="badge badge-primary">{u.role}</span></td>
                  <td style={{fontSize:'0.85rem'}}>{u.phone || '—'}</td>
                  <td>{u.is_verified ? <span className="badge badge-active">Verified</span> : <span className="badge badge-expired">Pending</span>}</td>
                  <td style={{fontSize:'0.85rem', color:'var(--text-muted)'}}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    {!u.is_verified ? <button className="btn btn-sm btn-success" onClick={() => verify(u.id)}><CheckCircle size={14}/>Verify</button>
                    : <button className="btn btn-sm btn-danger" onClick={() => suspend(u.id)}><XCircle size={14}/>Suspend</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
