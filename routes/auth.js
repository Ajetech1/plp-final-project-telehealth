const express = require("express");
const router = express.Router();
const patientsController = require("../controllers/patientsController");
// const doctorsController = require("../controllers/doctorsController");
// const appointmentsController = require("../controllers/appointmentsController");
// const adminController = require("../controllers/adminController");

router.post("/patient/register", patientsController.registerPatient);
router.post("/patient/login", patientsController.loginPatient);

// Define routes for patient profile management
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
