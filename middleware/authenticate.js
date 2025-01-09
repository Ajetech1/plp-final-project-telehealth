// middleware/authenticate.js

function authenticate(req, res, next) {
  if (!req.session.patient) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }
  next(); // If logged in, proceed to the next route handler
}

module.exports = authenticate;
