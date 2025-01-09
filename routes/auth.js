const express = require("express");
const router = express.Router();
const patientsController = require("../controllers/patientsController");
const authenticate = require("../middleware/authenticate"); // Import the authenticate function
const multer = require("multer");
const fs = require("fs");

// Ensure uploads directory exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/"); // Folder for uploads
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and GIF are allowed."));
    }
  },
});

// const doctorsController = require("../controllers/doctorsController");
// const appointmentsController = require("../controllers/appointmentsController");
// const adminController = require("../controllers/adminController");

router.post("/patient/register", patientsController.registerPatient);
router.post("/patient/login", patientsController.loginPatient);

// Define routes for patient profile management
// Use authenticate as middleware in the routes
// Route for updating the profile
router.post(
  "/api/profile",
  authenticate,
  (req, res, next) => {
    upload.single("profilePicture")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  patientsController.updatePatientProfile
);

router.get("/profile/:id", patientsController.getPatientProfile);
router.put("/profile/:id", patientsController.updatePatientProfile);
router.get(
  "/profile/:id/appointments",
  patientsController.getAppointmentHistory
);
// router.post("/appointment/book", appointmentsController.bookAppointment);
// router.put("/appointment/cancel/:id", appointmentsController.cancelAppointment);
// router.post("/admin/add-doctor", adminController.addDoctor);
// router.get("/admin/appointments", adminController.viewAppointments);

module.exports = router;
