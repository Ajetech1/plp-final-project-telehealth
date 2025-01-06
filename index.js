// require("dotenv").config();
// const express = require("express");
// const path = require("path");
// const session = require("express-session");
// const bodyParser = require("body-parser");
// const routes = require("./routes/auth");

// const app = express();
// app.use(bodyParser.json());
// app.use(
//   session({
//     key: "user_sid",
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//       secure: process.env.NODE_ENV === "production", // Set secure cookies in production
//       httpOnly: true,
//       sameSite: "strict", // Prevent CSRF attacks
//       maxAge: 1000 * 60 * 60 * 24, // Set session expiration (1 day here)
//     },
//   })
// );

// //set-up middleware
// app.use(express.static(path.join(__dirname, "/")));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Set up static file serving
// app.use(express.static(path.join(__dirname, "public")));

// // set-up authentication routes
// app.use("/auth", routes);

// app.get("/", (request, response) => {
//   response.sendFile(path.join(__dirname, "index.html"));
// });

// app.get("/patient/register", (request, response) => {
//   response.sendFile(path.join(__dirname, "signup.html"));
// });

// app.get("/patient/login", (request, response) => {
//   response.sendFile(path.join(__dirname, "login.html"));
// });

// app.get("/dashboard", (request, response) => {
//   response.sendFile(path.join(__dirname, "dashboard.html"));
// });

// // app.get("/api/dashboard", (req, res) => {
// //   if (!req.session.patient) {
// //     return res.status(401).json({ message: "Unauthorized. Please log in." });
// //   }
// //   res.json(req.session.patient);
// // });

// function authenticate(req, res, next) {
//   console.log("Session Data:", req.session);
//   if (!req.session.patient) {
//     return res.status(401).json({ message: "Unauthorized. Please log in." });
//   }
//   next();
// }

// app.get("/api/dashboard", authenticate, (req, res) => {
//   res.json(req.session.patient);
// });

// // Logout route
// app.post("/logout", (req, res) => {
//   req.session.destroy((err) => {
//     if (err) {
//       return res.status(500).json({ message: "Failed to logout." });
//     }
//     res.clearCookie("user_sid"); // Clear the session cookie
//     res.status(200).json({ message: "Logout successful!" });
//   });
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () =>
//   console.log(`Server running on http://localhost:${PORT}`)
// );

require("dotenv").config();
const express = require("express");
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
      secure: true, // Secure cookies in production
      httpOnly: true, // Prevent JavaScript access to cookies
      sameSite: "strict", // Prevent CSRF attacks
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

// Ensure the database connection is closed after each request (important for serverless)
process.on("exit", () => db.end());
