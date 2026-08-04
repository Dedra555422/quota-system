const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(bodyParser.json());

// DB (data.db будет создан рядом с index.js)
const db = new sqlite3.Database(path.join(__dirname, 'data.db'));
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fio TEXT NOT NULL,
    position TEXT NOT NULL,
    quota REAL DEFAULT 0
  )`);
});

// API: list
app.get('/api/employees', (req, res) => {
  db.all('SELECT * FROM employees ORDER BY id', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// API: create
app.post('/api/employees', (req, res) => {
  const { fio, position, quota } = req.body;
  db.run('INSERT INTO employees (fio, position, quota) VALUES (?, ?, ?)', [fio, position, quota || 0], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    db.get('SELECT * FROM employees WHERE id = ?', [this.lastID], (err2, row) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.status(201).json(row);
    });
  });
});

// API: update
app.put('/api/employees/:id', (req, res) => {
  const { fio, position, quota } = req.body;
  const id = req.params.id;
  db.run('UPDATE employees SET fio = ?, position = ?, quota = ? WHERE id = ?', [fio, position, quota || 0, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: this.changes });
  });
});

// API: delete
app.delete('/api/employees/:id', (req, res) => {
  db.run('DELETE FROM employees WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// API: quota summary (пример: суммарная и средняя квота)
app.get('/api/quota-summary', (req, res) => {
  db.get('SELECT COUNT(*) AS count, SUM(quota) AS total_quota, AVG(quota) AS avg_quota FROM employees', [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
