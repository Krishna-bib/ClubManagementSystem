import crypto from 'crypto';
import nodemailer from 'nodemailer';
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { body, validationResult } from 'express-validator';
import { generateCertificate } from "./utils/generateCertificate.js";
import sendMail from "./utils/sendMail.js";
import mockDb from "./mockDb.js";
import { getMysqlSsl } from './utils/mysqlSsl.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const CORS_ORIGINS = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

if (IS_PRODUCTION) {
  if (process.env.USE_REAL_MYSQL !== 'true' || !process.env.DB_HOST || !process.env.DB_USER
    || !process.env.DB_PASS || !process.env.DB_NAME) {
    throw new Error('Production requires USE_REAL_MYSQL=true and complete MySQL credentials.');
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('Production requires a JWT_SECRET of at least 32 characters.');
  }
  if (!CORS_ORIGINS.length) {
    throw new Error('Production requires CORS_ORIGIN to list the deployed frontend origin(s).');
  }
  if (process.env.DB_SSL !== 'true' || !process.env.DB_SSL_CA) {
    throw new Error('Production requires verified MySQL TLS configured with DB_SSL=true and DB_SSL_CA.');
  }
}


app.use(cors({ origin: CORS_ORIGINS.length ? CORS_ORIGINS : true }));
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Add this near the top of your routes, after middleware
app.get('/api', (req, res) => {
  res.json({ message: 'API is running' });
});


app.use('/api', (req, res, next) => {
  console.log('API Request:', req.method, req.url);
  next();
});

// Database connection with seamless Demo Mode fallback
let db = mockDb;
const USE_REAL_MYSQL = process.env.USE_REAL_MYSQL === 'true';

if (USE_REAL_MYSQL) {
  try {
    db = mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      ssl: getMysqlSsl(),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    }).promise();
  } catch (err) {
    console.warn('Real MySQL pool init failed, falling back to Mock DB');
    db = mockDb;
  }
}

const startServer = async () => {
  try {
    if (db === mockDb) {
      console.log('🌟 [DEMO MODE ACTIVE] Running with Mock Database (demo_data.json) — No MySQL required!');
    } else {
      await db.query('SELECT 1');
      console.log('Database connected successfully to MySQL');
    }
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    if (IS_PRODUCTION) {
      console.error('Production database connection failed; refusing to start in demo mode:', err.message);
      process.exitCode = 1;
      return;
    }
    console.warn('⚠️ Real MySQL connection failed, falling back to Mock DB for presentation:', err.message);
    db = mockDb;
    app.listen(PORT, () => {
      console.log(`🚀 Server running in Demo Mode on port ${PORT}`);
    });
  }
};




// Authentication middleware
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access denied' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ error: 'Invalid token' });
      req.user = user;
      next();
    });
  } catch (error) {
    res.status(500).json({ error: 'Authentication error' });
  }
};


// Role-based authorization middleware
const checkAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};



// Auth routes
// Get event details

// Add this route for event registration
// Update the registration endpoint

// Get upcoming events
// Get upcoming events
// Add this route to your server.js

// Get registrations for a specific event
app.get(
  '/api/clubs/:clubId/events/:eventId/registrations',
  authenticateToken,
  checkAdmin,
  async (req, res) => {
    try {
      const { clubId, eventId } = req.params;

      // ✅ Ensure event belongs to this club
      const [[event]] = await db.query(
        'SELECT id FROM events WHERE id = ? AND club_id = ?',
        [eventId, clubId]
      );

      if (!event) {
        return res.status(404).json({
          error: 'Event not found in this club'
        });
      }

      // ✅ Fetch registrations
      const [registrations] = await db.query(`
        SELECT 
          r.*,
          u.name AS user_name,
          u.email AS user_email
        FROM registrations r
        JOIN users u ON r.user_id = u.id
        WHERE r.event_id = ?
        ORDER BY r.created_at DESC
      `, [eventId]);

      res.json(registrations);

    } catch (error) {
      console.error('Event registrations error:', error);
      res.status(500).json({
        error: 'Failed to fetch registrations'
      });
    }
  }
);

