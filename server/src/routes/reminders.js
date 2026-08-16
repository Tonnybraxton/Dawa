const express = require('express');
const { getOne, getAll, runSql, saveDb } = require('../db');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  try { res.json(getAll('SELECT * FROM medication_reminders WHERE patient_id = ? ORDER BY reminder_time', [req.user.id])); }
  catch (err) { res.status(500).json({ error: 'Failed' }); }
});

router.post('/', authenticateToken, (req, res) => {
  try {
    const { prescription_item_id, drug_name, reminder_time, repeat_days, channel } = req.body;
    const r = runSql('INSERT INTO medication_reminders (patient_id,prescription_item_id,drug_name,reminder_time,repeat_days,channel) VALUES (?,?,?,?,?,?)',
      [req.user.id, prescription_item_id||null, drug_name, reminder_time, JSON.stringify(repeat_days||['Mon','Tue','Wed','Thu','Fri','Sat','Sun']), channel||'push']);
    saveDb();
    res.status(201).json(getOne('SELECT * FROM medication_reminders WHERE id = ?', [r.lastInsertRowid]));
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

router.patch('/:id', authenticateToken, (req, res) => {
  try {
    const { is_active, reminder_time, channel } = req.body;
    const id = parseInt(req.params.id);
    if (is_active !== undefined) runSql('UPDATE medication_reminders SET is_active = ? WHERE id = ? AND patient_id = ?', [is_active?1:0, id, req.user.id]);
    if (reminder_time) runSql('UPDATE medication_reminders SET reminder_time = ? WHERE id = ? AND patient_id = ?', [reminder_time, id, req.user.id]);
    if (channel) runSql('UPDATE medication_reminders SET channel = ? WHERE id = ? AND patient_id = ?', [channel, id, req.user.id]);
    saveDb();
    res.json(getOne('SELECT * FROM medication_reminders WHERE id = ?', [id]));
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

router.delete('/:id', authenticateToken, (req, res) => {
  try { runSql('DELETE FROM medication_reminders WHERE id = ? AND patient_id = ?', [parseInt(req.params.id), req.user.id]); saveDb(); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ error: 'Failed' }); }
});

module.exports = router;
