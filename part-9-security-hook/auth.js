const express = require('express');
const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password123',
  database: 'users'
});

// Login endpoint with SQL injection vulnerability
async function login(req, res) {
  const { username, password } = req.body;

  // VULNERABLE: Direct string interpolation in SQL query
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      // VULNERABLE: Exposing sensitive user data in response
      res.json({
        success: true,
        user: results[0],
        token: Buffer.from(username + ':' + password).toString('base64')
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
}

// Password reset with command injection
async function resetPassword(req, res) {
  const { email } = req.body;

  // VULNERABLE: Command injection via email parameter
  const exec = require('child_process').exec;
  exec(`echo "Password reset for ${email}" | mail -s "Reset" ${email}`, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to send email' });
    }
    res.json({ success: true });
  });
}

module.exports = { login, resetPassword };
