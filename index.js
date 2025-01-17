require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const bodyParser = require("body-parser");
const routes = require("./routes/auth");
const db = require("./config/db");

// Initialize the Express app
const app = express();

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
app.use("/uploads", express.static("uploads"));

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
