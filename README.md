#  Expense Tracker Application

A modern, full-stack web application for tracking and managing personal expenses. Built with a Node.js & Express RESTful API backend, PostgreSQL (Relational Database), and an interactive Bootstrap 5 frontend featuring dynamic charts and dark mode support.

---

## Features

- **Full CRUD Operations**: Create, read, update, and delete expenses seamlessly.
- **Interactive Dashboard**:
  - Summary cards displaying Total Amount, Expense Count, and Highest Expense.
  - Interactive bar chart showing total expenses per category powered by **Chart.js**.
- **Category Filtering**: Filter recorded expenses by category (*Food, Transport, Bills, Entertainment, Other*).
- **Dark Mode Support**: Toggle between Light and Dark themes with local storage persistence.
- **Form Validation & Security**: Client-side validation with HTML escaping for XSS protection.
- **RESTful API Backend**: Built with Express.js and persistent SQLite storage.

---

## Tech Stack

### Frontend
- **HTML5 & CSS3** (Custom UI with Burgundy/Pink aesthetic)
- **Bootstrap 5** (Responsive layout and components)
- **JavaScript (ES6+)** (Fetch API for async requests)
- **Chart.js** (Visual expense breakdown)

### Backend
- **Node.js**
- **Express.js** (REST API)
- **PostgreSQL** (Relational Database)
- **CORS & Body-Parser** (Middleware handling)

---

## Project Structure

```text
expense-tracker/
├── backend/
│   ├── node_modules/
│   ├── database
│   ├── package.json
│   └── server.js
└── frontend/
    ├── css/
    │   └── style.css
    ├── js/
    │   └── app.js
    └── index.html



https://drive.google.com/file/d/1nGsa5CS66_CAjAeeu-o_Y_OiVZWpCbuu/view?usp=sharing