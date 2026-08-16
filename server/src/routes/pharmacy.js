const express = require('express');
const { getOne, getAll, runSql, saveDb } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

router.get('/inventory', authenticateToken, requireRole('pharmacist','admin'), (req, res) => {
  try { res.json(getAll('SELECT * FROM drug_inventory WHERE pharmacist_id = ? ORDER BY drug_name', [req.user.id])); }
  catch (err) { res.status(500).json({ error: 'Failed' }); }
});

router.patch('/inventory/:id', authenticateToken, requireRole('pharmacist'), (req, res) => {
  try {
    const { quantity, price, expiry_date } = req.body;
    if (quantity !== undefined) runSql('UPDATE drug_inventory SET quantity = ? WHERE id = ? AND pharmacist_id = ?', [quantity, parseInt(req.params.id), req.user.id]);
    if (price !== undefined) runSql('UPDATE drug_inventory SET price = ? WHERE id = ? AND pharmacist_id = ?', [price, parseInt(req.params.id), req.user.id]);
    if (expiry_date) runSql('UPDATE drug_inventory SET expiry_date = ? WHERE id = ? AND pharmacist_id = ?', [expiry_date, parseInt(req.params.id), req.user.id]);
    saveDb();
    res.json(getOne('SELECT * FROM drug_inventory WHERE id = ?', [parseInt(req.params.id)]));
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

router.post('/inventory', authenticateToken, requireRole('pharmacist'), (req, res) => {
  try {
    const { drug_code, drug_name, quantity, price, expiry_date, reorder_threshold } = req.body;
    const r = runSql('INSERT INTO drug_inventory (pharmacist_id,drug_code,drug_name,quantity,price,expiry_date,reorder_threshold) VALUES (?,?,?,?,?,?,?)', [req.user.id, drug_code||null, drug_name, quantity||0, price||0, expiry_date||null, reorder_threshold||10]);
    saveDb();
    res.status(201).json(getOne('SELECT * FROM drug_inventory WHERE id = ?', [r.lastInsertRowid]));
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

router.post('/dispense/:code', authenticateToken, requireRole('pharmacist'), (req, res) => {
  try {
    const rx = getOne('SELECT * FROM prescriptions WHERE prescription_code = ?', [req.params.code]);
    if (!rx) return res.status(404).json({ error: 'Prescription not found' });
    if (rx.status !== 'active') return res.status(400).json({ error: `Prescription is ${rx.status}` });
    const items = getAll('SELECT * FROM prescription_items WHERE prescription_id = ?', [rx.id]);
    runSql('INSERT INTO dispensing_records (prescription_id,pharmacist_id,items_dispensed,notes) VALUES (?,?,?,?)', [rx.id, req.user.id, JSON.stringify(items.map(i=>`${i.drug_name} ${i.dosage}${i.dosage_unit}`)), req.body.notes||null]);
    runSql("UPDATE prescriptions SET status = 'dispensed' WHERE id = ?", [rx.id]);
    runSql("INSERT INTO notifications (user_id,type,title,body) VALUES (?,'dispensed','Prescription Dispensed',?)", [rx.patient_id, `Your prescription ${rx.prescription_code} has been dispensed.`]);
    saveDb();
    res.json({ message: 'Dispensed successfully', prescription: { ...rx, status: 'dispensed', items } });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to dispense' }); }
});

router.get('/log', authenticateToken, requireRole('pharmacist','admin'), (req, res) => {
  try { res.json(getAll('SELECT dr.*, p.prescription_code, u.full_name as patient_name FROM dispensing_records dr JOIN prescriptions p ON dr.prescription_id = p.id JOIN users u ON p.patient_id = u.id WHERE dr.pharmacist_id = ? ORDER BY dr.dispensed_at DESC', [req.user.id])); }
  catch (err) { res.status(500).json({ error: 'Failed' }); }
});

router.get('/nearby', authenticateToken, (req, res) => {
  try {
    const pharmas = getAll('SELECT pp.*, u.full_name as pharmacist_name FROM pharmacist_profiles pp JOIN users u ON pp.user_id = u.id');
    const result = pharmas.map(p => ({ id: p.id, name: p.pharmacy_name, address: p.pharmacy_address, phone: p.pharmacy_phone, lat: p.pharmacy_location_lat, lng: p.pharmacy_location_lng, hours: p.opening_hours, pharmacist: p.pharmacist_name, isOpen: true }));
    result.push({ id:100, name:'Nairobi West Pharmacy', address:'Langata Road, Nairobi West', phone:'+254722111222', lat:-1.31, lng:36.815, hours:'7:00 AM - 10:00 PM', isOpen:true });
    result.push({ id:101, name:'Westlands MedShop', address:'Westlands Road', phone:'+254733222333', lat:-1.2667, lng:36.8117, hours:'8:00 AM - 8:00 PM', isOpen:false });
    result.push({ id:102, name:'Kilimani Health Pharmacy', address:'Argwings Kodhek Road', phone:'+254744333444', lat:-1.29, lng:36.785, hours:'24 Hours', isOpen:true });
    res.json(result);
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

router.get('/stock/:drugCode', authenticateToken, (req, res) => {
  try { res.json(getAll('SELECT di.*, pp.pharmacy_name, pp.pharmacy_address FROM drug_inventory di JOIN pharmacist_profiles pp ON di.pharmacist_id = pp.user_id WHERE di.drug_code = ? AND di.quantity > 0', [req.params.drugCode])); }
  catch (err) { res.status(500).json({ error: 'Failed' }); }
});

module.exports = router;
