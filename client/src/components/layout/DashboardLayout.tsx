import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard, FileText, Clock, MapPin, AlertTriangle, Users,
  Package, QrCode, ClipboardList, BarChart3, Shield, Database, ScrollText,
  LogOut, Bell, Moon, Sun, Menu, X, Pill, Heart
} from 'lucide-react';

const roleMenus: Record<string, { label: string; path: string; icon: any }[]> = {
  patient: [
    { label: 'Dashboard', path: '/patient', icon: LayoutDashboard },
    { label: 'My Prescriptions', path: '/patient/prescriptions', icon: FileText },
    { label: 'Reminders', path: '/patient/reminders', icon: Clock },
    { label: 'Pharmacy Locator', path: '/patient/pharmacies', icon: MapPin },
    { label: 'Interaction Checker', path: '/patient/interactions', icon: AlertTriangle },
    { label: 'Health Profile', path: '/patient/profile', icon: Heart },
  ],
  doctor: [
    { label: 'Dashboard', path: '/doctor', icon: LayoutDashboard },
    { label: 'Issue Prescription', path: '/doctor/prescribe', icon: FileText },
    { label: 'My Patients', path: '/doctor/patients', icon: Users },
    { label: 'Prescription History', path: '/doctor/prescriptions', icon: ClipboardList },
  ],
  pharmacist: [
    { label: 'Dispensing Station', path: '/pharmacy', icon: QrCode },
    { label: 'Inventory', path: '/pharmacy/inventory', icon: Package },
    { label: 'Dispensing Log', path: '/pharmacy/log', icon: ClipboardList },
  ],
  caregiver: [
    { label: 'Dashboard', path: '/caregiver', icon: LayoutDashboard },
    { label: 'Prescriptions', path: '/caregiver/prescriptions', icon: FileText },
  ],
  admin: [
    { label: 'Analytics', path: '/admin', icon: BarChart3 },
    { label: 'User Management', path: '/admin/users', icon: Shield },
    { label: 'Drug Database', path: '/admin/drugs', icon: Database },
    { label: 'Audit Logs', path: '/admin/audit', icon: ScrollText },
  ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const menu = roleMenus[user?.role || 'patient'] || [];

  useEffect(() => {
    const theme = localStorage.getItem('dawatrack_theme');
    if (theme === 'dark') { setDarkMode(true); document.documentElement.setAttribute('data-theme', 'dark'); }
  }, []);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : '');
    localStorage.setItem('dawatrack_theme', next ? 'dark' : 'light');
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?';
  const roleLabel = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '';

  return (
    <div className="page-shell">
      {sidebarOpen && <div className="modal-overlay" style={{zIndex: 35}} onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon"><Pill size={20} /></div>
          <h2>Dawa<span>Track</span></h2>
          <button className="btn-icon" style={{marginLeft:'auto', display: sidebarOpen ? 'flex' : 'none'}} onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>
        <nav className="sidebar-nav">
          {menu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div style={{display:'flex', alignItems:'center', gap: 10, marginBottom: 12}}>
            <div className="avatar" style={{background: 'var(--gradient-primary)'}}>{initials}</div>
            <div>
              <div style={{fontWeight:600, fontSize:'0.85rem'}}>{user?.full_name}</div>
              <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>{roleLabel}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{width:'100%', justifyContent:'flex-start'}}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <button className="btn-icon mobile-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={22} /></button>
            <div>
              <div style={{fontWeight:600, fontSize:'0.9rem'}}>Welcome back, {user?.full_name?.split(' ')[0]} 👋</div>
              <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>{new Date().toLocaleDateString('en-KE', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</div>
            </div>
          </div>
          <div className="topbar-right">
            <button className="btn-icon" onClick={toggleDark} title="Toggle dark mode">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="btn-icon" style={{position:'relative'}}>
              <Bell size={20} />
              <span style={{position:'absolute', top:4, right:4, width:8, height:8, background:'var(--danger)', borderRadius:'50%'}} />
            </button>
          </div>
        </div>
        <div className="page-content fade-in">
          {children}
        </div>
      </div>
    </div>
  );
}
