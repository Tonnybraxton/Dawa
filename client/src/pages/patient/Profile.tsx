import { useAuthStore } from '../../store/authStore';
import { Heart, Phone, Shield, CreditCard, Ruler, Weight } from 'lucide-react';

export default function Profile() {
  const { user } = useAuthStore();
  const profile = user?.profile;
  const allergies = profile?.allergies ? JSON.parse(profile.allergies) : [];
  const conditions = profile?.chronic_conditions ? JSON.parse(profile.chronic_conditions) : [];

  return (
    <div className="slide-up">
      <h1 className="page-title">Health Profile</h1>
      <p className="page-subtitle">Your personal health information</p>

      <div className="grid-2">
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
            <div className="avatar avatar-lg" style={{ background:'var(--gradient-primary)', width:64, height:64, fontSize:'1.5rem' }}>
              {user?.full_name?.split(' ').map((n:string)=>n[0]).join('')}
            </div>
            <div>
              <h3>{user?.full_name}</h3>
              <p style={{ color:'var(--text-muted)', fontSize:'0.9rem' }}>{user?.email}</p>
              <span className="badge badge-active">Verified Patient</span>
            </div>
          </div>
          <div style={{ display:'grid', gap:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom:'1px solid var(--border-light)' }}>
              <Phone size={18} color="var(--text-muted)"/><div><div style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>Phone</div><div style={{fontWeight:500}}>{user?.phone || 'Not set'}</div></div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom:'1px solid var(--border-light)' }}>
              <CreditCard size={18} color="var(--text-muted)"/><div><div style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>National ID</div><div style={{fontWeight:500}}>{user?.national_id || 'Not set'}</div></div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0' }}>
              <Shield size={18} color="var(--text-muted)"/><div><div style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>NHIF Number</div><div style={{fontWeight:500}}>{user?.nhif_number || 'Not linked'}</div></div>
            </div>
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom:16 }}>
            <h4 className="card-title" style={{marginBottom:16}}>Medical Info</h4>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
              <div style={{ textAlign:'center', padding:12, background:'var(--surface-alt)', borderRadius:12 }}>
                <Heart size={20} color="var(--danger)" style={{marginBottom:4}}/>
                <div style={{fontSize:'1.2rem', fontWeight:700, color:'var(--danger)'}}>{profile?.blood_type || '?'}</div>
                <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>Blood Type</div>
              </div>
              <div style={{ textAlign:'center', padding:12, background:'var(--surface-alt)', borderRadius:12 }}>
                <Weight size={20} color="var(--primary)" style={{marginBottom:4}}/>
                <div style={{fontSize:'1.2rem', fontWeight:700}}>{profile?.weight_kg || '—'} <span style={{fontSize:'0.7rem'}}>kg</span></div>
                <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>Weight</div>
              </div>
              <div style={{ textAlign:'center', padding:12, background:'var(--surface-alt)', borderRadius:12 }}>
                <Ruler size={20} color="var(--primary)" style={{marginBottom:4}}/>
                <div style={{fontSize:'1.2rem', fontWeight:700}}>{profile?.height_cm || '—'} <span style={{fontSize:'0.7rem'}}>cm</span></div>
                <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>Height</div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom:16 }}>
            <h4 className="card-title" style={{marginBottom:12}}>Allergies</h4>
            {allergies.length === 0 ? <p style={{color:'var(--text-muted)', fontSize:'0.9rem'}}>No allergies recorded</p> : (
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {allergies.map((a: string, i: number) => <span key={i} className="badge badge-expired">{a}</span>)}
              </div>
            )}
          </div>

          <div className="card">
            <h4 className="card-title" style={{marginBottom:12}}>Chronic Conditions</h4>
            {conditions.length === 0 ? <p style={{color:'var(--text-muted)', fontSize:'0.9rem'}}>No conditions recorded</p> : (
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {conditions.map((c: string, i: number) => <span key={i} className="badge badge-accent">{c}</span>)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
