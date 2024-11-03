const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const app = express();
const prisma = new PrismaClient();

app.use(express.json()); // For parsing JSON request to the body

//new user
app.post('/users', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Hash the password before saving 10 rrrrrr
    const password_hash = await bcrypt.hash(password, 10);

    // Create the user in the database with prisma uwu
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


app.get('/test', (req, res) => {
  res.send('Server is working!');
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
