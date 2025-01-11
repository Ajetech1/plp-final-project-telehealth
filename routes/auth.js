const express = require("express");
const router = express.Router();
const patientsController = require("../controllers/patientsController");
const authenticate = require("../middleware/authenticate");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config(); // Load environment variables

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer-Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profile_pictures", // Folder name in Cloudinary
    format: async (req, file) => "jpg", // File format
    public_id: (req, file) =>
      `${Date.now()}-${file.originalname.split(".")[0]}`, // Public ID
  },
});

const upload = multer({
  storage: storage,
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

router.post("/patient/register", patientsController.registerPatient);
router.post("/patient/login", patientsController.loginPatient);

router.post(
  "/api/profile",
  authenticate,
  upload.single("profilePicture"),
  patientsController.updatePatientProfile
);

router.get("/profile/:id", patientsController.getPatientProfile);
router.put("/profile/:id", patientsController.updatePatientProfile);
router.get(
  "/profile/:id/appointments",
  patientsController.getAppointmentHistory
);

module.exports = router;
