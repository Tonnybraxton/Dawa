const express = require('express');
const { getOne, getAll, runSql, saveDb } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

router.get('/analytics', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const totalUsers = getAll('SELECT COUNT(*) as count FROM users')[0]?.count || 0;
    const byRole = getAll("SELECT role, COUNT(*) as count FROM users GROUP BY role");
    const totalRx = getAll('SELECT COUNT(*) as count FROM prescriptions')[0]?.count || 0;
    const activeRx = getAll("SELECT COUNT(*) as count FROM prescriptions WHERE status='active'")[0]?.count || 0;
    const dispensedRx = getAll("SELECT COUNT(*) as count FROM prescriptions WHERE status='dispensed'")[0]?.count || 0;
    const topDrugs = getAll("SELECT drug_name, COUNT(*) as count FROM prescription_items GROUP BY drug_name ORDER BY count DESC LIMIT 10");
    const recentRx = getAll("SELECT date(created_at) as date, COUNT(*) as count FROM prescriptions GROUP BY date(created_at) ORDER BY date DESC LIMIT 30");
    res.json({ totalUsers, byRole, totalRx, activeRx, dispensedRx, topDrugs, recentRx });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed' }); }
});

router.get('/users', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const { role, status } = req.query;
    let users = getAll('SELECT id,role,full_name,email,phone,is_verified,created_at FROM users ORDER BY created_at DESC');
    if (role) users = users.filter(u => u.role === role);
    if (status === 'pending') users = users.filter(u => !u.is_verified);
    if (status === 'verified') users = users.filter(u => u.is_verified);
    res.json(users);
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

router.patch('/users/:id/verify', authenticateToken, requireRole('admin'), (req, res) => {
  try { runSql('UPDATE users SET is_verified = 1 WHERE id = ?', [parseInt(req.params.id)]); saveDb(); res.json(getOne('SELECT id,role,full_name,email,is_verified FROM users WHERE id = ?', [parseInt(req.params.id)])); }
  catch (err) { res.status(500).json({ error: 'Failed' }); }
});

router.patch('/users/:id/suspend', authenticateToken, requireRole('admin'), (req, res) => {
  try { runSql('UPDATE users SET is_verified = 0 WHERE id = ?', [parseInt(req.params.id)]); saveDb(); res.json({ message: 'Suspended' }); }
  catch (err) { res.status(500).json({ error: 'Failed' }); }
});

router.get('/audit', authenticateToken, requireRole('admin'), (req, res) => {
  try { res.json(getAll('SELECT al.*, u.full_name, u.role FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id ORDER BY al.timestamp DESC LIMIT 100')); }
  catch (err) { res.status(500).json({ error: 'Failed' }); }
});

router.get('/notifications', authenticateToken, (req, res) => {
  try { res.json(getAll('SELECT * FROM notifications WHERE user_id = ? ORDER BY sent_at DESC LIMIT 20', [req.user.id])); }
  catch (err) { res.status(500).json({ error: 'Failed' }); }
});

router.patch('/notifications/:id/read', authenticateToken, (req, res) => {
  try { runSql('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [parseInt(req.params.id), req.user.id]); saveDb(); res.json({ message: 'Read' }); }
  catch (err) { res.status(500).json({ error: 'Failed' }); }
});

router.get('/patients', authenticateToken, requireRole('doctor','admin'), (req, res) => {
  try {
    const q = req.query.q || '';
    let patients = getAll("SELECT id,full_name,email,phone,national_id FROM users WHERE role='patient'");
    if (q) patients = patients.filter(p => p.full_name.toLowerCase().includes(q.toLowerCase()) || (p.email && p.email.includes(q)) || (p.national_id && p.national_id.includes(q)));
    res.json(patients.slice(0, 20));
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

module.exports = router;
