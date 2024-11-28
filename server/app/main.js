const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

const app = express();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Use an environment variable for security

app.use(express.json());

// New user registration
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const password_hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password_hash,
      },
    });

    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    console.error('Error details:', error);
    res.status(400).json({ error: error.message });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error details:', error);
    res.status(400).json({ error: error.message });
  }
});

// Middleware to protect routes
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (error, user) => {
    if (error) return res.status(403).json({ error: 'Invalid or expired token' });

    req.user = user;
    next();
  });
}

// Protected route: Scan history (requires login)
app.get('/log', authenticateToken, async (req, res) => {
  try {
    const logs = await prisma.log.findMany();
    res.status(200).json({ message: 'Logs retrieved successfully', logs });
  } catch (error) {
    console.error('Error details:', error);
    res.status(400).json({ error: error.message });
  }
});

app.post('/scan', authenticateToken, async (req, res) => {
  const { url_or_ip } = req.body;

  try {
    const log = await prisma.log.create({
      data: { url_or_ip },
    });
    res.status(201).json({ message: 'Scan added successfully', log });
  } catch (error) {
    console.error('Error details:', error);
    res.status(400).json({ error: error.message });
  }
});

app.get('/test', (req, res) => {
  res.send('Server is working!');
});

app.get('/webappscan', (req, res) => {
  const { input } = req.body; // Extract input from request body
  console.log('Received input:', input);
  res.status(200).send({ message: `You entered: ${input}` });
});

app.post('/process-link', async (req, res) => {
  const { target } = req.body;

  try {
    const response = await fetch('http://scan-controller:8000/process-link/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ target: target }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json({
      message: `Processed link: ${target}`,
      fastapi_response: data,
    });
  } catch (error) {
    console.error('Error posting the link:', error);
    res.status(500).json({ error: 'Failed to process the link' });
  }
});

const PORT = process.env.PORTBACK || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});