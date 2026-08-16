import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Pill, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
      const user = useAuthStore.getState().user;
      if (user) navigate(`/${user.role === 'pharmacist' ? 'pharmacy' : user.role === 'caregiver' ? 'caregiver' : user.role}`);
    } catch (err: any) { setError(err.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  const quickLogin = (e: string) => { setEmail(e); setPassword('password123'); };

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'var(--surface-alt)' }}>
      <div style={{ flex:1, background:'var(--gradient-hero)', display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px', color:'#fff', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-10%', right:'-10%', width:300, height:300, background:'radial-gradient(circle, rgba(245,166,35,0.2) 0%, transparent 70%)' }} />
        <div style={{ position:'relative', zIndex:1, maxWidth:400 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:40 }}>
            <div style={{ width:44, height:44, background:'rgba(255,255,255,0.15)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center' }}><Pill size={24} /></div>
            <span style={{ fontSize:'1.5rem', fontWeight:700 }}>Dawa<span style={{color:'var(--accent)'}}>Track</span></span>
          </div>
          <h1 style={{ fontSize:'2.5rem', fontWeight:800, lineHeight:1.15, marginBottom:16 }}>Welcome<br />Back</h1>
          <p style={{ opacity:0.8, fontSize:'1.05rem', lineHeight:1.7 }}>Track your prescriptions, manage reminders, and stay connected with your healthcare providers.</p>
        </div>
      </div>

      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
        <div style={{ width:'100%', maxWidth:420 }}>
          <h2 style={{ marginBottom:8 }}>Sign In</h2>
          <p style={{ color:'var(--text-muted)', marginBottom:32 }}>Enter your credentials to access your dashboard</p>

          {error && <div style={{ background:'var(--danger-soft)', color:'var(--danger)', padding:'12px 16px', borderRadius:12, marginBottom:16, fontSize:'0.9rem' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email Address</label>
              <div style={{ position:'relative' }}>
                <Mail size={18} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
                <input className="input" style={{ paddingLeft:40 }} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="input-group">
              <label>Password</label>
              <div style={{ position:'relative' }}>
                <Lock size={18} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
                <input className="input" style={{ paddingLeft:40, paddingRight:40 }} type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}>
                  {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width:'100%', marginTop:8 }}>
              {loading ? 'Signing in...' : 'Sign In'} {!loading && <ArrowRight size={18}/>}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:24, fontSize:'0.9rem', color:'var(--text-muted)' }}>
            Don't have an account? <Link to="/register" style={{fontWeight:600}}>Register</Link>
          </p>

          <div style={{ marginTop:32, padding:'20px', background:'var(--surface-alt)', borderRadius:16 }}>
            <p style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--text-muted)', marginBottom:12, textTransform:'uppercase', letterSpacing:0.5 }}>Quick Demo Login</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {[
                { label: 'Patient', email: 'patient@dawa.co.ke' },
                { label: 'Doctor', email: 'doctor@dawa.co.ke' },
                { label: 'Pharmacist', email: 'pharmacist@dawa.co.ke' },
                { label: 'Admin', email: 'admin@dawa.co.ke' },
                { label: 'Caregiver', email: 'caregiver@dawa.co.ke' },
              ].map(q => (
                <button key={q.email} className="btn btn-sm btn-outline" onClick={() => quickLogin(q.email)} style={{ fontSize:'0.75rem' }}>{q.label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
