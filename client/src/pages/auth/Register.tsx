import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Pill, ArrowRight, User, Stethoscope, Building, ShieldCheck } from 'lucide-react';

const roles = [
  { value: 'patient', label: 'Patient', icon: User, desc: 'Track prescriptions & reminders' },
  { value: 'doctor', label: 'Doctor', icon: Stethoscope, desc: 'Issue digital prescriptions' },
  { value: 'pharmacist', label: 'Pharmacist', icon: Building, desc: 'Dispense & manage inventory' },
  { value: 'caregiver', label: 'Caregiver', icon: ShieldCheck, desc: 'Monitor dependents' },
];

export default function Register() {
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState(searchParams.get('role') || '');
  const [formData, setFormData] = useState({ full_name: '', email: '', phone: '', password: '', national_id: '', nhif_number: '', kmpdc_number: '', ppb_license: '', specialization: '', hospital_name: '', pharmacy_name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const update = (field: string, val: string) => setFormData(prev => ({ ...prev, [field]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await register({ ...formData, role });
      const user = useAuthStore.getState().user;
      if (user) navigate(`/${user.role === 'pharmacist' ? 'pharmacy' : user.role}`);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  if (!role) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--surface-alt)', padding:20 }}>
        <div style={{ maxWidth:600, width:'100%' }}>
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:10, marginBottom:16 }}>
              <div style={{ width:44, height:44, background:'var(--gradient-primary)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}><Pill size={24}/></div>
              <span style={{ fontSize:'1.5rem', fontWeight:700, color:'var(--primary)' }}>Dawa<span style={{color:'var(--accent)'}}>Track</span></span>
            </div>
            <h2>Create Your Account</h2>
            <p style={{ color:'var(--text-muted)' }}>Choose your role to get started</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:16 }}>
            {roles.map(r => (
              <button key={r.value} className="card" onClick={() => setRole(r.value)} style={{ cursor:'pointer', textAlign:'center', padding:28, border:'2px solid var(--border-light)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary)')} onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-light)')}>
                <div style={{ width:52, height:52, borderRadius:16, background:'rgba(10,61,61,0.08)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', color:'var(--primary)' }}><r.icon size={26}/></div>
                <h4>{r.label}</h4>
                <p style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginTop:4 }}>{r.desc}</p>
              </button>
            ))}
          </div>
          <p style={{ textAlign:'center', marginTop:24, color:'var(--text-muted)', fontSize:'0.9rem' }}>Already have an account? <Link to="/login" style={{fontWeight:600}}>Sign In</Link></p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--surface-alt)', padding:20 }}>
      <div style={{ maxWidth:480, width:'100%' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, marginBottom:12 }}>
            <div style={{ width:40, height:40, background:'var(--gradient-primary)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}><Pill size={20}/></div>
            <span style={{ fontSize:'1.3rem', fontWeight:700, color:'var(--primary)' }}>Dawa<span style={{color:'var(--accent)'}}>Track</span></span>
          </div>
          <h2>Register as {role.charAt(0).toUpperCase() + role.slice(1)}</h2>
          <button onClick={() => setRole('')} style={{ fontSize:'0.85rem', color:'var(--primary-light)', background:'none', border:'none', cursor:'pointer', marginTop:4 }}>← Change role</button>
        </div>

        {error && <div style={{ background:'var(--danger-soft)', color:'var(--danger)', padding:'12px 16px', borderRadius:12, marginBottom:16, fontSize:'0.9rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="card" style={{ padding:28 }}>
          <div className="input-group">
            <label>Full Name</label>
            <input className="input" placeholder="John Doe" value={formData.full_name} onChange={e => update('full_name', e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={formData.email} onChange={e => update('email', e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Phone (+254...)</label>
            <input className="input" placeholder="+254712345678" value={formData.phone} onChange={e => update('phone', e.target.value)} />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input className="input" type="password" placeholder="Min 6 characters" value={formData.password} onChange={e => update('password', e.target.value)} required minLength={6} />
          </div>

          {role === 'doctor' && (<>
            <div className="input-group"><label>KMPDC License Number</label><input className="input" placeholder="KMPDC-XXXXX" value={formData.kmpdc_number} onChange={e => update('kmpdc_number', e.target.value)} /></div>
            <div className="input-group"><label>Specialization</label><input className="input" placeholder="e.g. General Practice" value={formData.specialization} onChange={e => update('specialization', e.target.value)} /></div>
            <div className="input-group"><label>Hospital</label><input className="input" placeholder="Hospital name" value={formData.hospital_name} onChange={e => update('hospital_name', e.target.value)} /></div>
          </>)}

          {role === 'pharmacist' && (<>
            <div className="input-group"><label>PPB License</label><input className="input" placeholder="PPB-XXXXX" value={formData.ppb_license} onChange={e => update('ppb_license', e.target.value)} /></div>
            <div className="input-group"><label>Pharmacy Name</label><input className="input" placeholder="Pharmacy name" value={formData.pharmacy_name} onChange={e => update('pharmacy_name', e.target.value)} /></div>
          </>)}

          {role === 'patient' && (
            <div className="input-group"><label>NHIF Number (Optional)</label><input className="input" placeholder="NHIF-XXXXXX" value={formData.nhif_number} onChange={e => update('nhif_number', e.target.value)} /></div>
          )}

          <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width:'100%', marginTop:8 }}>
            {loading ? 'Creating account...' : 'Create Account'} {!loading && <ArrowRight size={18}/>}
          </button>
        </form>
        <p style={{ textAlign:'center', marginTop:20, fontSize:'0.9rem', color:'var(--text-muted)' }}>Already registered? <Link to="/login" style={{fontWeight:600}}>Sign In</Link></p>
      </div>
    </div>
  );
}
