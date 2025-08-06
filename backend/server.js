const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("./db");

const app = express();
const PORT = 4000;
const SECRET = "your_jwt_secret";

// Middlewares
app.use(cors({
  origin: "http://localhost:3000", // frontend URL
  credentials: true,
}));
app.use(express.json()); // built-in parser, no need for body-parser
app.use(cookieParser());

// Dummy concepts
const concepts = [
  { id: 1, title: "Recursion", description: "Basics of recursion", videoUrl: "#" },
  { id: 2, title: "Graph Theory", description: "DFS, BFS", videoUrl: "#" },
  { id: 3, title: "Dynamic Programming", description: "Memoization and Tabulation", videoUrl: "#" },
];

// Login route
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Query user from SQLite DB instead of dummy array
  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: "1d" });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: false, // true in production with HTTPS
    }).sendStatus(200);
  });
});

// Registration route
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  const hashed = await bcrypt.hash(password, 10);

  db.run("INSERT INTO users (email, password) VALUES (?, ?)", [email, hashed], function(err) {
    if (err) {
      // Handle duplicate email error (UNIQUE constraint)
      if (err.message.includes("UNIQUE")) {
        return res.status(400).json({ error: "User already exists" });
      }
      return res.status(500).json({ error: "Database error" });
    }
    res.sendStatus(201);
  });
});

// Auth middleware
function authMiddleware(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
}

// Protected route
app.get("/concepts", authMiddleware, (req, res) => {
  res.json(concepts);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
