require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const bodyParser = require("body-parser");
const routes = require("./routes/auth");
const mysql = require("serverless-mysql");

// Initialize the Express app
const app = express();

// Configure serverless MySQL
const db = mysql({
  config: {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 3306, // Default MySQL port
  },
});

// Configure the session store
const sessionStore = new MySQLStore({}, db);

// Set up session middleware
app.use(
  session({
    key: "user_sid",
    secret: process.env.SESSION_SECRET,
    store: sessionStore, // Use the MySQL store for sessions
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/")));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/auth", routes);

app.get("/", (request, response) => {
  response.sendFile(path.join(__dirname, "index.html"));
});

app.get("/patient/register", (request, response) => {
  response.sendFile(path.join(__dirname, "signup.html"));
});

app.get("/patient/login", (request, response) => {
  response.sendFile(path.join(__dirname, "login.html"));
});

app.get("/dashboard", (request, response) => {
  response.sendFile(path.join(__dirname, "dashboard.html"));
});

app.get("/dashboard/setting", (request, response) => {
  response.sendFile(path.join(__dirname, "profilesettings.html"));
});

function authenticate(req, res, next) {
  console.log("Session Data:", req.session);
  if (!req.session.patient) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }
  next();
}

app.get("/api/dashboard", authenticate, (req, res) => {
  res.json(req.session.patient);
});

// Multer Configuration for Image Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Folder to store images
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename file with timestamp
  },
});

const upload = multer({ storage: storage });

// API to Handle Form Submission
app.post("/update-profile", upload.single("profileImage"), (req, res) => {
  const { first_name, last_name, phone, about } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  // Save user details in the database
  const sql = `INSERT INTO patients (first_name, last_name, phone, about, image) VALUES (?, ?, ?, ?, ?)`;
  db.query(
    sql,
    [first_name, last_name, phone, about, imagePath],
    (err, result) => {
      if (err) {
        console.error("Error inserting data:", err);
        return res.status(500).send("Error saving profile data.");
      }
      res.status(200).send("Profile updated successfully.");
    }
  );
});

// Logout route
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to logout." });
    }
    res.clearCookie("user_sid"); // Clear the session cookie
    res.status(200).json({ message: "Logout successful!" });
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

// Ensure the database connection is closed after each request (important for serverless)
process.on("exit", () => db.end());
