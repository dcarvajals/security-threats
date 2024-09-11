const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 8080;
const { execFile } = require('child_process'); // Mejora de seguridad

app.get('/check-updates', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  const appVersionFile = req.query.versionFile;
  if (!appVersionFile) {
    return res.status(400).send({ error: 'versionFile is required' });
  }
  const sanitizedFile = appVersionFile.replace(/[^a-zA-Z0-9_-]/g, ''); // Sanitizar entrada
  execFile('cat', [`${sanitizedFile}.txt`], (err, output) => {
    if (err) {
      return res.status(500).send({ error: 'Error reading version file' });
    }
    res.send({ version: output.trim() });
  });
});

const db = new sqlite3.Database('server.db');

app.get('/login', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  const { username: myUser, password: myPassword } = req.query;
  if (!myUser || !myPassword) {
    return res.status(400).send({ error: 'username and password are required' });
  }

  const sql = `SELECT * FROM users WHERE username = ? AND password = ?`; // Prepared statements
  db.get(sql, [myUser, myPassword], (err, row) => {
    if (err) {
      return res.status(500).send({ error: 'Database error' });
    }
    if (!row) {
      return res.status(401).send({ error: 'Invalid username or password' });
    }
    res.send(row);
  });
});

app.get('/messages', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  const myUser = req.query.userId;
  if (!myUser) {
    return res.status(400).send({ error: 'userId is required' });
  }

  const sql = `SELECT * FROM messages WHERE user_id = ?`; // Prepared statements
  db.all(sql, [myUser], (err, rows) => {
    if (err) {
      return res.status(500).send({ error: 'Database error' });
    }
    res.send(rows);
  });
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
