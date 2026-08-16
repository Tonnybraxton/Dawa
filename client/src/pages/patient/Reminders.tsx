import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Clock, Plus, Trash2, Bell, BellOff, Pill, X } from 'lucide-react';

export default function Reminders() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ drug_name: '', reminder_time: '08:00', channel: 'push' });
  const [loading, setLoading] = useState(true);

  const load = () => api.getReminders().then(setReminders).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const addReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createReminder(form);
    setShowAdd(false); setForm({ drug_name: '', reminder_time: '08:00', channel: 'push' }); load();
  };

  const toggleReminder = async (id: number, active: boolean) => { await api.updateReminder(id, { is_active: !active }); load(); };
  const deleteReminder = async (id: number) => { await api.deleteReminder(id); load(); };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="slide-up">
      <div className="flex-between" style={{ marginBottom: 24 }}>
        <div><h1 className="page-title">Medication Reminders</h1><p className="page-subtitle">Manage your daily medication schedule</p></div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={18}/>Add Reminder</button>
      </div>

      {reminders.length === 0 ? (
        <div className="card empty-state"><Bell size={48}/><h4>No reminders yet</h4><p>Add reminders to never miss a dose</p></div>
      ) : (
        <div style={{ display:'grid', gap:12 }}>
          {reminders.map(r => (
            <div key={r.id} className="card" style={{ display:'flex', alignItems:'center', gap:16, padding:16 }}>
              <div style={{ width:48, height:48, borderRadius:14, background: r.is_active ? 'rgba(245,166,35,0.1)' : 'var(--surface-alt)', display:'flex', alignItems:'center', justifyContent:'center', color: r.is_active ? 'var(--accent)' : 'var(--text-muted)' }}>
                <Pill size={22}/>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600 }}>{r.drug_name}</div>
                <div style={{ fontSize:'0.82rem', color:'var(--text-muted)', display:'flex', gap:12, marginTop:2 }}>
                  <span style={{ display:'flex', alignItems:'center', gap:4 }}><Clock size={14}/>{r.reminder_time}</span>
                  <span className="badge badge-primary" style={{ fontSize:'0.7rem' }}>{r.channel}</span>
                </div>
              </div>
              <button className="btn-icon" onClick={() => toggleReminder(r.id, r.is_active)} title={r.is_active ? 'Disable' : 'Enable'}>
                {r.is_active ? <Bell size={18} color="var(--success)"/> : <BellOff size={18}/>}
              </button>
              <button className="btn-icon" onClick={() => deleteReminder(r.id)} title="Delete"><Trash2 size={18} color="var(--danger)"/></button>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="flex-between" style={{marginBottom:20}}>
              <h3>Add Reminder</h3>
              <button className="btn-icon" onClick={() => setShowAdd(false)}><X size={20}/></button>
            </div>
            <form onSubmit={addReminder}>
              <div className="input-group"><label>Drug Name</label><input className="input" placeholder="e.g. Metformin 500mg" value={form.drug_name} onChange={e => setForm({...form, drug_name: e.target.value})} required/></div>
              <div className="input-group"><label>Reminder Time</label><input className="input" type="time" value={form.reminder_time} onChange={e => setForm({...form, reminder_time: e.target.value})} required/></div>
              <div className="input-group"><label>Channel</label>
                <select value={form.channel} onChange={e => setForm({...form, channel: e.target.value})}>
                  <option value="push">Push Notification</option><option value="sms">SMS</option><option value="whatsapp">WhatsApp</option><option value="email">Email</option>
                </select>
              </div>
              <button className="btn btn-primary" type="submit" style={{width:'100%'}}>Add Reminder</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
