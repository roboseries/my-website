// db.js
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./data.db", (err) => {
  if (err) {
    console.error("❌ Error opening database", err);
  } else {
    console.log("✅ Connected to SQLite database");
  }
});

// Create `users` table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`);

module.exports = db;
