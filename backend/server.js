require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Database Connection Setup
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'expense_tracker',
  password: String(process.env.DB_PASSWORD || ''),
  port: Number(process.env.DB_PORT) || 5432,
});

// Categories Allowed in Database
const ALLOWED_CATEGORIES = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'];

// 1. GET ALL: Fetch all expenses (with formatted date YYYY-MM-DD)
app.get('/api/expenses', async (req, res) => {
  try {
    const query = `
      SELECT id, title, amount, category, TO_CHAR(date, 'YYYY-MM-DD') AS date 
      FROM expenses 
      ORDER BY id DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// 2. GET ONE: Fetch single expense by ID
app.get('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT id, title, amount, category, TO_CHAR(date, 'YYYY-MM-DD') AS date 
      FROM expenses 
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching single expense:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// 3. POST: Add a new expense
app.post('/api/expenses', async (req, res) => {
  const { title, amount, category, date } = req.body;

  // Validation
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Title is required and must not be empty.' });
  }

  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number.' });
  }

  if (!ALLOWED_CATEGORIES.includes(category)) {
    return res.status(400).json({ 
      error: `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}` 
    });
  }

  if (!date) {
    return res.status(400).json({ error: 'Date is required.' });
  }

  try {
    const query = `
      INSERT INTO expenses (title, amount, category, date)
      VALUES ($1, $2, $3, $4)
      RETURNING id, title, amount, category, TO_CHAR(date, 'YYYY-MM-DD') AS date
    `;
    const values = [title.trim(), numericAmount, category, date];
    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding expense:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// 4. PUT: Update an existing expense
app.put('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;
  const { title, amount, category, date } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Title is required and must not be empty.' });
  }

  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number.' });
  }

  if (!ALLOWED_CATEGORIES.includes(category)) {
    return res.status(400).json({ 
      error: `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}` 
    });
  }

  if (!date) {
    return res.status(400).json({ error: 'Date is required.' });
  }

  try {
    const query = `
      UPDATE expenses
      SET title = $1, amount = $2, category = $3, date = $4
      WHERE id = $5
      RETURNING id, title, amount, category, TO_CHAR(date, 'YYYY-MM-DD') AS date
    `;
    const values = [title.trim(), numericAmount, category, date, id];
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating expense:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// 5. DELETE: Remove an expense
app.delete('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      DELETE FROM expenses 
      WHERE id = $1 
      RETURNING id, title, amount, category, TO_CHAR(date, 'YYYY-MM-DD') AS date
    `;
    const result = await pool.query(query, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully', deletedExpense: result.rows[0] });
  } catch (err) {
    console.error('Error deleting expense:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});