const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Use an environment variable for security

app.use(express.json());

// New user registration
app.post('/users', async (req, res) => {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});