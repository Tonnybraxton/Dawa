const express = require('express');
const { getAll } = require('../db');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.get('/search', authenticateToken, (req, res) => {
  try {
    const q = req.query.q || '';
    res.json(getAll("SELECT * FROM drugs WHERE name LIKE ? OR code LIKE ? LIMIT 20", [`%${q}%`, `%${q}%`]));
  } catch (err) { res.status(500).json({ error: 'Search failed' }); }
});

router.get('/interactions', authenticateToken, (req, res) => {
  try {
    let codes = req.query.drugs || [];
    if (typeof codes === 'string') codes = [codes];
    if (codes.length < 2) return res.json([]);
    const all = getAll('SELECT * FROM drug_interactions');
    const results = all.filter(i => codes.includes(i.drug_a_code) && codes.includes(i.drug_b_code));
    res.json(results);
  } catch (err) { res.status(500).json({ error: 'Check failed' }); }
});

router.get('/', authenticateToken, (req, res) => {
  try { res.json(getAll('SELECT * FROM drugs ORDER BY name')); }
  catch (err) { res.status(500).json({ error: 'Failed' }); }
});

module.exports = router;
