import express, { Request, Response } from 'express';
import { exec } from 'child_process';
import fs from 'fs';

const app = express();
app.use(express.json());

// Hardcoded credentials - VULNERABILITY
const DB_PASSWORD = "super_secret_password_123";
const API_KEY = "sk-live-abcd1234567890xyz";

interface UserQuery {
  username: string;
  password: string;
}

// SQL Injection vulnerability
app.post('/login', (req: Request, res: Response) => {
  const { username, password }: UserQuery = req.body;

  // VULNERABLE: Direct string concatenation in SQL query
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

  // Simulated database query
  console.log(`Executing query: ${query}`);
  res.json({ message: 'Login attempted', query });
});

// Command Injection vulnerability
app.get('/ping', (req: Request, res: Response) => {
  const host = req.query.host as string;

  // VULNERABLE: User input directly passed to shell command
  exec(`ping -c 4 ${host}`, (error, stdout, stderr) => {
    if (error) {
      res.status(500).json({ error: stderr });
      return;
    }
    res.json({ output: stdout });
  });
});

// Path Traversal vulnerability
app.get('/file', (req: Request, res: Response) => {
  const filename = req.query.name as string;

  // VULNERABLE: User input directly used in file path
  const filepath = `./uploads/${filename}`;

  fs.readFile(filepath, 'utf8', (err, data) => {
    if (err) {
      res.status(404).json({ error: 'File not found' });
      return;
    }
    res.json({ content: data });
  });
});

// XSS vulnerability (server-side rendered)
app.get('/profile', (req: Request, res: Response) => {
  const name = req.query.name as string;

  // VULNERABLE: User input directly interpolated into HTML
  const html = `
    <html>
      <body>
        <h1>Welcome, ${name}!</h1>
        <p>Your profile page</p>
      </body>
    </html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// Insecure deserialization
app.post('/deserialize', (req: Request, res: Response) => {
  const serializedData = req.body.data;

  // VULNERABLE: Using eval to deserialize user input
  const userData = eval(`(${serializedData})`);

  res.json({ parsed: userData });
});

// JWT with weak secret
import jwt from 'jsonwebtoken';

const JWT_SECRET = "secret"; // VULNERABLE: Weak secret

app.post('/token', (req: Request, res: Response) => {
  const { userId } = req.body;

  const token = jwt.sign({ userId }, JWT_SECRET, { algorithm: 'HS256' });
  res.json({ token });
});

// NoSQL Injection vulnerability
app.post('/search', (req: Request, res: Response) => {
  const { filter } = req.body;

  // VULNERABLE: User input directly used in MongoDB query
  // This allows injection like { "$gt": "" } to bypass authentication
  const query = { username: filter };

  console.log('MongoDB query:', JSON.stringify(query));
  res.json({ query });
});

// Logging sensitive data
app.post('/payment', (req: Request, res: Response) => {
  const { creditCard, cvv, amount } = req.body;

  // VULNERABLE: Logging sensitive payment information
  console.log(`Processing payment: Card=${creditCard}, CVV=${cvv}, Amount=${amount}`);

  res.json({ status: 'processed' });
});

export default app;
