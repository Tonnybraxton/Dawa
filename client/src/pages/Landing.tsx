import { Link } from 'react-router-dom';
import { FileText, Bell, MapPin, AlertTriangle, Shield, Heart, ArrowRight, Pill } from 'lucide-react';

const features = [
  { icon: FileText, title: 'Digital Prescriptions', desc: 'Doctors issue QR-coded digital prescriptions. No more lost paper scripts.' },
  { icon: Bell, title: 'Smart Reminders', desc: 'Never miss a dose with SMS, WhatsApp & push notification reminders.' },
  { icon: MapPin, title: 'Pharmacy Locator', desc: 'Find nearby pharmacies with your medicine in stock. Real-time availability.' },
  { icon: AlertTriangle, title: 'Drug Interaction Alerts', desc: 'Automatic detection of dangerous drug combinations before dispensing.' },
  { icon: Shield, title: 'NHIF-Ready', desc: 'Export prescriptions in NHIF-compatible format for insurance claims.' },
  { icon: Heart, title: 'Adherence Tracking', desc: 'Monitor medication adherence scores and refill compliance over time.' },
];

const steps = [
  { num: '01', title: 'Doctor Prescribes', desc: 'Your doctor creates a digital prescription with QR code and sends it to you via SMS.' },
  { num: '02', title: 'You Track', desc: 'View your prescriptions, set reminders, and monitor your medication schedule.' },
  { num: '03', title: 'Pharmacy Dispenses', desc: 'Walk into any pharmacy, show your QR code, and pick up your medicine.' },
];

const stats = [
  { value: '5,000+', label: 'Patients Tracked' },
  { value: '120+', label: 'Pharmacies on Network' },
  { value: '15,000+', label: 'Prescriptions Managed' },
  { value: '98%', label: 'Adherence Rate' },
];

export default function Landing() {
  return (
    <div style={{ background: 'var(--surface)' }}>
      {/* Navbar */}
      <nav style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 5%', maxWidth:1200, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:40, height:40, background:'var(--gradient-primary)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}><Pill size={22} /></div>
          <span style={{ fontSize:'1.3rem', fontWeight:700, color:'var(--primary)' }}>Dawa<span style={{color:'var(--accent)'}}>Track</span></span>
        </div>
        <div style={{ display:'flex', gap:12 }}>
          <Link to="/login" className="btn btn-ghost">Sign In</Link>
          <Link to="/register" className="btn btn-primary">Get Started <ArrowRight size={16}/></Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background:'var(--gradient-hero)', padding:'80px 5% 100px', textAlign:'center', color:'#fff', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, right:0, width:400, height:400, background:'radial-gradient(circle, rgba(245,166,35,0.15) 0%, transparent 70%)' }} />
        <div style={{ position:'absolute', bottom:0, left:0, width:300, height:300, background:'radial-gradient(circle, rgba(26,107,90,0.3) 0%, transparent 70%)' }} />
        <div style={{ maxWidth:700, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.1)', padding:'8px 16px', borderRadius:50, marginBottom:24, fontSize:'0.85rem', backdropFilter:'blur(10px)' }}>
            <span style={{background:'var(--accent)', width:8, height:8, borderRadius:'50%', display:'inline-block'}} />
            Trusted by healthcare providers across Kenya
          </div>
          <h1 style={{ fontSize:'3.2rem', fontWeight:800, lineHeight:1.1, marginBottom:20 }}>
            Your Prescription,<br />
            <span style={{color:'var(--accent)'}}>Always on Track</span>
          </h1>
          <p style={{ fontSize:'1.15rem', opacity:0.85, maxWidth:550, margin:'0 auto 36px', lineHeight:1.7 }}>
            A comprehensive medical prescription tracking platform connecting patients, doctors, and pharmacists across Kenya.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/register" className="btn btn-accent btn-lg">Start Tracking Free <ArrowRight size={18}/></Link>
            <Link to="/login" className="btn btn-lg" style={{background:'rgba(255,255,255,0.15)', color:'#fff', backdropFilter:'blur(10px)'}}>Sign In</Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ maxWidth:1000, margin:'-50px auto 0', padding:'0 5%', position:'relative', zIndex:2 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:1, background:'var(--border)', borderRadius:20, overflow:'hidden', boxShadow:'var(--shadow-xl)' }}>
          {stats.map((s,i) => (
            <div key={i} style={{ background:'var(--surface)', padding:'28px 24px', textAlign:'center' }}>
              <div style={{ fontSize:'2rem', fontWeight:800, color:'var(--primary)' }}>{s.value}</div>
              <div style={{ fontSize:'0.85rem', color:'var(--text-muted)', marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth:1100, margin:'80px auto', padding:'0 5%' }}>
        <h2 style={{ textAlign:'center', fontSize:'2rem', marginBottom:8 }}>Everything You Need to <span style={{color:'var(--accent)'}}>Stay on Track</span></h2>
        <p style={{ textAlign:'center', color:'var(--text-muted)', marginBottom:48, maxWidth:500, margin:'0 auto 48px' }}>Built for Kenya's healthcare ecosystem with NHIF integration and Africa's Talking SMS.</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:24 }}>
          {features.map((f, i) => (
            <div key={i} className="card" style={{ padding:28, cursor:'default' }}>
              <div style={{ width:48, height:48, borderRadius:14, background:'rgba(10,61,61,0.08)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16, color:'var(--primary)' }}>
                <f.icon size={24} />
              </div>
              <h4 style={{ marginBottom:8 }}>{f.title}</h4>
              <p style={{ color:'var(--text-muted)', fontSize:'0.9rem', lineHeight:1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ background:'var(--surface-alt)', padding:'80px 5%' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <h2 style={{ textAlign:'center', marginBottom:48 }}>How <span style={{color:'var(--accent)'}}>Dawa Track</span> Works</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:32 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ textAlign:'center' }}>
                <div style={{ width:64, height:64, borderRadius:'50%', background:'var(--gradient-primary)', color:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', fontWeight:800, margin:'0 auto 16px', fontFamily:'var(--font-mono)' }}>{s.num}</div>
                <h4 style={{ marginBottom:8 }}>{s.title}</h4>
                <p style={{ color:'var(--text-muted)', fontSize:'0.9rem' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:'80px 5%', textAlign:'center' }}>
        <h2 style={{ marginBottom:16 }}>Ready to Get Started?</h2>
        <p style={{ color:'var(--text-muted)', marginBottom:32 }}>Join thousands of patients and healthcare providers on Dawa Track.</p>
        <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
          <Link to="/register?role=patient" className="btn btn-primary btn-lg">Register as Patient</Link>
          <Link to="/register?role=doctor" className="btn btn-outline btn-lg">Register as Doctor</Link>
          <Link to="/register?role=pharmacist" className="btn btn-outline btn-lg">Register as Pharmacist</Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background:'var(--primary)', color:'rgba(255,255,255,0.7)', padding:'40px 5%', textAlign:'center' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:16 }}>
          <Pill size={20} color="var(--accent)" />
          <span style={{ color:'#fff', fontWeight:700, fontSize:'1.1rem' }}>Dawa<span style={{color:'var(--accent)'}}>Track</span></span>
        </div>
        <p style={{ fontSize:'0.85rem', marginBottom:8 }}>Trusted by KMPDC, PPB & NHIF-compliant healthcare providers.</p>
        <p style={{ fontSize:'0.8rem', opacity:0.6 }}>© {new Date().getFullYear()} Dawa Track. Built for Kenya 🇰🇪</p>
      </footer>
    </div>
  );
}