app.get("/api/clubs/:clubId/competition-events", authenticateToken, checkAdmin, async (req, res) => {
  const { clubId } = req.params;

  const [events] = await db.query(
    `SELECT id, title, date 
     FROM events 
     WHERE club_id = ? AND is_competition = TRUE
     ORDER BY date DESC`,
    [clubId]
  );

  res.json(events);
});


// club  description
app.get('/api/clubs', authenticateToken,checkAdmin,async (req, res) => {
  try {
    const [clubs] = await db.query(
      'SELECT id, name, description FROM clubs'
    );

    res.json(clubs);
  } catch (error) {
    console.error('Error fetching clubs:', error);
    res.status(500).json({ error: 'Failed to fetch clubs' });
  }
});

// create club
app.post("/api/createclubs", authenticateToken, checkAdmin,async (req, res) => {
  try {
    const { name, description, password } = req.body;

    // 1️⃣ Validate input
    if (!name || !password) {
      return res.status(400).json({
        error: "Club name and password are required"
      });
    }

    // 2️⃣ Check if club already exists
    const [existing] = await db.query(
      "SELECT id FROM clubs WHERE name = ?",
      [name]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        error: "Club already exists"
      });
    }

    // 3️⃣ Hash club password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Insert into DB
    await db.query(
      "INSERT INTO clubs (name, description, password) VALUES (?, ?, ?)",
      [name, description, hashedPassword]
    );

    // 5️⃣ Success
    res.status(201).json({
      message: "Club created successfully"
    });

  } catch (error) {
    console.error("Create club error:", error);
    res.status(500).json({
      error: "Failed to create club"
    });
  }
});


