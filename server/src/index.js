const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173'], credentials: true }));
app.use(express.json({ limit: '10mb' }));

async function start() {
  await initDatabase();

  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/prescriptions', require('./routes/prescriptions'));
  app.use('/api/pharmacy', require('./routes/pharmacy'));
  app.use('/api/drugs', require('./routes/drugs'));
  app.use('/api/reminders', require('./routes/reminders'));
  app.use('/api/admin', require('./routes/admin'));

  app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

  app.listen(PORT, () => {
    console.log(`\n🏥 Dawa Track API Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health\n`);
  });
}

start().catch(err => { console.error('Failed to start server:', err); process.exit(1); });
