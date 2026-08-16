import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { BarChart3, Users, FileText, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0A3D3D', '#1A6B5A', '#F5A623', '#E53E3E', '#38A169'];

export default function AdminAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.getAnalytics().then(setData).catch(console.error).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!data) return <div className="card empty-state"><BarChart3 size={48}/><h4>No data available</h4></div>;

  return (
    <div className="slide-up">
      <h1 className="page-title">Platform Analytics</h1>
      <p className="page-subtitle">Overview of Dawa Track platform metrics</p>

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon" style={{ background:'rgba(10,61,61,0.1)', color:'var(--primary)' }}><Users size={22}/></div>
          <div className="stat-value">{data.totalUsers}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background:'rgba(245,166,35,0.1)', color:'var(--accent)' }}><FileText size={22}/></div>
          <div className="stat-value">{data.totalRx}</div>
          <div className="stat-label">Total Prescriptions</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background:'rgba(56,161,105,0.1)', color:'var(--success)' }}><TrendingUp size={22}/></div>
          <div className="stat-value">{data.activeRx}</div>
          <div className="stat-label">Active Prescriptions</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background:'rgba(66,153,225,0.1)', color:'#4299E1' }}><FileText size={22}/></div>
          <div className="stat-value">{data.dispensedRx}</div>
          <div className="stat-label">Dispensed</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom:24 }}>
        <div className="card">
          <h4 className="card-title" style={{ marginBottom:16 }}>Users by Role</h4>
          <div style={{ height:250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.byRole} dataKey="count" nameKey="role" cx="50%" cy="50%" outerRadius={90} label={({ role, count }: any) => `${role}: ${count}`}>
                  {data.byRole.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                </Pie>
                <Tooltip/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h4 className="card-title" style={{ marginBottom:16 }}>Top Prescribed Drugs</h4>
          <div style={{ height:250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topDrugs} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                <XAxis type="number"/>
                <YAxis dataKey="drug_name" type="category" width={100} tick={{fontSize:12}}/>
                <Tooltip/>
                <Bar dataKey="count" fill="#0A3D3D" radius={[0,6,6,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