// view club 
// GET all clubs (public for users)
// Public route — NO login required
app.get("/api/clubs/public", async (req, res) => {
  try {
    const [clubs] = await db.query(
      "SELECT id, name, description FROM clubs ORDER BY name ASC"
    );
    res.json(clubs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch clubs" });
  }
});


// events
// GET events of specific club
app.get('/api/clubs/:clubId/basedevents', authenticateToken, async (req, res) => {
  try {
    const { clubId } = req.params;

    const [events] = await db.query(
      `SELECT * FROM events 
       WHERE club_id = ? 
       ORDER BY date DESC`,
      [clubId]
    );

    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch club events' });
  }
});

// event registrations
// Register for FREE event
app.post('/api/events/:id/eventregister', authenticateToken, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    const [[event]] = await db.query(
      'SELECT fee FROM events WHERE id = ?',
      [eventId]
    );

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.fee > 0) {
      return res.status(400).json({ error: 'Payment required' });
    }

    // prevent duplicate registration
    const [existing] = await db.query(
      'SELECT id FROM registrations WHERE event_id = ? AND user_id = ?',
      [eventId, userId]
    );

    if (existing.length) {
      return res.status(400).json({ error: 'Already registered' });
    }

    await db.query(
      `INSERT INTO registrations 
       (event_id, user_id, payment_status) 
       VALUES (?, ?, 'paid')`,
      [eventId, userId]
    );
    console.log(`Inserted registration for user ${userId} and event ${eventId}`); // Debug log
    await db.query('UPDATE events SET registration_count = registration_count + 1 WHERE id = ?', [eventId]);
    
    console.log(`User ${userId} registered for free event ${eventId}`); // Debug log


    
    res.json({ message: 'Registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// pay


// CREATE FAKE PAYMENT
app.post('/api/payments/fake/:eventId', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    const [[event]] = await db.query(
      'SELECT fee FROM events WHERE id = ?',
      [eventId]
    );

    if (!event || event.fee <= 0) {
      return res.status(400).json({ error: 'Invalid paid event' });
    }
   const [existing] = await db.query(
      'SELECT id FROM registrations WHERE event_id = ? AND user_id = ?',
      [eventId, userId]
    );

    if (existing.length) {
      return res.status(400).json({ error: 'Already registered' });
    }

    const paymentId = "FAKE_PAY_" + Date.now();
    await db.query(
      `INSERT INTO registrations
       (event_id, user_id, payment_id, payment_status)
       VALUES (?, ?, ?, 'paid')`,
      [eventId, userId, paymentId]
    );
    res.json({
      paymentId,
      amount: event.fee,
      message: "Proceed to fake payment"
    });
    console.log(`Initialized fake payment for event ${eventId}`); // Debug log
  } catch (err) {
    res.status(500).json({ error: 'Payment init failed' });
  }
});



// Verify payment & register
// VERIFY FAKE PAYMENT
app.post('/api/payments/fake/verify', authenticateToken, async (req, res) => {
  try {
    const { eventId, paymentId } = req.body;
    const userId = req.user.id;

    // prevent duplicate registration
    const [existing] = await db.query(
      'SELECT id FROM registrations WHERE event_id = ? AND user_id = ?',
      [eventId, userId]
    );

    if (existing.length) {
      return res.status(400).json({ error: 'Already registered' });
    }

    await db.query(
      `INSERT INTO registrations
       (event_id, user_id, payment_id, payment_status)
       VALUES (?, ?, ?, 'paid')`,
      [eventId, userId, paymentId]
    );

    res.json({ message: 'Payment successful & registered' });
  } catch (err) {
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Club password verification route
app.post("/api/clubs/verify", authenticateToken, checkAdmin,async (req, res) => {
  const { clubId, password } = req.body;

  const [rows] = await db.query(
    "SELECT password FROM clubs WHERE id = ?",
    [clubId]
  );

  if (!rows.length) {
    return res.status(404).json({ error: "Club not found" });
  }

  const valid = await bcrypt.compare(password, rows[0].password);

  if (!valid) {
    return res.status(401).json({ error: "Invalid password" });
  }

  res.json({ success: true });
});
// 

//club description
app.get('/api/clubs/:clubId', authenticateToken, checkAdmin, async (req, res) => {
  const { clubId } = req.params;

  const [[club]] = await db.query(
    "SELECT id, name, description FROM clubs WHERE id = ?",
    [clubId]
  );

  res.json(club);
});
//

// view events of only tht club
// GET events of a specific club
app.get("/api/clubs/:clubId/events",authenticateToken,async (req, res) => {
    try {
      const { clubId } = req.params;

      const [events] = await db.query(
        "SELECT * FROM events WHERE club_id = ? ORDER BY date DESC",
        [clubId]
      );

      res.json(events);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch club events" });
    }
  }
);


// Get past events
app.get('/api/events/past', authenticateToken, async (req, res) => {
  try {
    const [events] = await db.query(`
      SELECT 
        e.*,
        COUNT(DISTINCT r.id) as registration_count
      FROM events e
      LEFT JOIN registrations r ON e.id = r.event_id
      WHERE e.status = 'past'
      GROUP BY e.id
      ORDER BY e.date DESC
    `);

    res.json(events);
  } catch (error) {
    console.error('Error fetching past events:', error);
    res.status(500).json({ error: 'Failed to fetch past events' });
  }
});

app.post('/api/events/register/:id', authenticateToken, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    console.log('Registration attempt:', { eventId, userId }); // Debug log

    // Check if event exists
    const [event] = await db.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (!event.length) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if already registered
    const [existing] = await db.query(
      'SELECT * FROM registrations WHERE event_id = ? AND user_id = ?',
      [eventId, userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Create registration
    const [result] = await db.query(
      'INSERT INTO registrations (event_id, user_id, status) VALUES (?, ?, ?)',
      [eventId, userId, 'pending']
    );

    console.log('Registration successful:', result); // Debug log

    res.status(201).json({
      message: 'Successfully registered for the event',
      registrationId: result.insertId
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Failed to register for event',
      error: error.message
    });
  }
});

// Add this route to get all registrations
app.get('/api/events/registrations', authenticateToken, async (req, res) => {
  try {
    const [registrations] = await db.query(`
      SELECT 
        r.*,
        e.title as event_title,
        u.name as user_name,
        u.email as user_email
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `);

    res.json(registrations);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ 
      message: 'Failed to fetch registrations' 
    });
  }
});
app.get('/api/events/:id', authenticateToken, async (req, res) => {
  try {
    const [events] = await db.query(
      'SELECT * FROM events WHERE id = ?',
      [req.params.id]
    );
    
    if (!events.length) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(events[0]);
  } catch (error) {
    console.error('Event fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Register for event
app.post('/api/events/:id/register', authenticateToken, async (req, res) => {
  try {
    const { student_id } = req.body;
    const eventId = req.params.id;
    const userId = req.user.id;

    // Check if already registered
    const [existing] = await db.query(
      'SELECT * FROM event_registrations WHERE event_id = ? AND user_id = ?',
      [eventId, userId]
    );

    if (existing.length) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }

    // Create registration
    await db.query(
      'INSERT INTO event_registrations (event_id, user_id, student_id) VALUES (?, ?, ?)',
      [eventId, userId, student_id]
    );

    res.json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update the signup route

app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check email already exists
    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    if (existing.length) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO users (name, email, password, role, is_verified)
       VALUES (?, ?, ?, ?, TRUE)`,
      [name, email, hashedPassword, 'user']
    );

    res.status(201).json({
      message: 'Signup successful. You can now log in.'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Signup failed' });
  }
});


// Add this before your routes


// Add request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Login route
app.post('/api/login', async (req, res) => {

  try {
    const { email, password } = req.body;
     
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check user exists
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!users.length) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
   
       const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send response with user data
    res.json({ 
      token,
      role: user.role,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});
// Add these routes after your existing routes

// Admin Dashboard Routes
// Admin Dashboard route
// ...existing code...

// Events Routes
// Add this route to get all events
// GET events of a specific club (ADMIN)
app.get(
  '/api/clubs/:clubId/manageevents',
  authenticateToken,
  checkAdmin,
  async (req, res) => {
    try {
      const clubId = Number(req.params.clubId);

      const [events] = await db.query(`
        SELECT 
          e.*,
          COUNT(DISTINCT r.id) AS registration_count
        FROM events e
        LEFT JOIN registrations r ON e.id = r.event_id
        WHERE e.club_id = ?
        GROUP BY e.id
        ORDER BY e.date DESC
      `, [clubId]);

      res.json(events);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch club events' });
    }
  }
);

app.patch(
  '/api/clubs/:clubId/events/:eventId',
  authenticateToken,
  checkAdmin,
  async (req, res) => {
    try {
      const clubId = Number(req.params.clubId);
      const eventId = Number(req.params.eventId);
      const { status } = req.body;

      if (!Number.isInteger(clubId) || clubId < 1 || !Number.isInteger(eventId) || eventId < 1) {
        return res.status(400).json({ error: 'Invalid club or event ID.' });
      }
      if (!['upcoming', 'past'].includes(status)) {
        return res.status(400).json({ error: 'Status must be upcoming or past.' });
      }

      const [events] = await db.query(
        'SELECT id FROM events WHERE id = ? AND club_id = ?',
        [eventId, clubId]
      );
      if (!events.length) {
        return res.status(404).json({ error: 'Event not found in this club.' });
      }

      await db.query(
        'UPDATE events SET status = ? WHERE id = ? AND club_id = ?',
        [status, eventId, clubId]
      );
      res.json({ message: 'Event status updated successfully.', status });
    } catch (error) {
      console.error('Event status update error:', error);
      res.status(500).json({ error: 'Failed to update event status.' });
    }
  }
);


// Modify your event creation endpoint to include created_by
app.post(
  "/api/clubs/:clubId/addevents",
  authenticateToken,
  checkAdmin,
  async (req, res) => {
    try {
      const { clubId } = req.params;
      const {
        title,
        description,
        date,
        venue,
        time,
        event_type,
        coordinator_name,
        sponsors,
        status,
        fee,
        is_competition
      } = req.body;

      const containsLetter = value => typeof value === 'string' && /\p{L}/u.test(value);
      const parsedFee = fee === undefined || fee === '' ? 0 : Number(fee);
      const validDate = typeof date === 'string'
        && /^\d{4}-\d{2}-\d{2}$/.test(date)
        && !Number.isNaN(Date.parse(`${date}T00:00:00Z`))
        && new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) === date;

      if (!containsLetter(title) || !title.trim() || title.trim().length > 255) {
        return res.status(400).json({ error: 'Title must contain text and be no longer than 255 characters.' });
      }
      if (!containsLetter(description) || !description.trim() || description.trim().length > 10000) {
        return res.status(400).json({ error: 'Description must contain text and be no longer than 10000 characters.' });
      }
      if (!validDate) {
        return res.status(400).json({ error: 'Enter a valid event date.' });
      }
      if (!['technical', 'cultural', 'sports'].includes(event_type)) {
        return res.status(400).json({ error: 'Select a valid event type.' });
      }
      if (!containsLetter(venue) || !venue.trim() || venue.trim().length > 255) {
        return res.status(400).json({ error: 'Venue must contain text and be no longer than 255 characters.' });
      }
      if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time || '')) {
        return res.status(400).json({ error: 'Enter a valid event time.' });
      }
      if (!containsLetter(coordinator_name) || !coordinator_name.trim() || coordinator_name.trim().length > 255) {
        return res.status(400).json({ error: 'Coordinator name must contain text and be no longer than 255 characters.' });
      }
      if (sponsors !== undefined && (typeof sponsors !== 'string' || sponsors.length > 255
        || (sponsors.trim() && !containsLetter(sponsors)))) {
        return res.status(400).json({ error: 'Sponsor names must contain text and be no longer than 255 characters.' });
      }
      if (!Number.isFinite(parsedFee) || parsedFee < 0 || parsedFee > 99999999.99
        || !/^\d+(?:\.\d{1,2})?$/.test(String(fee === undefined || fee === '' ? 0 : fee))) {
        return res.status(400).json({ error: 'Fee must be a non-negative amount with up to two decimal places.' });
      }
      if (!['upcoming', 'past'].includes(status || 'upcoming')) {
        return res.status(400).json({ error: 'Select a valid event status.' });
      }
      if (is_competition !== undefined && typeof is_competition !== 'boolean') {
        return res.status(400).json({ error: 'Competition must be true or false.' });
      }

      // 🔍 CHECK FOR VENUE CONFLICT
      const [conflict] = await db.query(
        `SELECT id FROM events
         WHERE venue = ? AND date = ? AND time = ?`,
        [venue, date, time]
      );

      if (conflict.length > 0) {
        return res.status(400).json({
          error: "Another event is already scheduled at this venue on the same date and time. Please change schedule."
        });
      }

      // ✅ NO CONFLICT → INSERT EVENT
      await db.query(
        `INSERT INTO events 
        (title, description, date, venue, time, status, club_id, created_by,
         is_competition, event_type, coordinator_name, sponsors, fee)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title.trim(),
          description.trim(),
          date,
          venue.trim(),
          time,
          status || "upcoming",
          clubId,
          req.user.id,
          is_competition || false,
          event_type,
          coordinator_name.trim(),
          sponsors?.trim() || null,
          parsedFee
        ]
      );

      res.status(201).json({ message: "Event added successfully" });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to add event" });
    }
  }
);

app.get("/api/clubs/:clubId/events/:eventId/winners", async (req,res)=>{
  const { eventId } = req.params;

  const [winners] = await db.query(`
    SELECT u.name, r.position
    FROM registrations r
    JOIN users u ON r.user_id=u.id
    WHERE r.event_id=? AND r.position IN ('winner','runner')`,
    [eventId]
  );

  res.json(winners);
});



app.delete('/api/clubs/:clubId/events/:eventId', authenticateToken, checkAdmin, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // First delete all registrations for this event
    await connection.query('DELETE FROM registrations WHERE event_id = ?', [req.params.eventId]);
    // Then delete the event
    await connection.query('DELETE FROM events WHERE id = ? AND club_id = ?', [req.params.eventId, req.params.clubId]);
    
    await connection.commit();
    res.status(204).send();

  } catch (error) {
    await connection.rollback();
    console.error('Event deletion error:', error);
    res.status(500).json({ 
      error: 'Failed to delete event',
      message: 'Cannot delete event with active registrations'
    });
  } finally {
    connection.release();
  }
});

app.patch("/api/clubs/:clubId/registrations/:id/position", authenticateToken, checkAdmin, async (req, res) => {
  const { id } = req.params;
  const { position } = req.body; // winner / runner

  const [[reg]] = await db.query("SELECT event_id FROM registrations WHERE id=?", [id]);

  // Remove previous winner/runner
  await db.query(
    "UPDATE registrations SET position='participant' WHERE event_id=? AND position=?",
    [reg.event_id, position]
  );

  await db.query("UPDATE registrations SET position=? WHERE id=?", [position, id]);

  res.json({ message: "Position updated" });
});



app.get('/api/admin/dashboard', authenticateToken, checkAdmin, async (req, res) => {
  try {
    console.log('Admin dashboard request received');

    // Default values in case of no data
    const stats = {
      totalEvents: 0,
      totalUsers: 0,
      totalRegistrations: 0
    };

    // Get counts
    const [[eventCount]] = await db.query('SELECT COUNT(*) as count FROM events');
    const [[userCount]] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'user'");
    const [[regCount]] = await db.query('SELECT COUNT(*) as count FROM registrations');

    stats.totalEvents = eventCount.count;
    stats.totalUsers = userCount.count;
    stats.totalRegistrations = regCount.count;

    // Get recent data - use date instead of created_at for events
    const [events] = await db.query('SELECT * FROM events ORDER BY date DESC LIMIT 5');
    const [registrations] = await db.query(
      `SELECT r.*, e.title as event_title, u.name as user_name 
       FROM registrations r 
       JOIN events e ON r.event_id = e.id 
       JOIN users u ON r.user_id = u.id 
       ORDER BY r.created_at DESC LIMIT 5`
    );

    res.json({
      stats,
      recentEvents: events,
      recentRegistrations: registrations
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Server error fetching admin dashboard data' });
  }
});

// User Dashboard Routes
app.get('/api/user/dashboard', authenticateToken, async (req, res) => {
  try {
    // Get user's registration count
    const [[registrationCount]] = await db.query(
      'SELECT COUNT(*) as count FROM registrations WHERE user_id = ?',
      [req.user.id]
    );
    
    // Get user's upcoming events
    const [upcomingEvents] = await db.query(
      `SELECT e.* 
       FROM events e 
       JOIN registrations r ON e.id = r.event_id 
       WHERE r.user_id = ? AND e.date >= CURDATE() 
       ORDER BY e.date ASC LIMIT 5`,
      [req.user.id]
    );
    
    // Get user's past events
    const [pastEvents] = await db.query(
      `SELECT e.* 
       FROM events e 
       JOIN registrations r ON e.id = r.event_id 
       WHERE r.user_id = ? AND e.date < CURDATE() 
       ORDER BY e.date DESC LIMIT 5`,
      [req.user.id]
    );

    // Get available upcoming events
    const [availableEvents] = await db.query(
      `SELECT e.* 
       FROM events e 
       WHERE e.date >= CURDATE() 
       AND e.id NOT IN (
         SELECT event_id FROM registrations WHERE user_id = ?
       ) 
       ORDER BY e.date ASC LIMIT 5`,
      [req.user.id]
    );

    res.json({
      stats: {
        totalRegistrations: registrationCount.count
      },
      upcomingEvents,
      pastEvents,
      availableEvents
    });
  } catch (error) {
    console.error('User dashboard error:', error);
    res.status(500).json({ error: 'Server error fetching user dashboard data' });
  }
});

// Add these utility routes for both dashboards
app.get('/api/events/upcoming', authenticateToken, async (req, res) => {
  try {
    const [events] = await db.query(
      'SELECT * FROM events WHERE date >= CURDATE() ORDER BY date ASC'
    );
    res.json(events);
  } catch (error) {
    console.error('Upcoming events fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`); // Log all requests
  next();
});

// Add this before your routes
app.use('/api', (req, res, next) => {
  console.log('API Request:', req.method, req.url);
  next();
});



// Add this route before your error handlers
app.get('/api/events/past', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching past events...'); // Debug log
    
    const [events] = await db.query(`
      SELECT 
        e.*,
        COUNT(DISTINCT r.id) as registration_count
      FROM events e
      LEFT JOIN registrations r ON e.id = r.event_id
      WHERE e.status = 'past' OR e.date < CURDATE()
      GROUP BY e.id
      ORDER BY e.date DESC
    `);

    console.log('Found past events:', events.length);
    res.json(events);

  } catch (error) {
    console.error('Past events error:', error);
    res.status(500).json({ error: 'Failed to fetch past events' });
  }
});


app.post('/api/events/:id/register', authenticateToken, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    const [existing] = await db.execute(
      'SELECT * FROM registrations WHERE event_id = ? AND user_id = ?',
      [eventId, userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }

    await db.execute(
      'INSERT INTO registrations (event_id, user_id) VALUES (?, ?)',
      [eventId, userId]
    );

    res.json({ message: 'Successfully registered' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


app.post("/api/clubs/:clubId/events/:eventId/send-certificates", authenticateToken, checkAdmin, async (req,res)=>{
  const { eventId } = req.params;

  const [[event]] = await db.query("SELECT title FROM events WHERE id=?", [eventId]);

  const [participants] = await db.query(`
    SELECT r.id, r.position, u.name, u.email
    FROM registrations r
    JOIN users u ON r.user_id=u.id
    WHERE r.event_id=?`, [eventId]);

  for(const p of participants){
    const certPath = await generateCertificate(p.name, event.title, p.position);
    await sendMail(p.email, p.name, event.title, p.position, certPath);

    await db.query(
      "UPDATE registrations SET certificate_sent=TRUE, certificate_path=? WHERE id=?",
      [certPath, p.id]
    );
  }

  await db.query("UPDATE events SET results_declared=TRUE WHERE id=?", [eventId]);

  res.json({ message: "Certificates sent & results declared" });
});


// Update registrations route
app.get('/api/registrations', authenticateToken, async (req, res) => {
  try {
    const query = req.user.role === 'admin' 
      ? `SELECT r.*, e.title as event_title, u.name as user_name, u.email as user_email 
         FROM registrations r 
         JOIN events e ON r.event_id = e.id 
         JOIN users u ON r.user_id = u.id`
      : `SELECT r.*, e.title as event_title, u.name as user_name, u.email as user_email 
         FROM registrations r 
         JOIN events e ON r.event_id = e.id 
         JOIN users u ON r.user_id = u.id 
         WHERE r.user_id = ?`;

    const params = req.user.role === 'admin' ? [] : [req.user.id];
    const [results] = await db.execute(query, params);
    res.json(results);
  } catch (error) {
    console.error('Registrations fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add this error handling middleware at the end of your routes
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.url}` });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});
startServer();
