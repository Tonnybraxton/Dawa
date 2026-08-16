const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getOne, getAll, runSql, saveDb } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  try {
    const { role, id } = req.user;
    const { status } = req.query;
    let prescriptions = [];
    if (role === 'patient') {
      let sql = 'SELECT p.*, u.full_name as doctor_name FROM prescriptions p JOIN users u ON p.doctor_id = u.id WHERE p.patient_id = ?';
      const params = [id];
      if (status) { sql += ' AND p.status = ?'; params.push(status); }
      sql += ' ORDER BY p.created_at DESC';
      prescriptions = getAll(sql, params);
    } else if (role === 'doctor') {
      let sql = 'SELECT p.*, u.full_name as patient_name FROM prescriptions p JOIN users u ON p.patient_id = u.id WHERE p.doctor_id = ?';
      const params = [id];
      if (status) { sql += ' AND p.status = ?'; params.push(status); }
      sql += ' ORDER BY p.created_at DESC';
      prescriptions = getAll(sql, params);
    } else if (role === 'pharmacist' || role === 'admin') {
      prescriptions = getAll('SELECT p.*, u.full_name as patient_name, d.full_name as doctor_name FROM prescriptions p JOIN users u ON p.patient_id = u.id JOIN users d ON p.doctor_id = d.id ORDER BY p.created_at DESC LIMIT 50');
    } else if (role === 'caregiver') {
      prescriptions = getAll('SELECT p.*, u.full_name as patient_name, d.full_name as doctor_name FROM prescriptions p JOIN users u ON p.patient_id = u.id JOIN users d ON p.doctor_id = d.id JOIN caregiver_links cl ON cl.patient_user_id = p.patient_id WHERE cl.caregiver_user_id = ? AND cl.status = \'active\' ORDER BY p.created_at DESC', [id]);
    }
    for (const rx of prescriptions) {
      rx.items = getAll('SELECT * FROM prescription_items WHERE prescription_id = ?', [rx.id]);
    }
    res.json(prescriptions);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to get prescriptions' }); }
});

router.get('/code/:code', authenticateToken, (req, res) => {
  try {
    const rx = getOne('SELECT p.*, u.full_name as patient_name, u.phone as patient_phone, d.full_name as doctor_name FROM prescriptions p JOIN users u ON p.patient_id = u.id JOIN users d ON p.doctor_id = d.id WHERE p.prescription_code = ?', [req.params.code]);
    if (!rx) return res.status(404).json({ error: 'Prescription not found' });
    rx.items = getAll('SELECT * FROM prescription_items WHERE prescription_id = ?', [rx.id]);
    rx.dispensing_records = getAll('SELECT dr.*, u.full_name as pharmacist_name FROM dispensing_records dr JOIN users u ON dr.pharmacist_id = u.id WHERE dr.prescription_id = ?', [rx.id]);
    res.json(rx);
  } catch (err) { res.status(500).json({ error: 'Failed to get prescription' }); }
});

router.get('/:id', authenticateToken, (req, res) => {
  try {
    const rx = getOne('SELECT p.*, u.full_name as patient_name, u.phone as patient_phone, d.full_name as doctor_name FROM prescriptions p JOIN users u ON p.patient_id = u.id JOIN users d ON p.doctor_id = d.id WHERE p.id = ?', [parseInt(req.params.id)]);
    if (!rx) return res.status(404).json({ error: 'Prescription not found' });
    rx.items = getAll('SELECT * FROM prescription_items WHERE prescription_id = ?', [rx.id]);
    rx.dispensing_records = getAll('SELECT dr.*, u.full_name as pharmacist_name FROM dispensing_records dr JOIN users u ON dr.pharmacist_id = u.id WHERE dr.prescription_id = ?', [rx.id]);
    res.json(rx);
  } catch (err) { res.status(500).json({ error: 'Failed to get prescription' }); }
});

router.post('/', authenticateToken, requireRole('doctor'), (req, res) => {
  try {
    const { patient_id, expiry_date, notes, diagnosis_code, diagnosis_text, items } = req.body;
    if (!patient_id || !items || items.length === 0) return res.status(400).json({ error: 'Patient and at least one drug required' });
    const code = uuidv4().substring(0, 8).toUpperCase();
    const expiry = expiry_date || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0];
    const result = runSql('INSERT INTO prescriptions (prescription_code,doctor_id,patient_id,expiry_date,notes,diagnosis_code,diagnosis_text) VALUES (?,?,?,?,?,?,?)', [code, req.user.id, patient_id, expiry, notes||null, diagnosis_code||null, diagnosis_text||null]);
    const rxId = result.lastInsertRowid;
    for (const item of items) {
      runSql('INSERT INTO prescription_items (prescription_id,drug_name,drug_code,dosage,dosage_unit,frequency,duration_days,refills_allowed,instructions,route) VALUES (?,?,?,?,?,?,?,?,?,?)', [rxId, item.drug_name, item.drug_code||null, item.dosage, item.dosage_unit||'mg', item.frequency, item.duration_days||30, item.refills_allowed||0, item.instructions||null, item.route||'oral']);
    }
    runSql("INSERT INTO notifications (user_id,type,title,body) VALUES (?,'prescription','New Prescription',?)", [patient_id, `New prescription issued. Code: ${code}`]);
    saveDb();
    const prescription = getOne('SELECT * FROM prescriptions WHERE id = ?', [rxId]);
    prescription.items = getAll('SELECT * FROM prescription_items WHERE prescription_id = ?', [rxId]);
    res.status(201).json(prescription);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to create prescription' }); }
});

router.patch('/:id/status', authenticateToken, (req, res) => {
  try {
    const { status } = req.body;
    runSql('UPDATE prescriptions SET status = ? WHERE id = ?', [status, parseInt(req.params.id)]);
    saveDb();
    res.json(getOne('SELECT * FROM prescriptions WHERE id = ?', [parseInt(req.params.id)]));
  } catch (err) { res.status(500).json({ error: 'Failed to update' }); }
});

module.exports = router;
