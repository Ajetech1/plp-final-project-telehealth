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
const bodyParser = require("body-parser");
const Redis = require("ioredis");
const RedisStore = require("connect-redis")(session);
const routes = require("./routes/auth");

// Initialize Redis client
const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD, // Add password if Redis requires authentication
});

redisClient.on("error", (err) => console.error("Redis error:", err));

const app = express();
app.use(bodyParser.json());

// Set up session with Redis store
app.use(
  session({
    store: new RedisStore({ client: redisClient }), // Use Redis store
    key: "user_sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Set secure cookies in production
      httpOnly: true,
      sameSite: "strict", // Prevent CSRF attacks
    },
  })
);

// Middleware for serving static files
app.use(express.static(path.join(__dirname, "/")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up static file serving
app.use(express.static(path.join(__dirname, "public")));

// Set up authentication routes
app.use("/auth", routes);

// Define routes
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

// Authentication middleware
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
