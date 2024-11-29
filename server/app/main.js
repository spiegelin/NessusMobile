const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

const app = express();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Use an environment variable for security

app.use(express.json());

//Test route

app.get('/test', (req, res) => {
  res.send('Server is working!');
});

//Seccion de inicio de usuarios

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
      { userId: user.user_id, email: user.email },
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

  jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ error: 'Invalid or expired token' });

      // Attach userId from the token to the request
      req.user = { userId: user.userId };
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


app.get('/webappscan', (req, res) => {
  const { input } = req.body; // Extract input from request body
  console.log('Received input:', input);
  res.status(200).send({ message: `You entered: ${input}` });
});

//procesar el link para SOCIALS

app.post('/process-link', authenticateToken, async (req, res) => {
  const { target, scanCategory } = req.body;

  try {
    // Ensure userId is available from the token
    const userId = req.user?.userId; // Extract userId from token

    if (!userId) {
      return res.status(400).json({ error: 'User ID is missing from the token' });
    }

    // Fetch data from the external API
    const response = await fetch('http://scan-controller:8000/socials/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Check if scan_results contains an error
    if (data.scan_results && data.scan_results.error) {
      // If there's an error in scan_results, do not proceed with Prisma create
      return res.status(400).json({
        error: `Scan failed: ${data.scan_results.error}`,
      });
    }

    // Save the scan results to the database using Prisma
    const savedScan = await prisma.scan.create({
      data: {
        url_or_ip: target,
        scan_type: 'active', // or 'passive', depending on the logic
        scan_category: scanCategory,  // Use provided scanCategory, default to 'unknown'
        scan_results: data, // Save the API results
        user_id: userId,    // Link the scan to the authenticated user
        scan_category: 'social',
      },
    });

    res.status(200).json({
      message: `Processed link: ${target}`,
      fastapi_response: data,
      savedScan,
    });
  } catch (error) {
    console.error('Error posting the link:', error);
    res.status(500).json({ error: 'Failed to process the link' });
  }
});

app.post('/process-link', authenticateToken, async (req, res) => {
  const { target, scanCategory } = req.body;

  try {
    // Ensure userId is available from the token
    const userId = req.user?.userId; // Extract userId from token

    if (!userId) {
      return res.status(400).json({ error: 'User ID is missing from the token' });
    }

    // Fetch data from the external API
    const response = await fetch('http://scan-controller:8000/socials/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Check if scan_results contains an error
    if (data.scan_results && data.scan_results.error) {
      // If there's an error in scan_results, do not proceed with Prisma create
      return res.status(400).json({
        error: `Scan failed: ${data.scan_results.error}`,
      });
    }

    // Save the scan results to the database using Prisma
    const savedScan = await prisma.scan.create({
      data: {
        url_or_ip: target,
        scan_type: 'active', // or 'passive', depending on the logic
        scan_category: scanCategory,  // Use provided scanCategory, default to 'unknown'
        scan_results: data, // Save the API results
        user_id: userId,    // Link the scan to the authenticated user
        scan_category: 'social',
      },
    });

    res.status(200).json({
      message: `Processed link: ${target}`,
      fastapi_response: data,
      savedScan,
    });
  } catch (error) {
    console.error('Error posting the link:', error);
    res.status(500).json({ error: 'Failed to process the link' });
  }
});

// Procesar el link para Shodan

app.post('/process-link-shodan', authenticateToken, async (req, res) => {
  const { target, scanCategory } = req.body;

  try {
    // Ensure userId is available from the token
    const userId = req.user?.userId; // Extract userId from token

    if (!userId) {
      return res.status(400).json({ error: 'User ID is missing from the token' });
    }

    // Fetch data from the external API
    const response = await fetch('http://scan-controller:8000/osint/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Check if scan_results contains an error
    if (data.scan_results && data.scan_results.error) {
      // If there's an error in scan_results, do not proceed with Prisma create
      return res.status(400).json({
        error: `Scan failed: ${data.scan_results.error}`,
      });
    }

    // Save the scan results to the database using Prisma
    const savedScan = await prisma.scan.create({
      data: {
        url_or_ip: target,
        scan_type: 'active', // or 'passive', depending on the logic
        scan_category: scanCategory,  // Use provided scanCategory, default to 'unknown'
        scan_results: data, // Save the API results
        user_id: userId,    // Link the scan to the authenticated user
        scan_category: 'shodan',
      },
    });

    res.status(200).json({
      message: `Processed link: ${target}`,
      fastapi_response: data,
      savedScan,
    });
  } catch (error) {
    console.error('Error posting the link:', error);
    res.status(500).json({ error: 'Failed to process the link' });
  }
});

//GET SOCIALS OR MAYBE NOT?????

app.get('/scans', authenticateToken, async (req, res) => {
  try {
    const { scanType, scanCategory } = req.query; // Get filter params from query

    // Build filter criteria
    const filters = {};
    if (scanType) filters.scan_type = scanType;  // Filter by scan_type (active/passive)
    if (scanCategory) filters.scan_category = scanCategory;  // Filter by scan_category (social/web/etc.)

    // Fetch scans from the database with optional filtering
    const scans = await prisma.scan.findMany({
      where: filters,
    });

    res.status(200).json({
      message: 'Scans retrieved successfully',
      scans,
    });
  } catch (error) {
    console.error('Error retrieving scans:', error);
    res.status(500).json({ error: 'Failed to retrieve scans' });
  }
});

//INICIAR EL SERVIDOR
const PORT = process.env.PORTBACK || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});