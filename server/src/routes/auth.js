const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getOne, getAll, runSql, saveDb } = require('../db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

router.post('/register', (req, res) => {
  try {
    const { full_name, email, phone, password, role, national_id, nhif_number, kmpdc_number, ppb_license, specialization, hospital_name, pharmacy_name } = req.body;
    if (!full_name || !email || !password || !role) return res.status(400).json({ error: 'Full name, email, password, and role are required' });
    const existing = getOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const password_hash = bcrypt.hashSync(password, 10);
    const is_verified = (role === 'patient' || role === 'caregiver') ? 1 : 0;
    const result = runSql('INSERT INTO users (role,full_name,national_id,email,phone,password_hash,nhif_number,is_verified) VALUES (?,?,?,?,?,?,?,?)', [role, full_name, national_id||null, email, phone||null, password_hash, nhif_number||null, is_verified]);
    const userId = result.lastInsertRowid;
    if (role === 'patient') runSql('INSERT INTO patient_profiles (user_id) VALUES (?)', [userId]);
    else if (role === 'doctor') runSql('INSERT INTO doctor_profiles (user_id,kmpdc_number,specialization,hospital_name) VALUES (?,?,?,?)', [userId, kmpdc_number||null, specialization||null, hospital_name||null]);
    else if (role === 'pharmacist') runSql('INSERT INTO pharmacist_profiles (user_id,ppb_license,pharmacy_name) VALUES (?,?,?)', [userId, ppb_license||null, pharmacy_name||null]);
    saveDb();
    const token = jwt.sign({ id: userId, role, email }, JWT_SECRET, { expiresIn: '7d' });
    const user = getOne('SELECT id,role,full_name,email,phone,is_verified,created_at FROM users WHERE id = ?', [userId]);
    res.status(201).json({ token, user });
  } catch (err) { console.error('Register error:', err); res.status(500).json({ error: 'Registration failed' }); }
});

router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    const user = getOne('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (!bcrypt.compareSync(password, user.password_hash)) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const { password_hash, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) { console.error('Login error:', err); res.status(500).json({ error: 'Login failed' }); }
});

router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = getOne('SELECT id,role,full_name,national_id,email,phone,nhif_number,is_verified,created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    let profile = null;
    if (user.role === 'patient') profile = getOne('SELECT * FROM patient_profiles WHERE user_id = ?', [user.id]);
    else if (user.role === 'doctor') profile = getOne('SELECT * FROM doctor_profiles WHERE user_id = ?', [user.id]);
    else if (user.role === 'pharmacist') profile = getOne('SELECT * FROM pharmacist_profiles WHERE user_id = ?', [user.id]);
    res.json({ ...user, profile });
  } catch (err) { res.status(500).json({ error: 'Failed to get user' }); }
});

module.exports = router;
