import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { AlertTriangle, Plus, X, Edit2, Save } from 'lucide-react';

export default function Inventory() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<number|null>(null);
  const [editQty, setEditQty] = useState(0);
  const [form, setForm] = useState({ drug_name: '', drug_code: '', quantity: 0, price: 0, expiry_date: '', reorder_threshold: 10 });

  const load = () => api.getInventory().then(setInventory).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const addItem = async (e: React.FormEvent) => { e.preventDefault(); await api.addInventory(form); setShowAdd(false); load(); };
  const updateQty = async (id: number) => { await api.updateInventory(id, { quantity: editQty }); setEditId(null); load(); };

  const lowStock = inventory.filter(i => i.quantity <= i.reorder_threshold);
  const expiringSoon = inventory.filter(i => { const d = new Date(i.expiry_date); const now = new Date(); const diff = (d.getTime()-now.getTime())/(1000*60*60*24); return diff <= 90 && diff > 0; });

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="slide-up">
      <div className="flex-between" style={{ marginBottom:24 }}>
        <div><h1 className="page-title">Drug Inventory</h1><p className="page-subtitle">Manage your pharmacy stock</p></div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={18}/>Add Drug</button>
      </div>

      {(lowStock.length > 0 || expiringSoon.length > 0) && (
        <div className="stats-grid" style={{ marginBottom:16 }}>
          {lowStock.length > 0 && <div className="card" style={{ borderLeft:'4px solid var(--danger)', padding:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, color:'var(--danger)' }}><AlertTriangle size={18}/><strong>{lowStock.length} Low Stock Items</strong></div>
            <p style={{ fontSize:'0.82rem', color:'var(--text-muted)', marginTop:4 }}>{lowStock.map(i=>i.drug_name).join(', ')}</p>
          </div>}
          {expiringSoon.length > 0 && <div className="card" style={{ borderLeft:'4px solid var(--warning)', padding:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, color:'var(--warning)' }}><AlertTriangle size={18}/><strong>{expiringSoon.length} Expiring Soon</strong></div>
            <p style={{ fontSize:'0.82rem', color:'var(--text-muted)', marginTop:4 }}>{expiringSoon.map(i=>i.drug_name).join(', ')}</p>
          </div>}
        </div>
      )}

      <div className="card">
        <div className="table-container">
          <table>
            <thead><tr><th>Drug</th><th>Code</th><th>Qty</th><th>Price (KES)</th><th>Expiry</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {inventory.map(item => (
                <tr key={item.id}>
                  <td style={{fontWeight:500}}>{item.drug_name}</td>
                  <td><span className="mono" style={{fontSize:'0.8rem'}}>{item.drug_code||'—'}</span></td>
                  <td>{editId === item.id ? <input className="input" type="number" value={editQty} onChange={e=>setEditQty(parseInt(e.target.value))} style={{width:80, padding:'4px 8px'}}/> : <strong>{item.quantity}</strong>}</td>
                  <td>{item.price}</td>
                  <td style={{fontSize:'0.85rem'}}>{item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : '—'}</td>
                  <td>{item.quantity <= item.reorder_threshold ? <span className="badge badge-expired">Low</span> : <span className="badge badge-active">OK</span>}</td>
                  <td>{editId === item.id ? <button className="btn btn-sm btn-success" onClick={() => updateQty(item.id)}><Save size={14}/></button> : <button className="btn-icon" onClick={() => { setEditId(item.id); setEditQty(item.quantity); }}><Edit2 size={16}/></button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="flex-between" style={{marginBottom:20}}><h3>Add Drug to Inventory</h3><button className="btn-icon" onClick={() => setShowAdd(false)}><X size={20}/></button></div>
            <form onSubmit={addItem}>
              <div className="input-group"><label>Drug Name</label><input className="input" value={form.drug_name} onChange={e => setForm({...form, drug_name: e.target.value})} required/></div>
              <div className="input-group"><label>Drug Code</label><input className="input" value={form.drug_code} onChange={e => setForm({...form, drug_code: e.target.value})}/></div>
              <div className="grid-2">
                <div className="input-group"><label>Quantity</label><input className="input" type="number" value={form.quantity} onChange={e => setForm({...form, quantity: parseInt(e.target.value)})}/></div>
                <div className="input-group"><label>Price (KES)</label><input className="input" type="number" value={form.price} onChange={e => setForm({...form, price: parseFloat(e.target.value)})}/></div>
              </div>
              <div className="input-group"><label>Expiry Date</label><input className="input" type="date" value={form.expiry_date} onChange={e => setForm({...form, expiry_date: e.target.value})}/></div>
              <button className="btn btn-primary" type="submit" style={{width:'100%'}}>Add to Inventory</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
