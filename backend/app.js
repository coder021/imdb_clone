require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise'); // Using promise-based API
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// Database connection pool (better performance)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

// Test database connection
app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    res.json({ message: 'Database connection successful!', solution: rows[0].solution });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// First real endpoint: Get all movies
// Enhanced movies endpoint
app.get('/movies', async (req, res) => {
  try {
    // Get query parameters
    const { sort = 'imdb_score', genre, actor } = req.query;

    // Base query
    let query = `
      SELECT m.movie_id, m.movie_name, m.imdb_score, m.movie_release_date, m.poster_url
      FROM movie m
    `;

    // Add joins for filters
    if (genre) {
      query += ` JOIN movie_genre mg ON m.movie_id = mg.movie_id AND mg.genre = '${genre}'`;
    }
    if (actor) {
      query += ` JOIN acted_in ai ON m.movie_id = ai.movie_id JOIN actor a ON ai.actor_id = a.actor_id AND a.actor_name LIKE '%${actor}%'`;
    }

    // Add sorting
    query += ` ORDER BY ${sort} DESC LIMIT 100`;

    const [movies] = await pool.query(query);
    res.json(movies);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  console.log("Login request body:", req.body); // Log incoming request

  const { email, password } = req.body;
  console.log("Searching for user:", email);

  try {
    const [users] = await pool.query('SELECT * FROM user WHERE email = ?', [email]);
    console.log("Database query results:", users);

    if (users.length === 0) {
      console.log("User not found");
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];
    console.log("Found user:", user.email);
    const testCompare = await bcrypt.compare('admin123', user.password_hash);
    console.log('TEST compare with literal:', testCompare);
    
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    console.log("Password match result:", isPasswordValid); // true/false

    if (!isPasswordValid) {
      console.log("Password mismatch");
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // ... rest of your code
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/movies/:id', async (req, res) => {
  try {
    // 1. Get basic movie info
    const [movie] = await pool.query('SELECT * FROM movie WHERE movie_id = ?', [req.params.id]);
    
    if (movie.length === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // 2. Get genres
    const [genres] = await pool.query(
      'SELECT genre FROM movie_genre WHERE movie_id = ?', 
      [req.params.id]
    );

    // 3. Combine data
    const response = {
      ...movie[0],
      genres: genres.map(g => g.genre)
    };

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get reviews for a movie
app.get('/movies/:id/reviews', async (req, res) => {
  try {
    const [reviews] = await pool.query(`
      SELECT r.*, u.username 
      FROM review r
      JOIN user u ON r.user_id = u.user_id
      WHERE r.movie_id = ?
      ORDER BY r.review_date DESC
    `, [req.params.id]);
    
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit a new review
app.post('/movies/:id/reviews', async (req, res) => {
  try {
    const { userId, rating, content } = req.body;
    
    if (!userId || !rating) {
      return res.status(400).json({ error: 'User ID and rating are required' });
    }

    await pool.query(
      'INSERT INTO review (movie_id, user_id, rating, review_content) VALUES (?, ?, ?, ?)',
      [req.params.id, userId, rating, content]
    );

    res.status(201).json({ message: 'Review submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});