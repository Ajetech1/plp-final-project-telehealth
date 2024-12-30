require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const bodyParser = require("body-parser");
const routes = require("./routes/auth");

const app = express();
app.use(bodyParser.json());
app.use(
  session({
    key: "user_sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

//set-up middleware
app.use(express.static(path.join(__dirname, "/")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up static file serving
app.use(express.static(path.join(__dirname, "public")));

// set-up authentication routes
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

app.get("/api/dashboard", (req, res) => {
  if (!req.session.patient) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }
  res.json(req.session.patient);
});

// Logout route
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to logout." });
    }
    res.status(200).json({ message: "Logout successful!" });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
